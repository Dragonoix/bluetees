const userDeviceRepo = require('UserDevice/repositories/userDevice.repository');
const userRepo = require('user/repositories/user.repository');
const _ = require('underscore');
const config = require(appRoot + '/config/index')
const utils = require(appRoot + '/helper/utils')
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const axios = require('axios');
const mongoose = require('mongoose');


class UserDeviceController {
    constructor() { }


    /* @Method: Device
    // @Description: Complete Device Register
    */
    async register(req, res) {
        try {
            req.body.userId = req.user._id;
            const checkSerialExist = await userDeviceRepo.getByField({
                serialNumber: req.body.serialNumber,
                isDeleted: false,
                isRegisterComplete: true
            });

            if (checkSerialExist != null) {
                requestHandler.throwError(400, 'bad request', 'Sorry the Device is already registered with same serial Number!')();
            } else {
                var count = await userDeviceRepo.updateCount(req.user._id)
                const condition = await userDeviceRepo.getByField({
                    serialNumber: req.body.serialNumber,
                    isDeleted: false,
                    isRegisterComplete: false
                });
                if (condition != null) {
                    if (count.isWarranty >= 1 && (req.body.isRegisterComplete == false || req.body.isRegisterComplete == undefined) )  {
                        requestHandler.throwError(400, 'bad request', 'Sorry the Device is already registered!')();
                        return;
                    }
                    let deviceRegisterUpdate = await userDeviceRepo.updateById(req.body, condition._id);
                    requestHandler.sendSuccess(res, 'Device registered successfully')(deviceRegisterUpdate);
                    return;
                }
                let deviceRegister = await userDeviceRepo.save(req.body);
                requestHandler.sendSuccess(res, 'Device registered successfully')(deviceRegister);               
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /* @Method: Device Register Update
    // @Description: Device Complete Registration Update
    */
    async deviceUpdate(req, res) {
        try {
            const deviceId = req.params.id;
            const userId = req.user._id;
            const conditionData = {
                _id: mongoose.Types.ObjectId(deviceId),
                userId: mongoose.Types.ObjectId(userId),
            };
            const checkExist = await userDeviceRepo.getByField(conditionData);
            if (_.isEmpty(checkExist)) {
                requestHandler.throwError(400, 'bad request', 'Sorry device not found')();
            } else {
                const deviceUpdate = await userDeviceRepo.updateById(req.body, deviceId)
                if (!_.isEmpty(deviceUpdate)) {
                    requestHandler.sendSuccess(res, 'Thank you for completing your Device registration')(deviceUpdate);
                } else {
                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /* @Method: multipleRegister
    // @Description: Device Multiple Register
    */
    async multipleRegister(req, res) {
        try {
            const userId = req.user._id;
            if (!_.has(req.body, 'connectDeviceData') || !_.isArray(req.body.connectDeviceData)) {
                requestHandler.throwError(400, 'bad request', 'Device data field must be an array')();
            } else {
                let serial_number = '';
                let product_id = '';
                let conditionData = {};
                let IosSerialNumber = '';
                let AndroidSerialNumber = '';
                let deviceName = '';
                let deviceDataArr = [];
                await utils.asyncForEach(req.body.connectDeviceData, async (connectDeviceData) => {
                    serial_number = connectDeviceData.macId;
                    product_id = connectDeviceData.productId;
                    IosSerialNumber = connectDeviceData.IosSerialNumber;
                    AndroidSerialNumber = connectDeviceData.AndroidSerialNumber;
                    deviceName = connectDeviceData.deviceName;
                    conditionData = {
                        userId: mongoose.Types.ObjectId(userId),
                        productId: product_id
                    };

                    const checkExist = await userDeviceRepo.getByField(conditionData);
                    if (_.isEmpty(checkExist)) {
                        let insertObj = {}
                        insertObj.IosSerialNumber = IosSerialNumber
                        insertObj.AndroidSerialNumber = AndroidSerialNumber
                        insertObj.serialNumber = serial_number
                        insertObj.userId = userId
                        insertObj.productId = product_id
                        insertObj.deviceName = deviceName
                        insertObj.lastConnected = _.has(connectDeviceData, 'lastConnected') ? connectDeviceData.lastConnected : ''
                        insertObj.lastLocation = _.has(connectDeviceData, 'lastLocation') ? connectDeviceData.lastLocation : ''
                        insertObj.lastLatitude = _.has(connectDeviceData, 'lastLatitude') ? connectDeviceData.lastLatitude : ''
                        insertObj.lastLongitude = _.has(connectDeviceData, 'lastLongitude') ? connectDeviceData.lastLongitude : ''
                        //insertObj.lastHole = _.has(connectDeviceData, 'lastHole')?parseInt(connectDeviceData.lastHole):0;
                        let deviceRegister = await userDeviceRepo.save(insertObj);
                        deviceDataArr.push(deviceDataArr)
                    } else {
                        let updateObj = {}
                        updateObj.IosSerialNumber = IosSerialNumber
                        updateObj.AndroidSerialNumber = AndroidSerialNumber
                        updateObj.serialNumber = serial_number
                        updateObj.deviceName = deviceName
                        //updateObj.lastHole = _.has(connectDeviceData, 'lastHole')?parseInt(connectDeviceData.lastHole):0;
                        const deviceUpdate = await userDeviceRepo.updateById(updateObj, checkExist._id)
                        deviceDataArr.push(deviceUpdate)
                    }

                })

                if (!_.isEmpty(deviceDataArr) && deviceDataArr.length > 0) {
                    return requestHandler.sendSuccess(res, 'Device details')(deviceDataArr);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry device not found')();
                }

            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /*
    // @Method: list
    // @Description: Device list
    */
    async list(req, res) {
        try {
            let result = await userDeviceRepo.getAllUserDevice(req);
            if (_.isEmpty(result.docs)) {
                requestHandler.throwError(400, 'bad request', 'Sorry device not found!')();
            } else {
                requestHandler.sendSuccess(res, 'Device list fetched Successfully')(result.docs, { numOfPages: result.pages, totalRecords: result.total });
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: details
    // @Description: Device details
    */
    async details(req, res) {
        try {
            const deviceId = req.params.id;
            const result = await userDeviceRepo.getDetails({ _id: mongoose.Types.ObjectId(deviceId) })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Device details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry device not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: update
    // @Description: Device Info Update
    */
    async update(req, res) {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const product_id = req.body.productId;
            const conditionData = {
                _id: mongoose.Types.ObjectId(id),
                userId: mongoose.Types.ObjectId(userId),
                productId: product_id
            };
            const checkExist = await userDeviceRepo.getByField(conditionData);
            if (_.isEmpty(checkExist)) {
                requestHandler.throwError(400, 'bad request', 'Sorry device not found')();
            } else {
                const deviceUpdate = await userDeviceRepo.updateById(req.body, id)
                if (!_.isEmpty(deviceUpdate)) {
                    requestHandler.sendSuccess(res, 'Device info has updated successfully')(deviceUpdate);
                } else {
                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /* @Method: lastPositionUpdate
    // @Description: Device Last Position Update
    */
    async lastPositionUpdate(req, res) {
        try {

            const userId = req.user._id;
            const conditionData = {
                userId: mongoose.Types.ObjectId(userId)
            };
            if (_.has(req.body, 'platform') && req.body.platform == 'ios') {
                conditionData["IosSerialNumber"] = req.body.macId.toString()
            }
            if (_.has(req.body, 'platform') && req.body.platform == 'android') {
                conditionData["AndroidSerialNumber"] = req.body.macId.toString()
            }
            console.log(conditionData)
            const checkExist = await userDeviceRepo.getByField(conditionData);
            console.log(checkExist, checkExist.lastHole)
            if (_.isEmpty(checkExist)) {
                requestHandler.throwError(400, 'bad request', 'Sorry device not found')();
            } else {
                const lastHolePosition = _.has(req.body, 'lastHole') ? parseInt(req.body.lastHole) : checkExist.lastHole;
                // If hole number greater than 0 //
                if (lastHolePosition > 0) {
                    const updateObj = {
                        lastHole: lastHolePosition, lastConnected: req.body.lastConnected,
                        lastLocation: req.body.lastLocation, lastLatitude: req.body.lastLatitude,
                        lastLongitude: req.body.lastLongitude
                    }
                    const deviceUpdate = await userDeviceRepo.updateByField(updateObj, conditionData)
                    if (!_.isEmpty(deviceUpdate)) {
                        requestHandler.sendSuccess(res, 'Device info has updated successfully')(deviceUpdate);
                    } else {
                        requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                    }

                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry unable to update')();
                }

            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /* @Method: deviceLostFoundUpdate
    // @Description: Device Lost/Found Update
    */
    async deviceLostFoundUpdate(req, res) {
        try {
            const deviceId = req.params.id;
            if (!req.body.mark || !['lost', 'found'].includes(req.body.mark)) {
                requestHandler.throwError(400, 'bad request', 'mark field is required with valid inputs from the following: lost, found!')();
            } else {
                let getDeviceInfo = await userDeviceRepo.getById(deviceId);
                if (!getDeviceInfo) {
                    requestHandler.throwError(400, 'bad request', 'No such device found!')();
                } else if (req.body.mark == "lost") {
                    if (getDeviceInfo.lostDevice) {
                        requestHandler.throwError(400, 'bad request', 'Device already marked as lost once!')();
                    } else {
                        let updateDevice = await userDeviceRepo.updateById({ lostDevice: true }, getDeviceInfo._id);
                        if (updateDevice && updateDevice._id) {
                            return requestHandler.sendSuccess(res, 'Device successfully reported as lost.')(updateDevice);
                        } else {
                            requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                        }
                    }
                } else if (req.body.mark == "found") {
                    if (!getDeviceInfo.lostDevice) {
                        requestHandler.throwError(400, 'bad request', 'Device was not marked as lost!')();
                    } else {
                        let updateDevice = await userDeviceRepo.updateById({ lostDevice: false }, getDeviceInfo._id);
                        if (updateDevice && updateDevice._id) {
                            return requestHandler.sendSuccess(res, 'Device successfully marked as found.')(updateDevice);
                        } else {
                            requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                        }
                    }
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: Delete Device
    // @Description: User Device Deleted
    */
    async delete(req, res) {
        try {
            const deviceId = mongoose.Types.ObjectId(req.params.id);
            const deviceDetails = await userDeviceRepo.getById(deviceId);
            if (!_.isEmpty(deviceDetails)) {
                const updateDevice = await userDeviceRepo.updateById({ isDeleted: true }, deviceId);
                if (updateDevice && updateDevice._id) {
                    requestHandler.sendSuccess(res, 'Device deleted successfully')({ deleted: true });
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

    /* @Method: manualDeviceRegister
    // @Description: Rad Pass Device Register
    */
    async manualDeviceRegister(req, res) {
        try {

            let userData = await customerRepo.getAllWithoutPagination(req);
            //console.log(userData);
            for (let i = 0; i < userData.length; i++) {

                const conditionData = {
                    userId: mongoose.Types.ObjectId(userData[i]._id),
                    productId: "6262ce144321d0b9bc865b70"
                };
                const checkExist = await userDeviceRepo.getByField(conditionData);
                //console.log("device",checkExist);
                if (_.isEmpty(checkExist)) {
                    let insertObj = {}
                    insertObj.IosSerialNumber = ""
                    insertObj.AndroidSerialNumber = ""
                    insertObj.serialNumber = 'xxx-xxx-xxx'
                    insertObj.userId = userData[i]._id
                    insertObj.productId = "6262ce144321d0b9bc865b70"
                    insertObj.deviceName = "LAUNCH"
                    insertObj.subscriptionEndDate = "06/15/2024"
                    insertObj.lastHole = 0;
                    let deviceRegister = await userDeviceRepo.save(insertObj);
                } else {
                    console.log("deviced", checkExist);
                }

            }
            requestHandler.sendSuccess(res, 'device registered successfully')();

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

}

module.exports = new UserDeviceController();