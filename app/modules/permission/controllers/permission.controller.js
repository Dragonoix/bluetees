const permissionRepo = require('permission/repositories/permission.repository');
const adminMenusRepo = require('admin_menus/repositories/admin_menus.repository');
const roleRepo = require('role/repositories/role.repository');
const mongoose = require('mongoose');
const _ = require('underscore');
const slug = require('slug');
const config = require(appRoot +'/config/index')
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class PermissionController {
    constructor() {}

    /* @Method: Update Permission
    // @Description: Update permission for respected Roles
    */
    async updatePermission(req, res) {
            try {
                const permission = await permissionRepo.updateRolePermissionById({'role_id':req.body.role_id}, req.body);
                if(permission) {
                    requestHandler.sendSuccess(res, 'Permission updated successfully')(permission);
                }else {
                    requestHandler.throwError(400, 'bad request', 'Something Went Wrong')();
                }
            } catch (error) {
                return requestHandler.sendError(req, res, error);
            }
    };

     /*
    // @Method: getListByRole
    // @Description: Permission list by role
    */
    async getListByRole(req, res) {
        try {
            const permissionsList = await adminMenusRepo.getPermissionByRole(req.params.id);
            let isAllSelected = false;
            if (_.isEmpty(permissionsList)) {
                requestHandler.throwError(400, 'bad request', 'Sorry list not found!')();
            } else {
                let x = permissionsList.find(o => o.has_access === false);
                if (!x) {
                    isAllSelected = true;
                }
                const roleName = await roleRepo.getById(req.params.id)
                requestHandler.sendSuccess(res, 'Permissions fetched Successfully')({permissionsList, roleName: roleName.roleDisplayName, isAllSelected: isAllSelected});
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }
}

module.exports = new PermissionController();