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

    /*
    // @Method: list
    // @Description: Goal list
    */
    async list(req, res) {
		try {
			const result = await goalRepo.getAllByField({ isDeleted: false })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Goal master details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry goal is not present')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

    /* @Method: Goal All List
    // @Description: To get all the Goal List from DB
    */
    async getAllGoal(req, res) {
        try {
            let goal = await goalRepo.getAllGoals(req);
            let data = {
                "recordsTotal": goal.total,
                "recordsLimit": goal.limit,
                "pages": goal.pages,
                "page": goal.page,
                "data": goal.docs
            };   
            return requestHandler.sendSuccess(res, 'Goal List Fetched')(data);
        }catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: create
    // @Description: SKill create
    */
    async create(req, res) {
        try {
            const goal_exist = await goalRepo.getByField({ 'goal': { '$regex': req.body.goal, '$options': 'i' } });
            if (_.isEmpty(goal_exist)) {
                let result = await goalRepo.save(req.body);
                requestHandler.sendSuccess(res, 'Goal added successfully')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Goal already exists with same name')();
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


    /* @Method: update
    // @Description: Goal edit and update
    */
    async update(req, res) {
        try {
            const goalId = req.params.id;
            const goal_exist = await goalRepo.getByField({ goal: req.body.goal, _id: { $ne: goalId } });
            if (_.isEmpty(goal_exist)) {
                const findGoal = await goalRepo.getById(goalId);
                if (!_.isEmpty(findGoal)) {
                    const result = await goalRepo.updateById(req.body, goalId);
                    requestHandler.sendSuccess(res, 'Goal Master updated successfully')(result);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry Goal not found')();
                }    
            } else {
                requestHandler.throwError(400, 'bad request', 'Goal Master already exists with same name')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: statusChange
    // @Description: Goal Level Status Change Active/Inactive
    */
    async statusChange(req, res) {
        try {
            const goalId = req.params.id;
            const result = await goalRepo.getById(goalId)
            if (!_.isEmpty(result)) {
                let goalStatus = (result.status === "Active" ) ? "Inactive" : "Active";
                let goalUpdate = await goalRepo.updateById({status: goalStatus}, result._id)
                requestHandler.sendSuccess(res, 'Goal Level status has changed successfully')(goalUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Goal Level not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /* @Method: delete
    // @Description: Goal Master delete
    */
    async delete(req, res) {
        try {
                const goalId = mongoose.Types.ObjectId(req.params.id);
                const goalDetails = await goalRepo.getById(goalId);
                if (!_.isEmpty(goalDetails)) {
                    const updateGoal = await goalRepo.updateById({ isDeleted: true }, goalId);
                    if (updateGoal && updateGoal._id) {
                        requestHandler.sendSuccess(res, 'Goal Master deleted successfully')({ deleted: true });
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

module.exports = new GoalController();