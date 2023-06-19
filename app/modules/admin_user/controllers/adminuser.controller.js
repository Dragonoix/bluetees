const adminUserRepo = require('admin_user/repositories/adminuser.repository');
const roleRepo = require('role/repositories/role.repository');
const problemRepo = require('report_problem/repositories/report_problem.repository');
const productRepo = require('product/repositories/product.repository');
const userDeviceRepo = require('UserDevice/repositories/userDevice.repository');
const userBlueteesRoundRepo = require('user_golf_round/repositories/user_golf_round.repository');
const gorgiasController = require('webservice/blue_tees/gorgias.controller');
const User = require('user/models/user.model');
const userRepo = require('user/repositories/user.repository');
const bcrypt = require('bcryptjs');
const config = require(appRoot + '/config/index')
const newUser = new User();
const jwt = require('jsonwebtoken');
const _ = require('underscore');
const slug = require('slug');
const utils = require(appRoot + '/helper/utils');
const mailHelper = require(appRoot + '/helper/mailer');
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
// aws bucket //
const aws = require('aws-sdk');
const { default: mongoose } = require('mongoose');
aws.config.update(config.aws);
const s3 = new aws.S3();
const fs = require('fs');
const countryLoc = require('country-locator');
const klaviyoHelper = require(appRoot + '/helper/klaviyo');
const postscriptHelper = require(appRoot + '/helper/postscript');


class AdminUserController {
    constructor() { }

