const mongoose = require('mongoose');
const roleRepo = require('role/repositories/role.repository');
const userRepo = require('user/repositories/user.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class RoleController {
    constructor() { }

    /* @Method: create
    // @Description: Role create
    */
    async create(req, res) {
        try {
            const role_exist = await roleRepo.getByField({ 'roleDisplayName': { '$regex': req.body.roleDisplayName, '$options': 'i' }, isDeleted: false });
            if (_.isEmpty(role_exist)) {
                req.body.role = slug(req.body.roleDisplayName, { lower: true, replacement: '_' });
                req.body.rolegroup = 'backend';
                let result = await roleRepo.save(req.body);
                requestHandler.sendSuccess(res, 'Role has been added successfully')(result);
            } else {
                requestHandler.throwError(400, 'Bad request', 'Role already exists with same name')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /*
    // @Method: list
    // @Description: Role list
    */
    async list(req, res) {
        try {
            let result = await roleRepo.getAll(req);
            requestHandler.sendSuccess(res, 'Role list fetched Successfully')(result.docs, { numOfPages: result.pages, totalRecords: result.total, limits: result.limit });

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }



    /* @Method: details
    // @Description: Role details
    */
    async details(req, res) {
        try {
            const roleId = req.params.id;
            const result = await roleRepo.getById(roleId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Role details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry role not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: update
    // @Description: Role edit
    */
    async update(req, res) {
        try {
            const roleId = req.params.id;
            const role_exist = await roleRepo.getByField({ roleDisplayName: req.body.roleDisplayName, _id: { $ne: roleId } });
            if (_.isEmpty(role_exist)) {
                const findRole = await roleRepo.getById(roleId);
                if (!_.isEmpty(findRole)) {
                    const result = await roleRepo.updateById(req.body, roleId);
                    requestHandler.sendSuccess(res, 'Role updated successfully')(result);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry role not found')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'Role already exists with same name')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: multipleUpdate
    // @Description: Role Multiple Update
    */
    async multipleUpdate(req, res) {
        try {
            if (!_.has(req.body, 'roles') || !_.isArray(req.body.roles) || !req.body.roles.length) {
                requestHandler.throwError(400, 'bad request', 'Roles must be an array field!')();
            } else {
                let updatedRoles = [], unsuccessfulRoles = [];
                for (let doc of req.body.roles) {
                    let role_exist = await roleRepo.getByField({ roleDisplayName: doc.roleDisplayName, _id: { $ne: mongoose.Types.ObjectId(doc.role_id) }, isDeleted: false });
                    if (role_exist) {
                        doc.reason = "Already available";
                        unsuccessfulRoles.push(doc);
                    } else {
                        let result = await roleRepo.updateById({ roleDisplayName: doc.roleDisplayName, desc: doc.desc ? doc.desc : "" }, mongoose.Types.ObjectId(doc.role_id));

                        if (result && result._id) {
                            updatedRoles.push(result);
                        } else {
                            doc.reason = "Something went wrong";
                            unsuccessfulRoles.push(doc);
                        }
                    }
                }

                if (unsuccessfulRoles.length && updatedRoles.length) {
                    requestHandler.throwError(400, 'bad request', 'Some of the roles were not updated!')(updatedRoles, { unsuccessfulRoles });
                } else if (updatedRoles.length) {
                    requestHandler.sendSuccess(res, 'All roles updated successfully')(updatedRoles);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Roles failed to update!')(unsuccessfulRoles);
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: delete
    // @Description: Role Delete
    */
    async delete(req, res) {
        try {
            const roleId = req.params.id;
            const result = await roleRepo.getById(roleId)
            const isUserAssigned = await userRepo.getByField({ role: mongoose.Types.ObjectId(roleId), isDeleted: false, status: 'Active' });
            if (!_.isEmpty(isUserAssigned)) {
                requestHandler.throwError(400, 'bad request', 'Sorry this role has already assigned for user')();
            }
            else if (!_.isEmpty(result) && _.isEmpty(isUserAssigned)) {
                let resultDelete = await roleRepo.updateById({ isDeleted: true }, result._id)
                requestHandler.sendSuccess(res, 'Role deleted successfully')(resultDelete);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry role not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /* @Method: statusChange
    // @Description: Role Status Change
    */
    async statusChange(req, res) {
        try {
            const roleId = req.params.id;
            const result = await roleRepo.getById(roleId)
            if (!_.isEmpty(result)) {
                let roleStatus = (result.status === "Active") ? "Inactive" : "Active";
                let roleUpdate = await roleRepo.updateById({ status: roleStatus }, result._id)
                requestHandler.sendSuccess(res, 'Role status has been changed successfully')(roleUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Role not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /* @Method: getAllBackendRole
    // @Description: Get All Backend Role
    */
    async getAllBackendRole(req, res) {
        try {

            const roleData = await roleRepo.getAllByField({ isDeleted: false, status: "Active", "rolegroup": "backend" });
            if (!_.isEmpty(roleData)) {
                requestHandler.sendSuccess(res, 'Role data has been fetched successfully')(roleData);

            } else {
                requestHandler.throwError(400, 'Bad request', 'Sorry role data does not exists')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


}

module.exports = new RoleController();