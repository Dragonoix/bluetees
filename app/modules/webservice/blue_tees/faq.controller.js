const mongoose = require('mongoose');
const faqRepo = require('faq/repositories/faq.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class faqController {
    constructor() { }

    /*
    // @Method: list
    // @Description: FAQ list
    */
    /* async list(req, res) {
        try {
            const result = await faqRepo.getAllByField({ isDeleted: false, status: 'Active' })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'FAQ details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry FAQ is not present')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    } */


    /* async list(req, res) {
        try {
            let result = [];
            if (req.query.lang && req.query.lang != "en") {
                result = await faqRepo.getAllByFieldLanguage(req.query.lang);
            } else {
                result = await faqRepo.getAllByFieldCustom({ isDeleted: false, status: "Active" });
            }

            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'FAQ details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry FAQ is not present')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    } */

    async list(req, res) {
        try {
            let result = [];
            let is_lang_exists = await faqRepo.getAllByField({ translate: { $elemMatch: { shortcode: req.query.lang } } })
            let params = {
                isDeleted: false, status: "Active"
            }
            if (!_.isEmpty(is_lang_exists)) {
                result = await faqRepo.getAllByFieldLanguage(params, req.query.lang);
            } else {
                let params = {
                    shortcode: "enUS",
                    isDeleted: false,
                    status: "Active"
                }
                result = await faqRepo.getAllByFieldCustom(params);
            }

            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'FAQ details')(result);
            } else {
                return requestHandler.sendSuccess(res, 'FAQ details not fetched')(result);
            }



        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: details
    // @Description: FAQ details
    */
    async details(req, res) {
        try {
            const faqId = req.params.id;
            const result = await faqRepo.getById(faqId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'FAQ details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry FAQ not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }



}

module.exports = new faqController();