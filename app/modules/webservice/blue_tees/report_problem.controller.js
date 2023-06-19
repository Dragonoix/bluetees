const mongoose = require('mongoose');
const problemRepo = require('report_problem/repositories/report_problem.repository');
const gorgiasController = require('webservice/blue_tees/gorgias.controller');
const userRepo = require('user/repositories/user.repository');
const settingsRepo = require('setting/repositories/setting.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const mailHelper = require(appRoot + '/helper/mailer');
const fs = require('fs');
const Email = require('email-templates');


class problemController {
    constructor() { }

    /* @Method: List 
    // @Description: Product list
    */
    async Parentlist(req, res) {
        try {
            let result = [];
            let is_lang_exists = await problemRepo.getAllByField({ translate: { $elemMatch: { shortcode: req.query.lang } }, parent_problemId: null })
            if (!_.isEmpty(is_lang_exists)) {
                let params = {
                    isDeleted: false,
                    status: 'Active',
                    parent_problemId: null,
                    translate: { $elemMatch: { shortcode: req.query.lang } }
                }
                result = await problemRepo.getAllByFieldLanguage(params, req.query.lang);
            } else {
                let params = {
                    isDeleted: false,
                    status: 'Active',
                    shortcode: "enUS",
                    parent_problemId: null
                }
                result = await problemRepo.getAllByFieldCustom(params);
            }
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Parent Problem list fetched.')(result);
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: List 
   // @Description: Child list
   */

    async Childlist(req, res) {
        try {
            let result = [];
            let is_lang_exists = await problemRepo.getAllByField({ translate: { $elemMatch: { shortcode: req.query.lang } }, parent_problemId: mongoose.Types.ObjectId(req.params.id) })
            if (!_.isEmpty(is_lang_exists)) {
                let params = {
                    isDeleted: false,
                    status: 'Active',
                    parent_problemId: mongoose.Types.ObjectId(req.params.id),
                    translate: { $elemMatch: { shortcode: req.query.lang } }
                }
                result = await problemRepo.getAllByFieldLanguage(params, req.query.lang);
            } else {
                let params = {
                    isDeleted: false,
                    status: 'Active',
                    parent_problemId: mongoose.Types.ObjectId(req.params.id),
                    shortcode: "enUS"
                }
                result = await problemRepo.getAllByFieldCustom(params);
            }
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Child Problem list fetched.')(result);
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: All List 
    // @Description: All list of Problems
    */
    async list(req, res) {
        try {
            const result = await problemRepo.getAllByFieldCustomQuery(req);
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'List details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry List not present')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: Report Create
    // @Description: Create a Problem Reports
    */
    async createReport(req, res) {
        try {
            req.body.userId = req.user._id;
            const checkProblemId = req.params.id
            if (!_.has(req.body, 'problemId') || ((_.has(req.body, 'problemId') && (_.isUndefined(req.body.problemId)) || _.isNull(req.body.problemId) || _.isEmpty(req.body.problemId.trim())))) {
                return requestHandler.throwError(400, 'Bad Request', 'Problem ID is required!')();
            }
            if (!_.has(req.body, 'problem') || ((_.has(req.body, 'problem') && (_.isUndefined(req.body.problem)) || _.isNull(req.body.problem) || _.isEmpty(req.body.problem.trim())))) {
                return requestHandler.throwError(400, 'Bad Request', 'Problem is required!')();
            }

            let problemTree = await problemRepo.getProblemTree(req.body.problemId);

            let submitType = await problemRepo.getById(checkProblemId);

            let reporting_email_address = await settingsRepo.getAllByField({ isDeleted: false });

            // get webskitters email address from settings
            var webskitters_email = reporting_email_address.filter(function (el) {
                return el.setting_slug === 'webskitters_report_email';
            });
            if (webskitters_email.length > 0) {
                webskitters_email = webskitters_email[0].setting_value;
            }


            // get igolf email address from settings
            var igolf_email = reporting_email_address.filter(function (el) {
                return el.setting_slug === 'igolf_report_email';
            });
            if (igolf_email.length > 0) {
                igolf_email = igolf_email[0].setting_value;
            }

            let result = {};

            let templateDir = `${projectRoot}/app/views/email-templates/report-issue/html`

            const email = new Email({
                message: {
                    from: process.env.FROM_EMAIL
                },
                transport: {
                    jsonTransport: true
                },
                views: {
                    root: templateDir,
                    options: {
                        extension: 'ejs'
                    }
                }
            });

            if (!_.isEmpty(submitType) && !_.isEmpty(submitType.parent_problemId) && submitType.parent_problemId.slug == 'app_problems') {
                if (!_.has(req.body, "courseName") || req.body.courseName == "") {
                    req.body.courseName = "N/A"
                }
                // let template = `<html><body><p><b>Hello Webskitters Team,</b></p><p>The issue found has been mentioned below: </p>` + `
                // <p>Course Name: <b>`+ req.body.courseName + `</b></p>` +
                //     `<p>Issue: <b>` + req.body.problem + `</b></p>` +
                //     `<p>Thank you,</p><p>Blue Tees</p></body></html>`

                let locals = {
                    toName: "Webskitters",
                    course: req.body.courseName,
                    issue: req.body.problem
                }
                let template = await email.render(templateDir, locals);


                let createEmail = await mailHelper.createTemplate(problemTree.tree, template);
                let sendMail = await mailHelper.sendMail(process.env.FROM_EMAIL, 'Blue Tees', 'Blue Tees - ' + problemTree.tree, webskitters_email, createEmail.id);
                // console.log(sendMail, "app problem mail");
            }

            if (!_.isEmpty(submitType) && submitType.send_to_gorgias == true) {

                if (req.user.gorgias_id != null) {
                    if (req.user.email != null && req.user.email != "" && req.user.email != undefined) {
                        req.body.send_to_gorgias = true;
                        let ticketData = {
                            customer: { id: req.user.gorgias_id },
                            messages: [
                                {
                                    sender: { id: req.user.gorgias_id, email: req.user.email },
                                    via: 'api',
                                    channel: 'api',
                                    body_text: req.body.problem,
                                    created_datetime: new Date(),
                                    from_agent: false,
                                    subject: problemTree.tree
                                }
                            ],
                            channel: 'email',
                            from_agent: false,
                            language: 'en',
                            last_message_datetime: new Date(),
                            last_received_message_datetime: new Date()
                        }
                        let gorgiasReturn = await gorgiasController.createTicket(ticketData);

                        req.body.gorgias_ticket_id = gorgiasReturn.data.id;
                        // result = await problemRepo.ReportProblemsave(req.body);
                        // requestHandler.sendSuccess(res, 'Problem reported successfully')(result);
                    } else {
                        // result = await problemRepo.ReportProblemsave(req.body);
                        // requestHandler.sendSuccess(res, 'Report not sent to Gorgias as Email ID is required')(result);
                    }
                } else {

                    if (req.user.email != null && req.user.email != "" && req.user.email != undefined) {
                        /*gorgias is exist check condition*/
                        let userExists = await gorgiasController.userExistsForGorgias(req.user.email);
                        req.body.send_to_gorgias = true;
                        let gorgiaId = 0;
                        if (userExists.length > 0) {
                            await userRepo.updateById({ gorgias_id: userExists[0].id }, req.user._id);
                            gorgiaId = userExists[0].id;
                        } else {
                            let createCustomer = await gorgiasController.createCustomer(req);
                            await userRepo.updateById({ gorgias_id: createCustomer.data.id }, req.user._id);
                            gorgiaId = createCustomer.data.id;
                        }

                        let ticketData = {
                            customer: { id: gorgiaId },
                            messages: [
                                {
                                    sender: { id: gorgiaId, email: req.user.email },
                                    via: 'api',
                                    channel: 'api',
                                    body_text: req.body.problem,
                                    created_datetime: new Date(),
                                    from_agent: false,
                                    subject: problemTree.tree
                                }
                            ],
                            channel: 'email',
                            from_agent: false,
                            language: 'en',
                            last_message_datetime: new Date(),
                            last_received_message_datetime: new Date()
                        }
                        let gorgiasReturn = await gorgiasController.createTicket(ticketData);
                        req.body.gorgias_ticket_id = gorgiasReturn.data.id;
                        // result = await problemRepo.ReportProblemsave(req.body);
                        // requestHandler.sendSuccess(res, 'Problem reported successfully')(result);
                    }
                }

            }

            if (!_.isEmpty(submitType) && submitType.send_to_igolf == true) {
                if (!_.has(req.body, "courseName") || req.body.courseName == "") {
                    req.body.courseName = "N/A"
                }
                req.body.send_to_igolf = true;
                // let template = `<html><body><p><b>Hello Team Igolf,</b></p><p>The issue found has been mentioned below: </p>` + `
                // <p>Course Name: <b>`+ req.body.courseName + `</b></p>` +
                //     `<p>Issue: <b>` + req.body.problem + `</b></p>` +
                //     `<p>Thank you,</p><p>Blue Tees</p></body></html>`


                let locals = {
                    toName: "Igolf",
                    course: req.body.courseName,
                    issue: req.body.problem
                }
                let template = await email.render(templateDir, locals);


                let createEmail = await mailHelper.createTemplate(problemTree.tree, template);
                let sendMail = await mailHelper.sendMail(process.env.FROM_EMAIL, 'Blue Tees', 'Blue Tees - ' + problemTree.tree, igolf_email, createEmail.id); //mail sent
                // console.log(sendMail);

                // result = await problemRepo.ReportProblemsave(req.body);
                // requestHandler.sendSuccess(res, 'Problem reported successfully')(result);
            }

            result = await problemRepo.ReportProblemsave(req.body);
            requestHandler.sendSuccess(res, 'Problem reported successfully')(result);
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    async problemByLevel(req, res) {
        try {
            let problem = await problemRepo.getAllProblemsByLevel(req);
            if (!_.isEmpty(problem)) {
                return requestHandler.sendSuccess(res, 'Problems Fetched Successfully.')(problem);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Problem not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


}

module.exports = new problemController();