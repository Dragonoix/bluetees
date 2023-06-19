const mongoose = require('mongoose');
const User = require('user/models/user.model');
const userRepo = require('user/repositories/user.repository');
const roleRepo = require('role/repositories/role.repository');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
const newUser = new User();
const config = require(appRoot + '/config/index')
// aws bucket //
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};
const fs = require('fs');

class UserController {
    constructor() {
    }

    /* @Method: signin
    // @Description: Super Admin Login
    */
    async signin(req, res) {
        try {
            let userData = await userRepo.fineOneWithRole(req.body);
            if (userData.status == 500) {
                requestHandler.throwError(400, 'bad request', userData.message)();
            }
            let user = userData.data;

            if (!_.isEmpty(user.role) && user.role.rolegroup == 'backend') {
                // Last login time update //
                const data = {
                    last_login_date: new Date(),
                };
                await userRepo.updateById(data, user._id)

                const payload = { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
                const token = jwt.sign(payload, config.auth.jwtSecret, {
                    expiresIn: config.auth.jwt_expiresin,
                    algorithm: 'HS512'
                });
                const refreshToken = jwt.sign({
                    payload,
                }, config.auth.refresh_token_secret, {
                    expiresIn: config.auth.refresh_token_expiresin,
                });
                const response = {
                    status: 'Logged in',
                    token,
                    refreshToken,
                };
                tokenList[refreshToken] = response;
                let userDetail = await userRepo.fineOneWithRoleDetails(req.body);
                if (!_.isEmpty(userDetail)) {
                    req.user = user;
                    requestHandler.sendSuccess(res, 'User logged in Successfully')(userDetail, { token, refreshToken });
                } else {
                    requestHandler.throwError(400, 'bad request', 'Something Went Wrong')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'Authentication failed. You are not a valid user')();
            }
        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    };

    /* @Method: refreshToken
    // @Description: Refresh token generate
    */
    async refreshToken(req, res) {
        try {
            const data = req.body;
            if (_.isNull(data)) {
                requestHandler.throwError(400, 'bad request', 'please provide the refresh token in request body')();
            }
            const tokenFromHeader = req.headers.token;
            const user = jwt.decode(tokenFromHeader);
            const payload = { name: user.name, email: user.email, phone: user.phone, role: user.role }
            if ((data.refreshToken) && (data.refreshToken in tokenList)) {
                const token = jwt.sign(payload, config.auth.jwtSecret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
                const response = {
                    token,
                };
                // update the token in the list
                tokenList[data.refreshToken].token = token;
                requestHandler.sendSuccess(res, 'a new token is issued ', 200)(response);
            } else {
                requestHandler.throwError(400, 'bad request', 'no refresh token present in refresh token list')();
            }
        } catch (err) {
            requestHandler.sendError(req, res, err);
        }
    }

    /* @Method: getProfile
    // @Description: Super Admin profile
    */
    async getProfile(req, res) {
        try {
            const id = req.user._id;
            const result = await userRepo.getUserProfileDetails({ _id: mongoose.Types.ObjectId(id) })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'User Data Extracted')(result[0]);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry user not found!')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }



    /* @Method: changePassword
    // @Description: Super Admin password change
    */
    async changePassword(req, res) {
        try {
            const id = req.user._id;
            if (!req.body.old_password) {
                requestHandler.throwError(400, 'Bad Request', 'Old password is required!')();
            } else if (!req.body.password) {
                requestHandler.throwError(400, 'Bad Request', 'Please enter new Password!')();
            }
            else {
                const result = await userRepo.getById(id);
                if (_.isEmpty(result)) {
                    requestHandler.throwError(400, 'bad request', 'Sorry user not found!')();
                }
                if (!result.validPassword(req.body.old_password, result.password)) {
                    requestHandler.throwError(400, 'bad request', 'Sorry Current password mismatch!')();
                }

                if (result.validPassword(req.body.password, result.password)) {
                    requestHandler.throwError(400, 'bad request', 'Sorry current password & new password cannot be same')();
                }
                req.body.password = req.user.generateHash(req.body.password);
                let userUpdated = await userRepo.updateById({ password: req.body.password }, id);
                if (userUpdated) {
                    return requestHandler.sendSuccess(res, 'Your password has been changed successfully')(userUpdated)
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry password did not matched or updated!')();
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: updateprofile
    // @Description: Update Super Admin Profile
    */
    async updateProfile(req, res) {
        try {
            const id = req.user._id;
            const conditionData = {
                isDeleted: false,
                email: req.body.email,
                _id: { $ne: mongoose.Types.ObjectId(id) }
            };
            const checkEmail = await userRepo.getByField(conditionData);
            if (!_.isEmpty(checkEmail)) {
                requestHandler.throwError(400, 'bad request', 'Sorry email already existed')();
            } else {
                const userdata = await userRepo.getById(id);
                // For image update//
                if (req.files && req.files.length > 0) {
                    for (let file of req.files) {
                        if (userdata.profile_image && file.fieldname == 'profile_image') {
                            if (fs.existsSync('./public/uploads/images/' + userdata.profile_image) && userdata.profile_image) {
                                fs.unlinkSync('./public/uploads/images/' + userdata.profile_image);
                            }
                        }
                        req.body[file.fieldname] = file.filename;
                    }
                }
                if (req.body.first_name && req.body.last_name) {
                    req.body.fullname = req.body.first_name + ' ' + req.body.last_name;
                }
                const userUpdate = await userRepo.updateById({ $set: req.body }, id)
                if (!_.isEmpty(userUpdate)) {

                    requestHandler.sendSuccess(res, 'Your account has updated successfully')(userUpdate);
                } else {
                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

}

module.exports = new UserController();