    /*
    // @Method: list
    // @Description: Admin User list
    */
    async list(req, res) {
        try {
            let result = await adminUserRepo.getAll(req);
            let data = {
                "recordsTotal": result.total,
                "recordsLimit": result.limit,
                "pages": result.pages,
                "page": result.page,
                "data": result.docs
            };
            if (_.isEmpty(data)) {
                requestHandler.throwError(400, 'bad request', 'Sorry user not found!')();
            } else {
                requestHandler.sendSuccess(res, 'User list fetched Successfully')(data);
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: details
    // @Description: Admin User details
    */
    async details(req, res) {
        try {
            const adminUserId = req.params.id;
            const BugReport = await problemRepo.getAllByFieldReportWithDetails({ isDeleted: false, status: "Active", userId: mongoose.Types.ObjectId(adminUserId) });
            const Device = await userDeviceRepo.getAllByFieldDeviceWithDetails({ isDeleted: false, status: "Active", userId: mongoose.Types.ObjectId(adminUserId) });
            const GamesStat = await userBlueteesRoundRepo.getAllByField({ isRoundComplete: true, userId: mongoose.Types.ObjectId(adminUserId) })
            const user = await adminUserRepo.getById(adminUserId)
            if (!_.isEmpty(user)) {
                return requestHandler.sendSuccess(res, 'User details')({ user, BugReport, Device, GamesStat });
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry user not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: Dashboard
    // @Description: Dash Board Information
    */
    async dashboard(req, res) {
        try {

            let userRole = await roleRepo.getByField({ role: "user" });



            let ActiveUsers = await adminUserRepo.getUserCountByParam({ isDeleted: false, isActive: true, role: userRole._id });



            let InactiveUsers = await adminUserRepo.getUserCountByParam({ isDeleted: false, isActive: false, role: userRole._id });



            let BugReport = await problemRepo.getBugCountByParam({ isDeleted: false, status: 'Active' });



            let DeviceConnected = await userDeviceRepo.getDeviceCountByParam();;



            let RoundsPlayed = await userBlueteesRoundRepo.getRoundCountByParam();


            let TopCourses = await userBlueteesRoundRepo.getTopFiveRounds({ isRoundComplete: true }, RoundsPlayed);


            let TopTenPlayersAndRounds = await userBlueteesRoundRepo.getTopTenPlayerNameAndRounds();


            let lastSevenDaysForDevice = await userDeviceRepo.getUserActivitySevenDays();



            let lastThirtyDaysForDevice = await userDeviceRepo.getUserActivityThirtyDays();



            let todays = new Date();
            todays.setUTCHours(0, 0, 0);

            let month = todays.getMonth() + 1;
            let year = todays.getFullYear();
            let dateArray = [{ "id": 1, "label": "week1", "fr": 1, "to": 7 }, { "id": 2, "label": "week2", "fr": 8, "to": 14 }, { "id": 3, "label": "week3", "fr": 15, "to": 21 }, { "id": 4, "label": "week4", "fr": 22, "to": 31 }]



            let weeklyDeviceData = []
            dateArray.forEach(async ele => {
                let incompleteDates = year + "-" + month + "-"
                let startDates = incompleteDates + ele.fr;
                let endDates = incompleteDates + ele.to;
                let lastMonthDataForUserDevice = await userDeviceRepo.getUserAndDeviceMonthly(startDates, endDates);
                weeklyDeviceData.push({ id: ele.id, label: ele.label, count: lastMonthDataForUserDevice[0] ? lastMonthDataForUserDevice[0].count : 0 })
                if (weeklyDeviceData.length == 4) {
                    weeklyDeviceData.sort((a, b) => {
                        return a.id - b.id;
                    })
                }
            })



            let lastSevenDaysForUsers = await userRepo.getUserSevenDays();

            let lastThirtyDaysForUsers = await userRepo.getUserThirtyDays();

            var today = new Date();
            today.setUTCHours(0, 0, 0);

            let mnt = today.getMonth() + 1;
            let yr = today.getFullYear();
            let dateArr = [{ "id": 1, "label": "week1", "fr": 1, "to": 7 }, { "id": 2, "label": "week2", "fr": 8, "to": 14 }, { "id": 3, "label": "week3", "fr": 15, "to": 21 }, { "id": 4, "label": "week4", "fr": 22, "to": 31 }]

            let weeklyData = []
            dateArr.forEach(async ele => {
                let incompleteDate = yr + "-" + mnt + "-"
                let startDate = incompleteDate + ele.fr;
                let endDate = incompleteDate + ele.to;
                let lastMonthDataForUser = await userRepo.getUserMonthly(startDate, endDate);
                weeklyData.push({ id: ele.id, label: ele.label, count: lastMonthDataForUser[0] ? lastMonthDataForUser[0].count : 0 })
                if (weeklyData.length == 4) {
                    weeklyData.sort((a, b) => {
                        return a.id - b.id;
                    })
                }
            })


            let five_domestic_rounds = await userBlueteesRoundRepo.getTopFiveRounds({ courseCountry: "USA", isRoundComplete: true }, RoundsPlayed);
            let five_international_rounds = await userBlueteesRoundRepo.getTopFiveRounds({ courseCountry: { $ne: "USA" }, isRoundComplete: true }, RoundsPlayed);

            let device_activity = await productRepo.getDifferentDeviceCount(ActiveUsers);

            let commute_status = {
                driving: 0,
                walking: 0
            }

            return requestHandler.sendSuccess(res, 'Dashboard Details')({
                ActiveUsers,
                InactiveUsers,
                BugReport,
                DeviceConnected,
                RoundsPlayed,
                TopCourses,
                TopTenPlayersAndRounds,
                lastSevenDaysForDevice,
                lastThirtyDaysForDevice,
                lastMonthDataForUserDevice: weeklyDeviceData,
                lastSevenDaysForUsers,
                lastThirtyDaysForUsers,
                lastMonthDataForUser: weeklyData,
                five_domestic_rounds,
                five_international_rounds,
                device_activity,
                role: req.user.role.role,
                commute_status
            });

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: Dashboard
    // @Description: Dash Board Information
    */
    async customerDashboard(req, res) {
        try {
            let userRole = await roleRepo.getByField({ role: "user" });
            // console.log("1");

            let ActiveUsers = await adminUserRepo.getUserCountByParam({ isDeleted: false, isActive: 'true', role: userRole._id });
            // console.log("2");

            // let customerSupport = await gorgiasController.listTicket(); // this is causing the api to slow down
            // console.log("3");

            let BugReport = await problemRepo.getBugCountByParam({ isDeleted: false, status: 'Active', send_to_gorgias: true });
            // console.log("4");

            let mainIssues = await problemRepo.getBugCountByParam({ isDeleted: false, status: 'Active' });
            // console.log("5");

            let DeviceConnected = await userDeviceRepo.getDeviceCountByParam({ isDeleted: false, status: 'Active' });
            // console.log("6");

            return requestHandler.sendSuccess(res, 'Customer Support Dashboard Details')({ ActiveUsers, BugReport, mainIssues, DeviceConnected, role: req.user.role.role });
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    async customerDashboardGorgiasData(req, res) {
        try {

            let customerSupport = await gorgiasController.listTicket();

            return requestHandler.sendSuccess(res, 'Customer Support Dashboard Gorgias Details')(customerSupport);
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: update
    // @Description: Admin User edit
    */
    async update(req, res) {
        try {
            const adminUserId = req.params.id;
            const chkEmail = {
                isDeleted: false,
                email: req.body.email,
                _id: { $ne: adminUserId }
            };

            const admin_user_exist = await adminUserRepo.getByField(chkEmail);
            if (_.isEmpty(admin_user_exist)) {
                const findAdminUser = await adminUserRepo.getById(adminUserId);
                if (!_.isEmpty(findAdminUser)) {
                    // if (findAdminUser.phone != "" && req.body.phone) {
                    //     requestHandler.throwError(400, 'bad request', 'Phone number can not be updated')();
                    // }
                    // For image update//
                    let uploadDcumentName = '';
                    let uploadDocumentArr = [];
                    if (req.files && req.files.length > 0) {
                        await s3.deleteObject({ Bucket: config.aws.bucket, Key: "user/" + findAdminUser.profile_image }).promise();
                        uploadDocumentArr = req.files[0].key.split("/");
                        uploadDcumentName = uploadDocumentArr[1];
                        req.body.profile_image = uploadDcumentName;
                    }
                    const result = await adminUserRepo.updateById(req.body, adminUserId);

                    // Gorgias update customer starts here //
                    if (findAdminUser.gorgias_id != null) {
                        let gorgeData = {
                            email: req.body.email,
                            first_name: req.body.first_name,
                            last_name: req.body.last_name
                        }
                        let gorgiasReturn = await gorgiasController.updateCustomer(findAdminUser.gorgias_id, gorgeData);
                    }
                    // Gorgias update customer ends here //

                    // Klaviyo starts here //
                    if (findAdminUser.klaviyo_user_id != null) {

                        let klavData = {
                            "data": {
                                "type": "profile",
                                "id": findAdminUser.klaviyo_user_id,
                                "attributes": {
                                    "phone_number": req.body.country_code + req.body.phone,
                                    "email": req.body.email,
                                    "first_name": req.body.first_name,
                                    "last_name": req.body.last_name,
                                    "properties": {
                                        "accepts_app_promotion": req.body.want_newsletter
                                    }

                                }
                            }
                        }

                        let klavRes = await klaviyoHelper.updateProfile(klavData);
                        // console.log(klavRes, "klav update res");
                    }
                    // Klaviyo ends here //

                    if (findAdminUser.phone == req.body.phone) {
                        // postscript starts here// 
                        if ((findAdminUser.postscript_id != "" || findAdminUser.postscript_id != null || findAdminUser.postscript_id != undefined)) {
                            let postscriptSubscriber = await postscriptHelper.findSubscriber((findAdminUser.country_code.split("+"))[1] + findAdminUser.phone);
                            if (postscriptSubscriber.stat == true) {
                                req.body.postscript_id = postscriptSubscriber.data.id;
                                findAdminUser.postscript_id = postscriptSubscriber.data.id;
                            }
                            // console.log(postscriptSubscriber, "POSTSCRIPT");
                        }
                        let data = {
                            email: req.body.email,
                            properties: {
                                email: req.body.email,
                                first_name: req.body.first_name,
                                last_name: req.body.last_name
                            }
                        }
                        await postscriptHelper.updateSubscriber(findAdminUser.postscript_id, data);

                        // postscript ends here//

                    } else {
                        // postscript starts here// 
                        let data = {
                            keyword_id: "kw_927000c18ee12b6",
                            phone_number: req.body.phone,
                            origin: "other",
                            shopify_customer_id: 0,
                            resource: "subscriber",
                            properties: {
                                first_name: req.body.first_name,
                                last_name: req.body.last_name
                            }
                        }
                        let postRes = await postscriptHelper.subscribe(data); //subscribe to postscript
                        // console.log("Postscript Res", postRes);
                        // postscript ends here//
                    }


                    requestHandler.sendSuccess(res, 'User updated successfully')(result);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry user not found')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'User already exists with same email')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: statusChange
    // @Description: Admin User Status Change Active/Inactive
    */
    async statusChange(req, res) {
        try {
            const adminUserId = req.params.id;
            const result = await adminUserRepo.getById(adminUserId)
            if (!_.isEmpty(result)) {
                let adminUserStatus = (result.isActive === true) ? false : true;
                let adminUserUpdate = await adminUserRepo.updateById({ isActive: adminUserStatus }, result._id)
                requestHandler.sendSuccess(res, 'User status has changed successfully')(adminUserUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry user not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };



    /*
    // @Method: Forget Password
    // @Description: Admin User Forget password
    */
    async forgetPassword(req, res) {
        try {

            const result = await adminUserRepo.getByField({ email: req.body.email })
            if (!_.isEmpty(result)) {
                const payload = { id: result._id, name: result.first_name, email: result.email, phone: result.phone, role: result.role }
                // const token = jwt.sign(payload, config.auth.jwtSecret, { algorithm: 'HS512' });
                const token = Date.now();
                let adminUserUpdate = await adminUserRepo.updateById({ newPasswordToken: token }, result._id);
                if (_.isEmpty(adminUserUpdate)) {
                    requestHandler.throwError(400, 'bad request', 'Sorry user not found')();
                } else {
                    let template = `<html><body><p><b>Hi, ` + result.first_name + `</b></p><p>We have received a request to reset your password.</p> <p>Click on the link below to reset your password. If you ignore this message, your password won’t be changed.</p> <p><a href="` + process.env.MAIN_URL + `/reset-password?token=` + adminUserUpdate.newPasswordToken + `"><b style = "color: blue">RESET PASSWORD</b></a></p></body></html>`
                    // let template = `<html><body><p><b>Hi, ` + result.first_name + `</b></p><p>We have received a request to reset your password.</p> <p>Click on the link below to reset your password. If you ignore this message, your password won’t be changed.</p> <p>`+ process.env.MAIN_URL +`/reset-password?token=` + adminUserUpdate.newPasswordToken + `</p></body></html>`


                    let createEmail = await mailHelper.createTemplate('Reset password', template);
                    let sendMail = await mailHelper.sendMail(process.env.FROM_EMAIL, 'Blue Tees', 'Reset password', req.body.email, createEmail.id);
                    if (sendMail) {
                        requestHandler.sendSuccess(res, 'We have sent you a link to reset the password, please check your email')(adminUserUpdate);
                    } else {
                        requestHandler.throwError(500, 'internal Server Error', 'failed to send reset password email')();
                    }
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry user not found')();
            }
        } catch (e) {
            return res.status(500).send({
                message: e.message
            });
        }
    };

    /*
    // @Method: Reset Password
    // @Description: Admin User Reset password
    */

    async resetPassword(req, res) {
        try {
            // const token = jwt.verify(req.query.token, config.auth.jwtSecret, { algorithm: 'HS512' });
            let user = await adminUserRepo.getByField({ newPasswordToken: req.query.token })
            if (_.isEmpty(user)) {
                requestHandler.throwError(400, 'bad request', 'Sorry, Token is Invalid / Expired')();
            }
            if (!(req.body.newPassword && req.body.confirmNewPassword)) {
                requestHandler.throwError(400, 'bad request', 'Sorry, please fill all the fields')();
            } else {
                console.log(req.body);
                if (req.body.newPassword === req.body.confirmNewPassword) {
                    // req.body.newPassword = bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync(10));
                    req.body.newPassword = new User().generateHash(req.body.newPassword);
                    // let updateData = {
                    //     $set: {
                    //         password: req.body.newPassword,
                    //         newPasswordToken: ''
                    //     },
                    // };
                    // let userPasswordUpdate = await adminUserRepo.updatePassword({ _id: mongoose.Types.ObjectId(user._id), isDeleted: false }, updateData);
                    let userPasswordUpdate = await adminUserRepo.updateById({ password: req.body.newPassword, newPasswordToken: '' }, mongoose.Types.ObjectId(user._id));
                    if (userPasswordUpdate) {
                        requestHandler.sendSuccess(res, 'Your Password has been updated Successfully')(userPasswordUpdate);
                    } else {
                        requestHandler.throwError(400, 'bad request', 'Sorry, token is not Valid')();
                    }
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry, new password did not match with confirm Password')();

                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: delete
    // @Description: Admin User User Delete
    */
    async delete(req, res) {
        try {
            const adminUserId = req.params.id;
            const result = await adminUserRepo.getById(adminUserId)
            if (!_.isEmpty(result)) {
                let adminUserDelete = await adminUserRepo.updateById({ isDeleted: true }, result._id)
                // Klaviyo starts here //
                if (result.klaviyo_user_id != null) {

                    let klavData = {
                        "data": {
                            "type": "profile",
                            "id": result.klaviyo_user_id,
                            "attributes": {
                                "properties": {
                                    "deleted": true
                                }
                            }
                        }
                    }

                    let klavRes = await klaviyoHelper.updateProfile(klavData);
                    // console.log(klavRes, "klav update res");
                }
                // Klaviyo ends here //

                // Gorgias delete customer starts here //
                if (result.gorgias_id != null) {
                    let gorgiasReturn = await gorgiasController.deleteCustomer(result.gorgias_id);
                }
                // Gorgias delete customer ends here //

                requestHandler.sendSuccess(res, 'User deleted successfully')(adminUserDelete);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry user not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /* @Method: Email Template Create
   // @Description: Admin User to create the email Template
   */
    async createEmailTemplate(req, res) {
        try {
            req.body.name = req.body.name.trim();
            req.body.html = req.body.html.trim();
            let createEmail = await mailHelper.createTemplate(req.body.name, req.body.html);
            if (!_.isEmpty(createEmail)) {
                requestHandler.sendSuccess(res, 'Template Created successfully')(createEmail);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry something went wrong')();

            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /* Methods for the admin user model */

    /* @Method: addAdminUser
   // @Description: To add new admin user
   */
    async addAdminUser(req, res) {
        try {
            if (!req.body.first_name) {
                requestHandler.throwError(400, 'Bad Request', 'First name is required')();
            }

            if (!req.body.last_name) {
                requestHandler.throwError(400, 'Bad Request', 'Last name is required')();
            }

            if (!req.body.email) {
                requestHandler.throwError(400, 'Bad Request', 'Email is required')();
            }

            if (!req.body.role) {
                requestHandler.throwError(400, 'Bad Request', 'Role is required')();
            }

            let userEmail = req.body.email.trim();

            const emailExpression =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!emailExpression.test(userEmail)) {
                requestHandler.throwError(400, 'Bad Request', 'Please enter a valid email address')();
            }

            let checkDuplicateUser = await adminUserRepo.getByField({
                email: userEmail,
                isDeleted: false
            });

            if (_.isEmpty(checkDuplicateUser)) {

                // For Image Upload//
                let uploadDcumentName = '';
                let uploadDocumentArr = [];
                if (req.files && req.files.length > 0) {
                    uploadDocumentArr = req.files[0].key.split("/");
                    uploadDcumentName = uploadDocumentArr[1];
                    req.body.profile_image = uploadDcumentName;
                }

                // Auto password generate //
                let generateRandomString = Math.random().toString(36).substring(2, 10);
                req.body.password = newUser.generateHash(generateRandomString);
                let saveUserData = await adminUserRepo.save(req.body);

                if (!_.isEmpty(saveUserData)) {
                    await roleRepo.updateById({ isDeletable: false }, req.body.role)
                    // For send mail //
                    let full_name = saveUserData.first_name + " " + saveUserData.last_name;
                    let template = `<div class="">
                                        <div class="">Hello ${full_name},</div>
                                        <div class=""><p>Your account has been created by BlueTees</p></div>
                                        <div class="">Please consider the following as your details</div>
                                        <p/>
                                        <a style="color: #0123FE" href="` + process.env.MAIN_URL + `"><u> Click to Visit BlueTees Login Page</u></a>
                                        <p><strong>Email : </strong>${userEmail}</p>
                                        <p><strong>Password : </strong>${generateRandomString}</p>
                                        <div class=""><p>Thank You,</p></div>
                                        <div class="">BlueTees</div>
                                    </div>`
                    let createEmail = await mailHelper.createTemplate('User Password', template);
                    let sendMail = await mailHelper.sendMail(process.env.FROM_EMAIL, 'Blue Tees', 'User Password', userEmail, createEmail.id);
                    //console.log("sendMail=",sendMail);
                    requestHandler.sendSuccess(res, 'Admin user has been added successfully')(saveUserData);
                } else {
                    requestHandler.throwError(400, 'Bad Request', 'Something went wrong!')();
                }

            } else {
                requestHandler.throwError(403, 'Forbidden', 'User already exists with same email')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: adminUserView
   // @Description: To view admin user details by passing id
   */
    async adminUserView(req, res) {
        try {
            if (req.params.id) {
                let user_id = mongoose.Types.ObjectId(req.params.id);
                let getAdminData = await adminUserRepo.getAdminUserInfoById(user_id);
                if (!_.isEmpty(getAdminData)) {
                    requestHandler.sendSuccess(res, 'Admin user details has been fetched successfully')(getAdminData[0]);
                } else {
                    requestHandler.throwError(400, 'Bad Request', 'Something went wrong!')();
                }
            } else {
                requestHandler.throwError(400, 'Bad Request', 'Userid is required!')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: adminUserUpdate
   // @Description: To update admin user data
   */
    async adminUserUpdate(req, res) {
        try {
            if (!req.body.user_id) {
                requestHandler.throwError(400, 'Bad Request', 'Userid is required')();
            }

            if (req.body.email) {
                requestHandler.throwError(400, 'Bad Request', 'You can not update the email.Please contact to admin')();
            }

            let user_id = mongoose.Types.ObjectId(req.body.user_id.trim());

            let getUserData = await adminUserRepo.getByField({
                _id: user_id,
                isDeleted: false
            });

            if (!_.isEmpty(getUserData)) {

                // For image update//
                let uploadDcumentName = '';
                let uploadDocumentArr = [];
                if (req.files && req.files.length > 0) {
                    await s3.deleteObject({ Bucket: config.aws.bucket, Key: "bluetees-app/" + getUserData.profile_image }).promise();
                    uploadDocumentArr = req.files[0].key.split("/");
                    uploadDcumentName = uploadDocumentArr[1];
                    req.body.profile_image = uploadDcumentName;
                }

                let updateRecord = await adminUserRepo.updateById(req.body, user_id);

                if (!_.isEmpty(updateRecord)) {
                    requestHandler.sendSuccess(res, 'Admin user details has been updated successfully')(updateRecord);
                } else {
                    requestHandler.throwError(400, 'Bad Request', 'Something went wrong!')();
                }

            } else {
                requestHandler.throwError(400, 'Bad Request', 'User does not exist anymore!')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: adminUserStatusChange
    // @Description: Admin User Status Change Active/Inactive
    */
    async adminUserStatusChange(req, res) {
        try {
            const adminUserId = req.params.id;
            const getAdminData = await adminUserRepo.getById(adminUserId)
            if (!_.isEmpty(getAdminData)) {
                let adminUserStatus = (getAdminData.isActive === true) ? false : true;
                let adminUserUpdate = await adminUserRepo.updateById({ isActive: adminUserStatus }, adminUserId);
                if (!_.isEmpty(adminUserUpdate)) {
                    requestHandler.sendSuccess(res, 'Admin user status has been changed successfully')(adminUserUpdate);
                } else {
                    requestHandler.throwError(400, 'Bad Request', 'Something went wrong!')();
                }
            } else {
                requestHandler.throwError(400, 'Bad Request', 'User does not exist anymore!')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /* @Method: adminUserDelete
   // @Description: To delete admin user
   */
    async adminUserDelete(req, res) {
        try {
            const adminUserId = req.params.id;
            const getAdminData = await adminUserRepo.getById(adminUserId)
            if (!_.isEmpty(getAdminData)) {
                let adminUserDelete = await adminUserRepo.updateById({ isDeleted: true }, getAdminData._id);
                if (!_.isEmpty(adminUserDelete)) {
                    requestHandler.sendSuccess(res, 'Admin user has been removed successfully')(adminUserDelete);
                } else {
                    requestHandler.throwError(400, 'Bad request', 'Something went wrong!')();
                }

            } else {
                requestHandler.throwError(400, 'Bad request', 'Sorry user not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /* @Method: getAdminUserList
   // @Description: To Get Admin User List
   */
    async getAdminUserList(req, res) {
        try {
            let getAdminUserList = await adminUserRepo.getAllAdminUsers(req);
            let data = {
                "recordsTotal": getAdminUserList.total,
                "recordsLimit": getAdminUserList.limit,
                "pages": getAdminUserList.pages,
                "page": getAdminUserList.page,
                "data": getAdminUserList.docs
            };
            if (_.isEmpty(data)) {
                requestHandler.throwError(400, 'bad request', 'Sorry Admin User not found!')();
            } else {
                requestHandler.sendSuccess(res, 'Admin User list fetched Successfully')(data);
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /*
   // @Method: Backend list
   // @Description: Backend list Only for Admin Panel
   */
    async backendList(req, res) {
        try {
            const result = await roleRepo.getAllByField({ isDeleted: false, status: "Active", rolegroup: "backend" })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Backend Role List')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Backend Role List is not present')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /**
     * @Method getallDomesticRounds
     * @Description Get All Domestic Rounds
     * 
    */

    async getallDomesticRounds(req, res) {
        try {
            let RoundsPlayed = await userBlueteesRoundRepo.getRoundCountByParam({ isRoundComplete: true });
            let all_domestic_rounds_with_paginate = await userBlueteesRoundRepo.getPaginateData({ courseCountry: "USA", isRoundComplete: true }, req.body.page, RoundsPlayed);
            let data = {
                "data": all_domestic_rounds_with_paginate.docs,
                "recordsTotal": all_domestic_rounds_with_paginate.total,
                "recordsLimit": all_domestic_rounds_with_paginate.limit,
                "pages": all_domestic_rounds_with_paginate.pages,
                "page": all_domestic_rounds_with_paginate.page
            };
            return requestHandler.sendSuccess(res, 'All domestic rounds fetched successfully')(data);
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /**
     * @Method getallInternationalRounds
     * @Description Get All Domestic Rounds
     * 
    */

    async getallInternationalRounds(req, res) {
        try {
            let RoundsPlayed = await userBlueteesRoundRepo.getRoundCountByParam({ isRoundComplete: true });
            let all_international_rounds_with_paginate = await userBlueteesRoundRepo.getPaginateData({ courseCountry: { $ne: "USA" }, isRoundComplete: true }, req.body.page, RoundsPlayed);

            let data = {
                "data": all_international_rounds_with_paginate.docs,
                "recordsTotal": all_international_rounds_with_paginate.total,
                "recordsLimit": all_international_rounds_with_paginate.limit,
                "pages": all_international_rounds_with_paginate.pages,
                "page": all_international_rounds_with_paginate.page
            };


            return requestHandler.sendSuccess(res, 'All international rounds fetched successfully')(data);
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


}

module.exports = new AdminUserController();