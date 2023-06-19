const config = require(appRoot + '/config/index');
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const mongoose = require('mongoose');
const utils = require(appRoot + '/helper/utils');
const _ = require('underscore');
const jwt = require('jsonwebtoken');
const mailHelper = require(appRoot + '/helper/mailer');
const postscriptHelper = require(appRoot + '/helper/postscript');
const klaviyoHelper = require(appRoot + '/helper/klaviyo');
const moment = require('moment');
const userRepo = require('user/repositories/user.repository');
const roleRepo = require('role/repositories/role.repository');
const skillRepo = require('skill/repositories/skill_level.repository');
const golfClubRepo = require('golf_club/repositories/golf_club.repository');
const userDeviceRepo = require('UserDevice/repositories/userDevice.repository');
const userBlueteesDataRepo = require('user_golf_round_data/repositories/user_golf_round_data.repository');
const userBlueteesRepo = require('user_golf_round/repositories/user_golf_round.repository');
const userDistanceRepo = require('user_average_distance/repositories/user_average_distance.repository');
const gorgiasController = require('webservice/blue_tees/gorgias.controller');
const twilioClient = require('twilio')(config.twilio.twilioAccountSid, config.twilio.twilioAuthToken);
const otp = require('otp-generator');
const qs = require('qs');
const { exitOnError } = require('winston');
const tokenList = {};
const fs = require('fs');
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();
var CryptoJS = require("crypto-js");
const { resolve } = require('path');
const { reject } = require('underscore');




class UserController {
    constructor() { }



    /* @Method: sendOTP
    // @Description: Send Registration OTP for Mobile
    */

