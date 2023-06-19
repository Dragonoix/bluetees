const mongoose = require('mongoose');
const skillRepo = require('skill/repositories/skill_level.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class SkillController {
    constructor() {}

    /* @Method: details
    // @Description: Skill details
    */
    async list(req, res) {
		try {
            let result = [];
            if (req.query.lang && req.query.lang != "en") {
                result = await skillRepo.getAllByFieldLanguage(req.query.lang);
            } else{
                result = await skillRepo.getAllByFieldCustom({isDeleted: false, status: "Active"});
            }

            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Skill Level details')(result);
            } else {
                result = await skillRepo.getAllByFieldCustom({isDeleted: false, status: "Active"});
                return requestHandler.sendSuccess(res, 'Skill Level details')(result);
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

     /* @Method: details
    // @Description: Skill details
    */
    async details(req, res) {
		try {
			const skillId = req.params.id;
			const result = await skillRepo.getById(skillId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Skill details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry skill not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


}

module.exports = new SkillController();