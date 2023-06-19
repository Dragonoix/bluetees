const mongoose = require('mongoose');
const problemRepo = require('report_problem/repositories/report_problem.repository');
const reportProblem = require('report_problem/models/report_problem.model');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class problemController {
    constructor() { }

    /*
    // @Method: list
    // @Description: Parent Problem list
    */
    async Parentlist(req, res) {
        try {
            const result = await problemRepo.getAllByFieldPaginationParent(req)
            if (!_.isEmpty(result)) {
                let data = {
                    "recordsTotal": result.total,
                    "recordsLimit": result.limit,
                    "pages": result.pages,
                    "page": result.page,
                    "data": result.docs
                };
                return requestHandler.sendSuccess(res, 'Problem details')(data);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Problem is not present')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /*
   // @Method: list
   // @Description: Child Problem list
   */
    async Childlist(req, res) {
        try {
            const find = await problemRepo.getById(req.params.id);
            let slug = find.slug;
            const result = await problemRepo.getAllByFieldPagination(req);
            if (!_.isEmpty(result)) {
                let data = {
                    "recordsTotal": result.total,
                    "recordsLimit": result.limit,
                    "pages": result.pages,
                    "page": result.page,
                    "data": result.docs,
                    slug
                };
                return requestHandler.sendSuccess(res, 'Problem details')(data);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Problem is not present')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: details
    // @Description: Parent Problem details
    */
    async parentDetails(req, res) {
		try {
			const parentId = req.params.id;
			const result = await problemRepo.getById(parentId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Parent Problem details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Parent Problem not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

    /* @Method: details
    // @Description: Child Problem details
    */
    async childDetails(req, res) {
		try {
			const childId = req.params.id;
			const result = await problemRepo.getDetails(childId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Child Problem details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Child Problem not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


    /*
   // @Method: list
   // @Description: User Report list
   */
    async Reportlist(req, res) {
        try {
            const result = await problemRepo.getAllReports(req)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Report details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Report is not present')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: details
    // @Description: User Report Problem details
    */
    async userReportDetails(req, res) {
		try {
			const result = await problemRepo.userReportProblem(req)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'User Report Problem details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry User Report Problem not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}



    /* @Method: getAllProblemList
    // @Description: To get all the Report Problem List from DB
    */
    async getAllProblem(req, res) {
        try {
            let reportProblem = await problemRepo.getAllProblems(req);
            let data = {
                "recordsTotal": reportProblem.total,
                "recordsLimit": reportProblem.limit,
                "pages": reportProblem.pages,
                "page": reportProblem.page,
                "data": reportProblem.docs
            };
            return requestHandler.sendSuccess(res, 'Report Problem List Fetched')(data);
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: problem create
    // @Description: Create a problem
    */
    async create(req, res) {
        try {
            if (req.body.parent_problemId == "") {
                req.body.parent_problemId = null;
            }
            req.body.problem_name = req.body.problem_name.trim();
            let result = await problemRepo.save(req.body);
            requestHandler.sendSuccess(res, 'Problem added successfully')(result);

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: update
    // @Description: Child Problem edit and update
    */
    async update(req, res) {
        try {
            const problemId = req.params.id;
            const findProblem = await problemRepo.getById(problemId);
            if (!_.isEmpty(findProblem)) {
                const result = await problemRepo.updateById(req.body, problemId);
                requestHandler.sendSuccess(res, 'Child Problem updated successfully')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Child Problem not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: update
    // @Description: Parent Problem edit and update
    */
    async updateParent(req, res) {
        try {
            const problemParentId = req.params.id;
            const findParentProblem = await problemRepo.getById(problemParentId);
            if (!_.isEmpty(findParentProblem)) {
                const result = await problemRepo.updateById(req.body, problemParentId);
                requestHandler.sendSuccess(res, 'Parent Problem updated successfully')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Parent Problem not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: statusChange
    // @Description: Problem Report Status Change Active/Inactive
    */
    async statusChange(req, res) {
        try {
            const problemId = req.params.id;
            const result = await problemRepo.getByIdUserProblem(problemId)
            if (!_.isEmpty(result)) {
                let problemStatus = (result.status === "Active") ? "Inactive" : "Active";
                let problemUpdate = await problemRepo.updateByIdUser({ status: problemStatus }, result._id)
                requestHandler.sendSuccess(res, 'Report Problem status has changed successfully')(problemUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Problem not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };



    /* @Method: delete
    // @Description: Problem Master delete
    */
    async delete(req, res) {
        try {
            const problemId = mongoose.Types.ObjectId(req.params.id);
            const problemDetails = await problemRepo.getById(problemId);
            if (!_.isEmpty(problemDetails)) {
                // const problemData = await problemRepo.getAllByFieldReport({ isDeleted: false, problemId: problemId });
                // if( problemData.length > 0){
                //    return requestHandler.throwError(400, 'bad request', 'Sorry Child Problem can not be deleted')();
                // }
                const updateProblem = await problemRepo.updateById({ isDeleted: true }, problemId);
                if (updateProblem && updateProblem._id) {
                    requestHandler.sendSuccess(res, 'Problem Master deleted successfully')({ deleted: true });
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