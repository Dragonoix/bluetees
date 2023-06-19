const mongoose = require('mongoose');
const mediaRepo = require('social_media/repositories/social_media.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class MediaController {
    constructor() {}

    /* @Method: Lists
    // @Description: Social Media full Lists
    */
    async list(req, res) {
		try {
			const result = await mediaRepo.getAllByField({ isDeleted: false, status: 'Active' })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'All Social Media details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Social Media details not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

     /* @Method: details
    // @Description: Social Media full details
    */
    async details(req, res) {
		try {
			const mediaId = req.params.id;
			const result = await mediaRepo.getById(mediaId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Social Media details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry details not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


}

module.exports = new MediaController();