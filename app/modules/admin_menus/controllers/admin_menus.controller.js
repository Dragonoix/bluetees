const adminMenusRepo = require('admin_menus/repositories/admin_menus.repository');
const roleRepo = require('role/repositories/role.repository');
const mongoose = require('mongoose');
const _ = require('underscore');
const slug = require('slug');
const config = require(appRoot + '/config/index')
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class adminMenusController {
    constructor() { }

    /*
    // @Method: list
    // @Description: Admin Menu list
    */
    async list(req, res) {
        try {
            let result = await roleRepo.getPermissionByRoleDetails();
            if (_.isEmpty(result)) {
                requestHandler.throwError(400, 'bad request', 'Sorry Admin Menu list is not found!')();
            } else {
                requestHandler.sendSuccess(res, 'Admin Menu list fetched Successfully')(result);
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: details
    // @Description: Admin Menu details
    */
    async details(req, res) {
        try {
            const adminId = req.params.id;
            const result = await adminMenusRepo.getById(adminId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Admin Menu details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Admin Menu not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


}

module.exports = new adminMenusController();