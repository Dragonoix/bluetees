const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const userDeviceController = require('webservice/blue_tees/userDevice.controller');
const config = require(appRoot + '/config/index')
const multer = require('multer');
const request_param = multer();



namedRouter.all('/user-device*', auth.authenticateAPI);



 /**
 * @swagger
 * /user-device/register:
 *   post:
 *     summary: User Device Register
 *     tags:
 *       - User Device
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: User Device Register
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - productId
 *                 - deviceName
 *                 - serialNumber
 *                 - iosSerialNumber
 *                 - androidSerialNumber
 *                 - osVersion
 *                 - email
 *                 - purchaseId
 *                 - socialMediaId
 *                 - isRegisterComplete
 *             properties:
 *                 productId:
 *                     type: string
 *                 deviceName:
 *                     type: string
 *                 serialNumber:
 *                     type: string
 *                 iosSerialNumber:
 *                     type: string
 *                 androidSerialNumber:
 *                     type: string
 *                 osVersion:
 *                     type: number
 *                 email:
 *                     type: string
 *                 purchaseId:
 *                     type: string
 *                 socialMediaId:
 *                     type: string
 *                 isRegisterComplete:
 *                  type: string 
 *                  items:
 *                      type: string
 *                  example: true/false 
 *   
 *                 
 *     responses:
 *        200:
 *          description: User device register
 *         
 */
  namedRouter.post("api.bluetees.user.device.register", '/user-device/register',request_param.any(),userDeviceController.register);

  /**
 * @swagger
 * /user-device/update/{deviceId}:
 *   put:
 *     summary: User Device Update
 *     tags:
 *       - User Device
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: deviceId
 *           description: Device ID
 *           in: path
 *           required: true
 *         - name: body
 *           in: body
 *           description: User Device Update
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - email
 *                 - purchaseId
 *                 - socialMediaId
 *                 - isRegisterComplete
 *             properties:
 *                 email:
 *                     type: string
 *                 purchaseId:
 *                     type: string
 *                 socialMediaId:
 *                     type: string
 *                 isRegisterComplete:
 *                  type: string 
 *                  items:
 *                      type: string
 *                  example: true/false 
 *   
 *                 
 *     responses:
 *        200:
 *          description: User device Update
 *         
 */
   namedRouter.put("api.bluetees.user.device.update", '/user-device/update/:id',request_param.any(),userDeviceController.deviceUpdate);

//  /**
//  * @swagger
//  * /customer-device/multiple-register:
//  *   post:
//  *     summary: Customer Device Multiple Register
//  *     tags:
//  *       - Customer Device
//  *     security:
//  *       - Token: []
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *         - name: body
//  *           in: body
//  *           description: Customer Device Multiple Register
//  *           required: true
//  *           schema:
//  *             type: object
//  *             required:
//  *                 - connectDeviceData
//  *             properties:
//  *                 connectDeviceData:
//  *                     type: array
//  *                     items:
//  *                         type: string
//  *                     example: [{"macId":"abcd-xxx-xxx","productId":12344555,"IosSerialNumber":"","AndroidSerialNumber":"xxx-xxx-xxx","deviceName":"Sound","lastHole":0},{"macId":"abcd-xxx-xxx","productId":12344555,"IosSerialNumber":"xxx-xxx-xxx","AndroidSerialNumber":"","deviceName":"Watch","lastHole":0}]
//  *                 
//  *     responses:
//  *        200:
//  *          description: Customer device multiple register
//  *         
//  */
//   namedRouter.post("admin.radgolf.customer.device.multiple.register", '/customer-device/multiple-register',request_param.any(),userDeviceController.multipleRegister);

/**
  * @swagger
  * /user-device/list:
  *   get:
  *     summary: User Device List
  *     tags:
  *       - User Device
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: Golf Ball Brand list fetched Successfully
  */
namedRouter.get("api.bluetees.user.device.list", '/user-device/list',userDeviceController.list);

// /**
//  * @swagger
//  * /customer-device/{deviceId}:
//  *   get:
//  *     summary: Customer Device Details
//  *     tags:
//  *       - Customer Device
//  *     security:
//  *       - Token: []
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - name: deviceId
//  *         description: Device ID
//  *         in: path
//  *         required: true
//  *     responses:
//  *        200:
//  *          description: Product details
//  *         
//  */
//  namedRouter.get("api.radgolf.customer.device.details", '/customer-device/:id',userDeviceController.details);

