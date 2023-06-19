const tutorialsRepo = require('tutorials/repositories/tutorials.repository');
// const productRepo = require('product/repositories/product.repository');
const _ = require('underscore');
const { default: mongoose } = require('mongoose');
const config = require(appRoot + '/config/index');
const utils = require(appRoot + '/helper/utils');
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class TutorialsController {
    constructor() { }

    /*
    // @Method: list
    // @Description: Tutorials list
    */
    /* async list(req, res) {
        try {
            const result = await tutorialsRepo.getAllByField({ 
                isDeleted: false, 
                status: 'Active',
                productId: req.params.productId
            })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Tutorial list fetched.')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Tutorial not found')();
            }     
        	
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    } */


    async list(req, res) {
        try {
            let result = [];
            let is_lang_exists = await tutorialsRepo.getAllByField({ translate: { $elemMatch: { shortcode: req.query.lang } }, "productId": mongoose.Types.ObjectId(req.params.productId) })
            if (!_.isEmpty(is_lang_exists)) {
                let params = {
                    isDeleted: false,
                    status: 'Active',
                    productId: mongoose.Types.ObjectId(req.params.productId),
                    translate: { $elemMatch: { shortcode: req.query.lang } }
                }
                result = await tutorialsRepo.getAllByFieldLanguage(params, req.query.lang);
            } else {
                let params = {
                    isDeleted: false,
                    status: 'Active',
                    productId: mongoose.Types.ObjectId(req.params.productId),
                    shortcode: "enUS"
                }
                result = await tutorialsRepo.getAllByFieldCustom(params);
            }

            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Tutorial list fetched.')(result);
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /*
    // @Method: details
    // @Description: Tutorial details
    */
    async details(req, res) {
        try {
            const tutorialId = req.params.id;
            const result = await tutorialsRepo.getById(tutorialId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Tutorial details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Tutorial not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

}

module.exports = new TutorialsController();