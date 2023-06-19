const mongoose = require('mongoose');
const faqRepo = require('faq/repositories/faq.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// aws bucket //
const config = require(appRoot + '/config/index')
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();
class faqController {
    constructor() { }

    /*
    // @Method: list
    // @Description: FAQ list
    */
    async list(req, res) {
        try {
            const result = await faqRepo.getAllByField({ isDeleted: false })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'FAQ details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry FAQ is not present')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: getAllFaqList
    // @Description: To get all the FAQ List from DB
    */
    async getAllFaq(req, res) {
        try {
            let faq = await faqRepo.getAllFaqs(req);
            let data = {
                "recordsTotal": faq.total,
                "recordsLimit": faq.limit,
                "pages": faq.pages,
                "page": faq.page,
                "data": faq.docs
            };
            return requestHandler.sendSuccess(res, 'FAQ List Fetched')(data);
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /**
      * @Method create
      * @Description To Add question, answer and Youtube or Video URL Link
     */
    async create(req, res) {
        try {
            if (!req.body.question) {
                requestHandler.throwError(400, 'bad request', 'Question is required')();
            } else if (!req.body.answer) {
                requestHandler.throwError(400, 'bad request', 'Answer is required')();
            } else {

                /* if (!_.isEmpty(req.files) && req.files.length > 0) {
                    req.files.map(data => {
                        if (data.fieldname === 'image') {
                            req.body.image = data.filename;
                        }
                    })
                } */

                let uploaded_document_name = '';
                let uploaded_doc_array = [];
                if (req.files && req.files.length > 0) {
                    uploaded_doc_array = req.files[0].key.split("/");
                    uploaded_document_name = uploaded_doc_array[1];
                    req.body.image = uploaded_document_name;
                }


                req.body.question = req.body.question.trim();
                req.body.answer = req.body.answer.trim();
                let isQuestionExists = await faqRepo.getByField({ 'question': { $regex: req.body.question.trim(), $options: "i" }, isDeleted: false });
                if (isQuestionExists) {
                    requestHandler.throwError(400, 'bad request', 'This question is already exists')();
                } else {
                    let saveData = await faqRepo.save(req.body);
                    if (!_.isEmpty(saveData) && saveData._id) {
                        return requestHandler.sendSuccess(res, 'FAQ Added successfully')(saveData);
                    } else {
                        requestHandler.throwError(400, 'bad request', 'FAQ Not Added successfully')();
                    }
                }
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


    /* @Method: update
    // @Description: FAQ edit and update
    */
    async update(req, res) {
        try {
            const faqId = mongoose.Types.ObjectId(req.params.id);
            const findFAQ = await faqRepo.getById(faqId);
            if (!_.isEmpty(findFAQ)) {

                let uploaded_document_name = '';
                let uploaded_doc_array = [];
                if (req.files && req.files.length > 0) {
                    await s3.deleteObject({ Bucket: config.aws.bucket, Key: "bluetees-app/" + findFAQ.image }).promise();
                    uploaded_doc_array = req.files[0].key.split("/");
                    uploaded_document_name = uploaded_doc_array[1];
                    req.body.image = uploaded_document_name;
                }

                const result = await faqRepo.updateById(req.body, faqId);
                requestHandler.sendSuccess(res, 'FAQ updated successfully')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry FAQ not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: statusChange
    // @Description: FAQ Status Change Active/Inactive
    */
    async statusChange(req, res) {
        try {
            const faqId = req.params.id;
            const result = await faqRepo.getById(faqId)
            if (!_.isEmpty(result)) {
                let faqStatus = (result.status === "Active") ? "Inactive" : "Active";
                let faqUpdate = await faqRepo.updateById({ status: faqStatus }, result._id)
                requestHandler.sendSuccess(res, 'Faq status has changed successfully')(faqUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry FAQ not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };



    /* @Method: delete
    // @Description: FAQ delete
    */
    async delete(req, res) {
        try {
            const faqId = mongoose.Types.ObjectId(req.params.id);
            const faqDetails = await faqRepo.getById(faqId);
            if (!_.isEmpty(faqDetails)) {
                const updateFAQ = await faqRepo.updateById({ isDeleted: true }, faqId);
                if (updateFAQ && updateFAQ._id) {
                    requestHandler.sendSuccess(res, 'FAQ deleted successfully')({ deleted: true });
                } else {
                    requestHandler.throwError(400, 'bad request', 'Something went wrong!')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry data not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


}

module.exports = new faqController();