//  /**
//   * @swagger
//   * /customer-device/last-position-update:
//   *   put:
//   *     summary: Customer Device Last Position Update
//   *     tags:
//   *       - Customer Device
//   *     security:
//   *       - Token: []
//   *     produces:
//   *       - application/json
//   *     parameters:
//   *         - name: body
//   *           in: body
//   *           description: Device edit data
//   *           required: true
//   *           schema:
//   *             type: object
//   *             required:
//   *                 - platform
//   *                 - macId
//   *                 - lastLocation
//   *                 - lastLatitude
//   *                 - lastLongitude
//   *                 - lastConnected
//   *                 - lastHole
//   *             properties:
//   *                 platform:
//   *                     type: string 
//   *                     items:
//   *                         type: string
//   *                     example: ios/android 
//   *                 macId:
//   *                     type: string
//   *                 lastLocation:
//   *                     type: string
//   *                 lastLatitude:
//   *                     type: string
//   *                 lastLongitude:
//   *                     type: string
//   *                 lastConnected:
//   *                     type: string
//   *                 lastHole:
//   *                     type: string
//   *                 
//   *     responses:
//   *       200:
//   *         description: Device Last Position updated successfully
//   */
//   namedRouter.put("api.radgolf.customer.device.lastpostion.update", '/customer-device/last-position-update',request_param.any(), userDeviceController.lastPositionUpdate);

//  /**
//  * @swagger
//  * /customer-device/mark-lost/{deviceId}:
//  *   put:
//  *     summary: Customer Device Mark Lost/Found
//  *     tags:
//  *       - Customer Device
//  *     security:
//  *       - Token: []
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *         - name: deviceId
//  *           description: Device ID
//  *           in: path
//  *           required: true
//  *         - name: body
//  *           in: body
//  *           description: send lost or found for mark field value
//  *           required: true
//  *           schema:
//  *             type: object
//  *             required:
//  *                 - mark
//  *             properties:
//  *                 mark:
//  *                     type: string
//  *                 
//  *     responses:
//  *        200:
//  *          description: Device successfully reported as lost.
//  *         
//  */
//   namedRouter.put("api.radgolf.customer.device.lost_found", '/customer-device/mark-lost/:id',request_param.any(),userDeviceController.deviceLostFoundUpdate);
//  /**
//   * @swagger
//   * /customer-device/{deviceId}:
//   *   put:
//   *     summary: Customer Device Update
//   *     tags:
//   *       - Customer Device
//   *     security:
//   *       - Token: []
//   *     produces:
//   *       - application/json
//   *     parameters:
//   *         - name: deviceId
//   *           description: Device ID
//   *           in: path
//   *           required: true
//   *         - name: body
//   *           in: body
//   *           description: Device edit data
//   *           required: true
//   *           schema:
//   *             type: object
//   *             required:
//   *                 - productId
//   *                 - lastLocation
//   *                 - lastLatitude
//   *                 - lastLongitude
//   *                 - lastConnected
//   *                 - lastHole
//   *                 - basicSetting
//   *                 - announcementSetting
//   *                 - buttonSetting
//   *                 - premiumFeature
//   *                 - audioPlayThrough
//   *             properties:
//   *                 productId:
//   *                     type: string
//   *                 lastLocation:
//   *                     type: string
//   *                 lastLatitude:
//   *                     type: string
//   *                 lastLongitude:
//   *                     type: string
//   *                 lastConnected:
//   *                     type: string
//   *                 lastHole:
//   *                     type: string
//   *                 basicSetting:
//   *                     type: object
//   *                     items:
//   *                         type: string
//   *                     example: {"units":"YDS","mutePhoneOnSpeaker":"On"}
//   *                 announcementSetting:
//   *                     type: object
//   *                     items:
//   *                         type: string
//   *                     example: {"voice":"Aaron(USA)","distance":"Center","heckleSound":"Golf Clap","scoreConfirmation":"On","teeboxAnnouncement":"On"}
//   *                 buttonSetting:
//   *                     type: object
//   *                     items:
//   *                         type: string
//   *                     example: {"singlePress":"Distance","doublePress":"Heckle_Sound","pressHold":"Record_Score"}
//   *                 premiumFeature:
//   *                     type: object
//   *                     items:
//   *                         type: string
//   *                     example: {"shotTracking":"On"}
//   *                 
//   *     responses:
//   *       200:
//   *         description: Device info updated successfully
//   */
//   namedRouter.put("api.radgolf.customer.device.update", '/customer-device/:id',request_param.any(), userDeviceController.update);
  /**
 * @swagger
 * /user-device/delete/{deviceId}:
 *   delete:
 *     summary: User Device Delete
 *     tags:
 *       - User Device
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: deviceId
 *         description: Device ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: User Device Delete
 *         
 */
 namedRouter.delete("api.bluetees.User.device.Delete", '/user-device/delete/:id',userDeviceController.delete);

module.exports = router;