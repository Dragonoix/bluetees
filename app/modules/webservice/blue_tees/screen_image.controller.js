const imageRepo = require('screen_image/repositories/image.repository');
const _ = require('underscore');
const { default: mongoose } = require('mongoose');
const config = require(appRoot +'/config/index');
const utils = require(appRoot +'/helper/utils');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class imageController {
    constructor() {}

    /*
    // @Method: list
    // @Description: Images list
    */
    async list(req, res) {
		try {
			const result = await imageRepo.getAllByField({ isDeleted: false, status: 'Active' })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Login Screen Image details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Images is not present')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

}

module.exports = new imageController();