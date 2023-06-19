const mongoose = require('mongoose');
const goalRepo = require('goal/repositories/goal.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class GoalController {
    constructor() {}

    /* @Method: details
    // @Description: Goal details
    */
    async list(req, res) {
		try {
            let result = [];
            if (req.query.lang && req.query.lang != "en") {
                result = await goalRepo.getAllByFieldLanguage(req.query.lang);
            } else{
                result = await goalRepo.getAllByFieldCustom({isDeleted: false, status: "Active"});
            }

            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Goal Level details')(result);
            } else {
                result = await goalRepo.getAllByFieldCustom({isDeleted: false, status: "Active"});
                return requestHandler.sendSuccess(res, 'Goal Level details')(result);
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

     /* @Method: details
    // @Description: Goal details
    */
    async details(req, res) {
		try {
			const goalId = req.params.id;
			const result = await goalRepo.getById(goalId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Goal details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry goal not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


}

module.exports = new GoalController();