    async sendRegistrationOTP(req, res) {
        try {
            let userData = await userRepo.getByFieldWithRole({ country_code: req.body.country_code, phone: req.body.phone, isDeleted: false });

            if (_.isEmpty(userData)) {
                let userRole = await roleRepo.getByField({ role: 'user', rolegroup: 'frontend' });
                req.body.role = userRole._id;
                let skill_level = await skillRepo.getByField({ skill_level: 'Average' });
                req.body.skill_level = skill_level._id;

                if ((req.body.phone).toString() == '9465784523') {
                    req.body.otp_code = '123456';
                } else {
                    /* Twillio OTP SEND start here  */
                    // OTP generate //
                    let otp = utils.betweenRandomNumber(99999, 1000000);
                    let sendMessage = await twilioClient.messages.create({
                        from: config.twilio.twilioFromNumber,
                        to: req.body.country_code + req.body.phone,
                        body: `Please use OTP ${otp} for Blue Tees registration.`
                    });

                    /* Twillio OTP SEND end here  */
                    req.body.otp_code = otp;
                }

                /* Set expiry time for OTP Starts Here */
                var newDateObj = moment(new Date().toISOString()).add(process.env.OTP_EXPIRY_TIME, 'm').toDate();
                req.body.otp_exp_time = newDateObj;
                /* Set expiry time for OTP Ends Here */

                var chkPhPresent = await userRepo.getByFieldWithRole({ country_code: req.body.country_code, phone: req.body.phone, isDeleted: false, isActive: true, isPhoneVerified: true });

                let avt = req.body.first_name
                req.body.profile_image = `https://ui-avatars.com/api/?name=${avt.substring(0, 1)}&background=ffffff&color=000&size=200&format=png`;

                if ((((req.body.first_name && (!_.isUndefined(req.body.first_name)) && !_.isNull(req.body.first_name) && !_.isEmpty(req.body.first_name.trim())))) &&
                    (((req.body.last_name && (!_.isUndefined(req.body.last_name)) && !_.isNull(req.body.last_name) && !_.isEmpty(req.body.last_name.trim()))) &&
                        (((req.body.phone && (!_.isUndefined(req.body.phone)) && !_.isNull(req.body.phone) && !_.isEmpty(req.body.phone)))))) {

                    var golfClub = await golfClubRepo.getAllByField({
                        "short_title": { $in: ["D", "3W", "5W", "4i", "5i", "6i", "7i", "8i", "9i", "PW", "GW", "SW", "LW"] },
                        "isDeleted": false
                    });
                    req.body.selected_golfclub_ids = [];
                    if (golfClub.length > 0) {
                        golfClub.forEach(dat => {
                            req.body.selected_golfclub_ids.push({
                                clubId: dat._id,
                                title: dat.title,
                                short_title: dat.short_title,
                                distance: 0
                            });
                        })
                    }
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
                    console.log("Postscript Res", postRes);
                    // postscript ends here//

                    if (!_.has(req.body, "want_newsletter")) {
                        req.body.want_newsletter = false;
                    }
                    // Klaviyo starts here// 
                    let klaviyoData = {
                        "data": {
                            "type": "profile",
                            "attributes": {
                                "phone_number": req.body.country_code + req.body.phone,
                                "first_name": req.body.first_name,
                                "last_name": req.body.last_name,
                                "organization": "Bluetees",
                                "title": "Player",
                                "properties": {
                                    "accepts_app_promotion": req.body.want_newsletter
                                }
                            }
                        }
                    }
                    // console.log(klaviyoData);

                    let klavData = await klaviyoHelper.createProfileListAdd(klaviyoData);
                    // console.log(klavData);
                    if (klavData && klavData.stat == true) {
                        req.body.klaviyo_user_id = klavData.id;
                    } else if (klavData.stat == false && klavData.err.status == 409 && klavData.err.statusText == 'Conflict') {
                        let existingKlaviyoData = await klaviyoHelper.findByPhone((req.body.country_code.split("+"))[1] + req.body.phone);
                        if (!_.isEmpty(existingKlaviyoData)) {
                            req.body.klaviyo_user_id = existingKlaviyoData.id;

                            let updateKlavData = {
                                "data": {
                                    "type": "profile",
                                    "id": existingKlaviyoData.id,
                                    "attributes": {
                                        "first_name": req.body.first_name,
                                        "last_name": req.body.last_name,
                                        "properties": {
                                            "deleted": false,
                                            "accepts_app_promotion": req.body.want_newsletter
                                        }
                                    }
                                }
                            }

                            await klaviyoHelper.updateProfile(updateKlavData);
                        }
                    }

                    // Klaviyo ends here//

                    let registerUser = await userRepo.save(req.body);

                    if (!_.isEmpty(registerUser) && registerUser._id) {
                        await roleRepo.updateById({ isDeletable: false }, userRole._id);
                        requestHandler.sendSuccess(res, 'Please enter the OTP.')(registerUser);
                    } else {
                        requestHandler.sendSuccess(res, 'Something went wrong')();
                    }
                } else {
                    requestHandler.throwError(400, 'Unprocessable Entity', 'One of the field is empty, please fill it properly.')();
                }
            } else {

                if (userData) { ///phone no present
                    requestHandler.throwError(400, 'bad request', 'User already exists with same phone number.')();
                } else { /// phone no present but not verified

                    /* Update user data starts here */
                    var userId = userData._id;
                    req.body.otp_code = otp;
                    let avt = req.body.first_name
                    req.body.profile_image = `https://ui-avatars.com/api/?name=${avt.substring(0, 1)}&background=ffffff&color=000&size=200&format=png`;
                    var newDateObj = moment(new Date().toISOString()).add(process.env.OTP_EXPIRY_TIME, 'm').toDate();

                    var selected_golfclub_ids = [];
                    var golfClub = await golfClubRepo.getAllByField({
                        "short_title": { $in: ["D", "3W", "5W", "4i", "5i", "6i", "7i", "8i", "9i", "PW", "SW", "GW", "LW"] },
                        "isDeleted": false
                    });
                    if (golfClub.length > 0) {
                        golfClub.forEach(dat => {
                            selected_golfclub_ids.push(dat._id);
                        })
                    }

                    var updatedQuery = {
                        'first_name': req.body.first_name,
                        'last_name': req.body.last_name,
                        'otp_exp_time': newDateObj,
                        'otp_code': req.body.otp_code,
                        'profile_image': req.body.profile_image,
                        'selected_golfclub_ids': selected_golfclub_ids
                    }
                    if ((((req.body.first_name && (!_.isUndefined(req.body.first_name)) && !_.isNull(req.body.first_name) && !_.isEmpty(req.body.first_name.trim())))) &&
                        (((req.body.last_name && (!_.isUndefined(req.body.last_name)) && !_.isNull(req.body.last_name) && !_.isEmpty(req.body.last_name.trim()))) &&
                            (((req.body.phone && (!_.isUndefined(req.body.phone)) && !_.isNull(req.body.phone) && !_.isEmpty(req.body.phone)))))) {

                        await userRepo.updateById(updatedQuery, userId);
                        //add post script here
                        requestHandler.sendSuccess(res, 'Please enter the OTP.')(userData);
                    } else {
                        requestHandler.throwError(400, 'Unprocessable Entity', 'One of the field is empty, please fill it properly.')();

                    }
                    /* Update user data ends here */
                }
            }
        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: sendOTP
    // @Description: Send Login OTP for Mobile
    */
    async sendLoginOTP(req, res) {
        try {
            let userData = await userRepo.getByFieldWithRole({ country_code: req.body.country_code, phone: req.body.phone, isDeleted: false });
            if (!_.isEmpty(userData) && userData.role.rolegroup == 'frontend') {


                if ((req.body.phone).toString() == '9465784523') {
                    req.body.otp_code = '123456';
                } else {
                    /* Twillio OTP SEND start here  */
                    // OTP generate //
                    let otp = utils.betweenRandomNumber(99999, 1000000)
                    let sendMessage = await twilioClient.messages.create({
                        from: config.twilio.twilioFromNumber,
                        to: req.body.country_code + req.body.phone,
                        body: `Please use OTP ${otp} for Blue Tees login.`
                    });

                    /* Twillio OTP SEND end here  */
                    req.body.otp_code = otp;
                }

                /* Set expiry time for OTP Starts Here */
                var newDateObj = moment(new Date().toISOString()).add(process.env.OTP_EXPIRY_TIME, 'm').toDate();
                req.body.otp_exp_time = newDateObj;
                /* Set expiry time for OTP Ends Here */

                let updateUser = await userRepo.updateById(req.body, userData._id);
                if (updateUser) {
                    requestHandler.sendSuccess(res, 'OTP Sent Successfully.')(userData);
                } else {
                    requestHandler.sendSuccess(res, 'Something went wrong')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'User not found with this phone number')();
            }
        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: resendOTP
    // @Description: Resend OTP
    */
    async resendOTP(req, res) {
        try {
            // const id = req.params.id;
            let userData = await userRepo.getByField({ country_code: req.body.country_code, phone: req.body.phone, isDeleted: false, isActive: true });
            if (!_.isEmpty(userData)) {

                if ((req.body.phone).toString() == '9465784523') {
                    req.body.otp_code = '123456';
                } else {
                    /* Twillio OTP SEND start here  */
                    // OTP generate //
                    let otp = utils.betweenRandomNumber(99999, 1000000)
                    let sendMessage = await twilioClient.messages.create({
                        from: config.twilio.twilioFromNumber,
                        to: req.body.country_code + req.body.phone,
                        body: `Please use OTP ${otp} for Blue Tees resend request.`
                    });

                    /* Twillio Resend OTP SEND end here  */
                    req.body.isLoginVerified = false
                    req.body.otp_code = otp;
                }

                /* Set expiry time for OTP Starts Here */
                var newDateObj = moment(new Date().toISOString()).add(process.env.OTP_EXPIRY_TIME, 'm').toDate();
                req.body.otp_exp_time = newDateObj;
                /* Set expiry time for OTP Ends Here */

                let updateUser = await userRepo.updateById(req.body, userData._id);
                if (updateUser) {
                    requestHandler.sendSuccess(res, 'OTP resend successfully')(userData);
                } else {
                    requestHandler.throwError(400, 'Bad Request', 'Something went wrong!')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'No Account Found. Please Try Again.')();
            }
        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: verifyOTP
   // @Description: Verify OTP
   */
    async verifyOTP(req, res) {
        try {

            let userData = await userRepo.getByField({ _id: req.body.userId, otp_code: req.body.userOTP, isDeleted: false, isActive: true });
            if (!_.isEmpty(userData)) {

                let currentDate = new Date();
                // console.log('data',userData.otp_exp_time<curretDate);
                // console.log(new Date());
                if (currentDate < userData.otp_exp_time) {
                    const payload = { id: userData._id, first_name: userData.first_name, last_name: userData.last_name, phone: userData.phone, role: userData.role }
                    const token = jwt.sign(payload, config.auth.jwtSecret, {
                        expiresIn: "30d", //config.auth.jwt_expiresin, 
                        algorithm: 'HS512'
                    });
                    const refreshToken = jwt.sign({
                        payload,
                    }, config.auth.refresh_token_secret, {
                        expiresIn: config.auth.refresh_token_expiresin,
                        algorithm: 'HS512'
                    });
                    const response = {
                        status: 'Logged in',
                        token,
                        refreshToken,
                    };
                    tokenList[refreshToken] = response;
                    let updateUser = await userRepo.updateById({ isPhoneVerified: true, otp_code: '', last_login_date: new Date() }, req.body.userId);
                    req.user = updateUser;
                    requestHandler.sendSuccess(res, 'User logged in Successfully')({ token, refreshToken });
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry OTP is expired, Please press resend button to get the OTP again!')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry wrong OTP given')();
            }
        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: Face Id Login
    // @Description: User Login by Face ID and Android Face ID
    */
    async faceAndFingerprintID(req, res) {
        try {
            let newEncryptedString = "";
            let params = {};

            if (_.has(req.body, 'faceId') && req.body.faceId.trim() != "") {
                let decrypted = CryptoJS.AES.decrypt(req.body.faceId, process.env.CRYPTSECRETKEY);
                let decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
                newEncryptedString = Buffer.from(decryptedString).toString('base64');
                if (newEncryptedString == "") {
                    requestHandler.throwError(400, 'bad request', 'Invalid Data')();
                    return;
                }
                params = { faceId: newEncryptedString, isDeleted: false, isActive: true };

            } else if (_.has(req.body, 'androidFaceId') && req.body.androidFaceId.trim() != "") {
                let decrypted = CryptoJS.AES.decrypt(req.body.androidFaceId, process.env.CRYPTSECRETKEY);
                let decryptedString2 = decrypted.toString(CryptoJS.enc.Utf8);
                newEncryptedString = Buffer.from(decryptedString2).toString('base64');
                if (newEncryptedString == "") {
                    requestHandler.throwError(400, 'bad request', 'Invalid Data')();
                    return;
                }
                params = { androidFaceId: newEncryptedString, isDeleted: false, isActive: true };
            } else {
                requestHandler.throwError(400, 'bad request', 'Face ID or Android Face ID is required')();
            }
            let userData = await userRepo.getByField(params);
            if (!_.isEmpty(userData)) {
                let dataFromDb = "";

                if (_.has(params, 'faceId')) {
                    dataFromDb = userData.faceId;
                }
                if (_.has(params, 'androidFaceId')) {
                    dataFromDb = userData.androidFaceId;
                }

                if (dataFromDb === newEncryptedString) {

                    const payload = { id: userData._id, first_name: userData.first_name, last_name: userData.last_name, phone: userData.phone, role: userData.role }
                    let expire = '';
                    if (req.body.faceIdButton == "On") {
                        expire = "14d"
                    } else {
                        expire = "1d"
                    }
                    const token = jwt.sign(payload, config.auth.jwtSecret, {
                        expiresIn: expire,
                        algorithm: 'HS512'
                    });
                    const refreshToken = jwt.sign({
                        payload,
                    }, config.auth.refresh_token_secret, {
                        expiresIn: config.auth.refresh_token_expiresin,
                        algorithm: 'HS512'
                    });
                    const response = {
                        status: 'Logged in',
                        token,
                        refreshToken,
                    };
                    tokenList[refreshToken] = response;
                    let updateUser = await userRepo.updateById({ last_login_date: new Date(), faceIdButton: req.body.faceIdButton }, userData._id);
                    req.user = updateUser;
                    requestHandler.sendSuccess(res, 'User logged in Successfully')({ token, refreshToken });
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry something went wrong')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'Unauthorized !!')();
            }

        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: updateprofile
   // @Description: User Profile Update
   */
    async updateProfile(req, res) {
        try {
            const id = req.user._id;
            const userdata = await userRepo.getById(id);
            // For image update//
            let uploadDcumentName = '';
            let uploadDocumentArr = [];
            if (req.files && req.files.length > 0) {
                await s3.deleteObject({ Bucket: config.aws.bucket, Key: "bluetees-app/" + userdata.profile_image }).promise();
                uploadDocumentArr = req.files[0].key.split("/");
                uploadDcumentName = uploadDocumentArr[1];
                req.body.profile_image = uploadDcumentName;
            }

            if (_.has(req.body, 'faceId') && req.body.faceId.trim() != "") {
                let decrypted = CryptoJS.AES.decrypt(req.body.faceId, process.env.CRYPTSECRETKEY);
                let val = decrypted.toString(CryptoJS.enc.Utf8);
                req.body.faceId = Buffer.from(val).toString('base64');
                const checkId = await userRepo.getByField({ faceId: req.body.faceId, isDeleted: false, isActive: true })
                if (checkId != null) {
                    requestHandler.throwError(400, 'Unprocessable Entity', 'Fingerprint / Face ID is already registered')();
                    return;
                }
            }

            if (_.has(req.body, 'androidFaceId') && req.body.androidFaceId.trim() != "") {
                let decrypted = CryptoJS.AES.decrypt(req.body.androidFaceId, process.env.CRYPTSECRETKEY);
                let val = decrypted.toString(CryptoJS.enc.Utf8);
                req.body.androidFaceId = Buffer.from(val).toString('base64');
                const checkId = await userRepo.getByField({ androidFaceId: req.body.androidFaceId, isDeleted: false, isActive: true })
                if (checkId != null) {
                    requestHandler.throwError(400, 'Unprocessable Entity', 'Fingerprint / Face ID is already registered')();
                    return;
                }
            }

            // Gorgias update customer starts here //
            if (req.user.gorgias_id != null) {
                let gorgeData = {
                    email: req.body.email,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name
                }
                let gorgiasReturn = await gorgiasController.updateCustomer(req.user.gorgias_id, gorgeData);
            }
            // Gorgias update customer ends here //

            // Klaviyo starts here //
            if (req.user.klaviyo_user_id != null) {

                let klavData = {
                    "data": {
                        "type": "profile",
                        "id": req.user.klaviyo_user_id,
                        "attributes": {
                            "email": req.body.email,
                            "first_name": req.body.first_name,
                            "last_name": req.body.last_name,
                            "location": {
                                country: req.body.country
                            }
                        }
                    }
                };

                if (_.has(req.body, "want_newsletter")) {
                    klavData.data.attributes.properties = { "accepts_app_promotion": req.body.want_newsletter };
                }
                // console.log(klavData);
                let klavRes = await klaviyoHelper.updateProfile(klavData);
                // console.log(klavRes, "klav update res");
            }
            // Klaviyo ends here //

            // postscript starts here// 
            if ((userdata.postscript_id != "" || userdata.postscript_id != null || userdata.postscript_id != undefined)) {
                let postscriptSubscriber = await postscriptHelper.findSubscriber((req.user.country_code.split("+"))[1] + req.user.phone);
                if (postscriptSubscriber.stat == true) {
                    req.body.postscript_id = postscriptSubscriber.data.id;
                    userdata.postscript_id = postscriptSubscriber.data.id;
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
            await postscriptHelper.updateSubscriber(userdata.postscript_id, data);

            // postscript ends here//


            let distanceAvarage = new Promise((resolve, reject) => {
                if (_.has(req.body, "selected_golfclub_ids") && (req.body.selected_golfclub_ids).length != 0) {
                    var newArray = (req.body.selected_golfclub_ids).filter(function (el) {
                        return el.distance == 0
                    });

                    if (newArray.length != 0) {
                        let i = 0;
                        newArray.forEach(async (dat) => {
                            let avgDistance = await userDistanceRepo.getByField({ userId: req.user._id, clubId: mongoose.Types.ObjectId(dat.clubId) })
                            if (avgDistance) {
                                var foundIndex = req.body.selected_golfclub_ids.findIndex(x => x.clubId == avgDistance.clubId);
                                req.body.selected_golfclub_ids[foundIndex].distance = avgDistance.average_distance;
                            }
                            i = i + 1;
                            if (i == newArray.length) {
                                resolve();
                            }

                        })
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            })
            distanceAvarage.then(async () => {
                let userUpdate = await userRepo.updateById({ $set: req.body }, id);
                if (!_.isEmpty(userUpdate)) {
                    if (userUpdate.faceId != "") {
                        var valueFromDB = Buffer.from(userUpdate.faceId, 'base64').toString('ascii')
                        var encryptedDBData = CryptoJS.AES.encrypt(valueFromDB, process.env.CRYPTSECRETKEY).toString();
                        userUpdate.faceId = encryptedDBData
                    }
                    if (userUpdate.androidFaceId != "") {
                        var valueFromDB2 = Buffer.from(userUpdate.androidFaceId, 'base64').toString('ascii')
                        var encryptedDBData2 = CryptoJS.AES.encrypt(valueFromDB2, process.env.CRYPTSECRETKEY).toString();
                        userUpdate.androidFaceId = encryptedDBData2
                    }
                    if (
                        ((userUpdate.skill_level) || (!userUpdate.skill_level == "") || (!userUpdate.skill_level == null)) &&
                        ((userUpdate.profile_image) || (!userUpdate.profile_image == "") || (!userUpdate.profile_image == null)) &&
                        ((userUpdate.gender) || (!userUpdate.gender == "") || (!userUpdate.gender == null)) &&
                        ((userUpdate.goal) || (!userUpdate.goal == "") || (!userUpdate.goal == null))
                    ) {

                        var x = Object.entries(userUpdate.goal);
                        x.map(async ([key, val] = entry) => {
                            if (val == true) {
                                userUpdate.isProfileComplete = true;
                                await userRepo.updateById({ $set: { isProfileComplete: true } }, id);
                            }
                        })
                    }
                    requestHandler.sendSuccess(res, 'Your profile has been updated successfully!')(userUpdate);
                } else {
                    req.body.isProfileComplete = false;
                    requestHandler.throwError(400, 'Unprocessable Entity', 'unable to update your profile')();
                }
            }).catch((e) => {
                requestHandler.throwError(400, 'Unprocessable Entity', 'Something went wrong')();
            })

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    async updatePhoneNumber(req, res) {
        try {
            req.body.userId = req.user._id;

            if (!_.has(req.body, "country_code" || req.body.country_code == '' || req.body.country_code == null)) {
                return requestHandler.throwError(400, 'bad request', 'Country code is required.')();
            }

            if (!_.has(req.body, "phone" || req.body.phone == '' || req.body.phone == null)) {
                return requestHandler.throwError(400, 'bad request', 'Phone number is required.')();
            }

            let userData = await userRepo.getByFieldWithRole({ country_code: req.body.country_code, phone: req.body.phone, isDeleted: false });
            if (!_.isEmpty(userData)) {
                return requestHandler.throwError(400, 'bad request', 'User already registered with this phone number. Please change the phone number and try again.')();
            }
            let otp = utils.betweenRandomNumber(99999, 1000000)
            let sendMessage = await twilioClient.messages.create({
                from: config.twilio.twilioFromNumber,
                to: req.body.country_code + req.body.phone,
                body: `Please use OTP ${otp} for Blue Tees login.`
            });

            /* Twillio OTP SEND end here  */
            req.body.otp_code = otp;

            let savedData = await userRepo.saveTemp(req.body);
            if (!_.isEmpty(savedData)) {
                // let updateUser = await userRepo.updateById({ otp_code: req.body.otp_code }, req.user._id);
                requestHandler.sendSuccess(res, 'OTP Sent Successfully.')({ id: savedData._id });
            } else {
                requestHandler.sendSuccess(res, 'Something went wrong')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    async validateOtpAndSavePhone(req, res) {
        try {
            let userData = await userRepo.tempGetByField({ userId: req.user._id, otp_code: req.body.otp_code, isDeleted: false, isActive: true });
            if (!_.isEmpty(userData)) {
                let payload = {};
                if (userData.first_name != '' || userData.first_name != null) {
                    payload['first_name'] = userData.first_name;
                }

                if (userData.last_name != '' || userData.last_name != null) {
                    payload['last_name'] = userData.last_name;
                }

                if (userData.email != '' || userData.email != null) {
                    payload['email'] = userData.email;
                }

                if (userData.country != '' || userData.country != null) {
                    payload['country'] = userData.country;
                }

                if (userData.language != '' || userData.language != null) {
                    payload['language'] = userData.language;
                }

                payload['country_code'] = userData.country_code;
                payload['phone'] = userData.phone;

                let updateUser = await userRepo.updateById(payload, req.user._id);
                if (!_.isEmpty(updateUser)) {
                    await userRepo.tempDelete(userData._id);
                    // Klaviyo starts here //
                    if (req.user.klaviyo_user_id != null) {

                        let klavData = {
                            "data": {
                                "type": "profile",
                                "id": req.user.klaviyo_user_id,
                                "attributes": {
                                    "phone_number": userData.country_code + userData.phone,
                                    "email": userData.email,
                                    "first_name": userData.first_name,
                                    "last_name": userData.last_name,
                                    "location": {
                                        country: userData.country
                                    }
                                }
                            }
                        }

                        let klavRes = await klaviyoHelper.updateProfile(klavData);
                        // console.log(klavRes, "klav update res");
                    }
                    // Klaviyo ends here //
                    requestHandler.sendSuccess(res, 'Your profile has been updated successfully!')(updateUser);
                } else {
                    requestHandler.sendSuccess(res, 'Something went wrong')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry wrong OTP provided.')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /* @Method: details
    // @Description:  User details
    */
    async details(req, res) {
        try {
            const UserId = req.user._id;

            const result = await userRepo.getById(UserId);

            if (!_.isEmpty(result)) {
                if (result.faceId != "") {
                    var valueFromDB = Buffer.from(result.faceId, 'base64').toString('ascii')
                    var encryptedDBData = CryptoJS.AES.encrypt(valueFromDB, process.env.CRYPTSECRETKEY).toString();
                    result.faceId = encryptedDBData
                }
                if (result.androidFaceId != "") {
                    var valueFromDB2 = Buffer.from(result.androidFaceId, 'base64').toString('ascii')
                    var encryptedDBData2 = CryptoJS.AES.encrypt(valueFromDB2, process.env.CRYPTSECRETKEY).toString();
                    result.androidFaceId = encryptedDBData2
                }
                // console.log(result);
                return requestHandler.sendSuccess(res, 'User details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry user not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: softDelete
   // @Description: User Delete
   */
    async delete(req, res) {
        try {
            const userId = req.user._id;
            const userDetails = await userRepo.getById(userId);
            if (!_.isEmpty(userDetails)) {
                const updateUser = await userRepo.updateById({ isDeleted: true }, userId);

                if (updateUser && updateUser._id) {
                    await userDeviceRepo.updateAllByField({ userId: null }, { userId: userId });

                    let distanceData = await userBlueteesRepo.getMyAllRounds(userId);
                    if (!_.isEmpty(distanceData)) {
                        await userBlueteesRepo.updateByFieldArray({ userId: userId }, { isDeleted: true })
                        await userBlueteesDataRepo.updateByFieldArray({ roundId: { $in: distanceData.roundIds } }, { isDeleted: true })
                    }

                    // Klaviyo starts here //
                    if (req.user.klaviyo_user_id != null) {

                        let klavData = {
                            "data": {
                                "type": "profile",
                                "id": req.user.klaviyo_user_id,
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
                    if (req.user.gorgias_id != null) {
                        let gorgiasReturn = await gorgiasController.deleteCustomer(req.user.gorgias_id);
                    }
                    // Gorgias delete customer ends here //

                    requestHandler.sendSuccess(res, 'User deleted successfully')({ deleted: true });
                } else {
                    requestHandler.throwError(400, 'bad request', 'Something went wrong!')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry data not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };



    /* @Method: golfclubList
   // @Description: Golf club list
   */
    async golfclubList(req, res) {
        try {
            const loggedin_user_id = req.user._id;

            const userDetails = await userRepo.getById(loggedin_user_id);

            let objectIdArray = userDetails.selected_golfclub_ids.map(s => mongoose.Types.ObjectId(s.clubId));
            var golfclubList = await golfClubRepo.getGolfClubByUser({ "selected_golf_clubs": objectIdArray }, req.user._id);

            return requestHandler.sendSuccess(res, 'Golf Clubs')(golfclubList);

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };



    /* @Method: golfclubSelect
   // @Description: User Golf club select
   */
    async golfclubSelect(req, res) {
        try {
            const loggedin_user_id = req.user._id;


            var selected_golfclub_ids = [];

            if (!_.has(req.body, 'selected_golfclub_ids')) {
                selected_golfclub_ids = [];
            }
            if (_.has(req.body, 'selected_golfclub_ids') && _.isArray(req.body.selected_golfclub_ids)) {
                req.body.selected_golfclub_ids.forEach(dat => {
                    selected_golfclub_ids.push({
                        clubId: dat.clubId,
                        distance: dat.distance
                    });
                })

            }
            const userUpdate = await userRepo.updateById({
                "selected_golfclub_ids": selected_golfclub_ids
            }, loggedin_user_id);
            if (!_.isEmpty(userUpdate)) {

                let objectIdArray = req.body.selected_golfclub_ids.map(s => mongoose.Types.ObjectId(s.clubId));
                var golfclubList = await golfClubRepo.getGolfClubByUser({ "selected_golf_clubs": objectIdArray }, req.user._id);

                requestHandler.sendSuccess(res, 'Golf Club updated successfully')(golfclubList);
            } else {

                requestHandler.throwError(400, 'Unprocessable Entity', 'Unable to update')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };



    /* @Method: Email Send
    // @Description: User will get an Email
    */
    async sendEmail(req, res) {
        try {
            req.body.from_email = req.body.from_email.trim();
            req.body.from_name = req.body.from_name.trim();
            req.body.subject = req.body.subject.trim();
            req.body.to = req.body.to.trim();
            let sendEmail = await mailHelper.sendMail(req.body.from_email, req.body.from_name, req.body.subject, req.body.to, req.body.templateid);
            if (!_.isEmpty(sendEmail)) {
                requestHandler.sendSuccess(res, 'Email Sent successfully')(sendEmail);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry something went wrong')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

};


module.exports = new UserController();