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

    /*
    // @Method: list
    // @Description: Skill list
    */
    async list(req, res) {
		try {
			const result = await skillRepo.getAllByField({ isDeleted: false })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Skill master details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry skill is not present')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

    /* @Method: Skill All List
    // @Description: To get all the Skill List from DB
    */
    async getAllSkill(req, res) {
        try {
            let skill = await skillRepo.getAllSkills(req);
            let data = {
                "recordsTotal": skill.total,
                "recordsLimit": skill.limit,
                "pages": skill.pages,
                "page": skill.page,
                "data": skill.docs
            };   
            return requestHandler.sendSuccess(res, 'Skill List Fetched')(data);
        }catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: create
    // @Description: SKill create
    */
    async create(req, res) {
        try {
            const skill_exist = await skillRepo.getByField({ 'skill_level': { '$regex': req.body.skill_level, '$options': 'i' } });
            if (_.isEmpty(skill_exist)) {
                let result = await skillRepo.save(req.body);
                requestHandler.sendSuccess(res, 'Skill added successfully')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Skill already exists with same name')();
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


    /* @Method: update
    // @Description: Skill edit and update
    */
    async update(req, res) {
        try {
            const skillId = req.params.id;
            const skill_exist = await skillRepo.getByField({ skill_level: req.body.skill_level, _id: { $ne: skillId } });
            if (_.isEmpty(skill_exist)) {
                const findSkill = await skillRepo.getById(skillId);
                if (!_.isEmpty(findSkill)) {
                    const result = await skillRepo.updateById(req.body, skillId);
                    requestHandler.sendSuccess(res, 'Skill Master updated successfully')(result);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry Skill not found')();
                }    
            } else {
                requestHandler.throwError(400, 'bad request', 'Skill Master already exists with same name')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: statusChange
    // @Description: Skill Level Status Change Active/Inactive
    */
    async statusChange(req, res) {
        try {
            const skillId = req.params.id;
            const result = await skillRepo.getById(skillId)
            if (!_.isEmpty(result)) {
                let skillStatus = (result.status === "Active" ) ? "Inactive" : "Active";
                let skillUpdate = await skillRepo.updateById({status: skillStatus}, result._id)
                requestHandler.sendSuccess(res, 'Skill Level status has changed successfully')(skillUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Skill Level not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /* @Method: delete
    // @Description: Skill Master delete
    */
    async delete(req, res) {
        try {
                const skillId = mongoose.Types.ObjectId(req.params.id);
                const skillDetails = await skillRepo.getById(skillId);
                if (!_.isEmpty(skillDetails)) {
                    const updateSkill = await skillRepo.updateById({ isDeleted: true }, skillId);
                    if (updateSkill && updateSkill._id) {
                        requestHandler.sendSuccess(res, 'Skill Master deleted successfully')({ deleted: true });
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

module.exports = new SkillController();