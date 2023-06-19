const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const userController = require('webservice/blue_tees/user.controller');
const postscriptController = require('webservice/blue_tees/postscript.controller');
const config = require(appRoot + '/config/index');
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();
const multerS3 = require('multer-s3');
const multer = require('multer');

const uploadFile = multer({
  storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: config.aws.bucket,
      //contentType: multerS3.AUTO_CONTENT_TYPE,
      contentType: function (req, file, cb) {
          cb(null, file.mimetype);
      }, 
      metadata: function (req, file, cb) {
          cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
          cb(null, 'bluetees-app/'+file.fieldname + "_" + Date.now() + "_" + file.originalname.replace(/\s/g, '_'))
      }
  })
})

const request_param = multer();

/**
 * @swagger
 * /user-registration/otp-send:
 *   post:
 *     summary: Send Registration OTP to USER
 *     tags:
 *       - Basic
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: User Registration By OTP and You will get the USER ID
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - first_name
 *           - last_name
 *           - country_code
 *           - phone
 *           - want_newsletter
 *         properties:
 *           first_name:
 *             type: string          
 *           last_name:
 *             type: string
 *           country_code:
 *             type: string
 *           phone:
 *             type: string
 *           want_newsletter:
 *              type: boolean
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad Request
 */
// login process route
namedRouter.post("api.bluetees.user-registration.otp.send", '/user-registration/otp-send',request_param.any(), userController.sendRegistrationOTP);


/**
 * @swagger
 * /user-login/otp-send:
 *   post:
 *     summary: Send Login OTP to USER
 *     tags:
 *       - Basic
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: User Login By OTP and You will get the USER ID
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - country_code
 *           - phone
 *         properties:
 *           country_code:
 *             type: string
 *           phone:
 *             type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad Request
 */
// login process route
namedRouter.post("api.bluetees.user-login.otp.send", '/user-login/otp-send',request_param.any(), userController.sendLoginOTP);

/**
 * @swagger
 * /user/resend-otp:
 *   post:
 *     summary: User Resend OTP
 *     tags:
 *       - Basic
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Resend the OTP and You will get the USER ID
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - country_code
 *           - phone
 *         properties:
 *           country_code:
 *             type: string
 *           phone:
 *             type: string
 *     responses:
 *       200:
 *         description: OTP resend successfully
 */
// login process route
namedRouter.post("api.bluetees.user.resend.otp", '/user/resend-otp',request_param.any(), userController.resendOTP);

/**
 * @swagger
 * /user/verify-otp:
 *   post:
 *     summary: User Verify OTP
 *     tags:
 *       - Basic
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: The verify otp
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - userId
 *           - userOTP  
 *         properties:
 *           userId:
 *             type: string
 *           userOTP:
 *             type: string
 *     responses:
 *       200:
 *         description: User Registered Successfully and use same USER ID 
 */
// login process route
namedRouter.post("api.bluetees.user.verify.otp", '/user/verify-otp',request_param.any(), userController.verifyOTP);



/**
 * @swagger
 * /user/verify-Id:
 *   post:
 *     summary: User Verify by Face or Finger Print ID
 *     tags:
 *       - Basic
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Verify by Face ID or Finger Print ID
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - faceId
 *           - fingerPrintId
 *           - faceIdButton  
 *         properties:
 *           faceId:
 *             type: string
 *           fingerPrintId:
 *             type: string
 *           faceIdButton:
 *             type: string 
 *             items:
 *                 type: string
 *             example: On/Off 
 *     responses:
 *       200:
 *         description: User Registered Successfully and use same USER ID 
 */
// login process route
namedRouter.post("api.bluetees.user.verify.Id", '/user/verify-Id',request_param.any(), userController.faceAndFingerprintID);



namedRouter.all('/user*', auth.authenticateAPI);


/** 
 * @swagger
 * /user/update-profile:
 *   post:
 *     summary: User profile update
 *     tags:
 *       - Basic
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: formData
 *        name: profile_image
 *        type: file
 *        description: The file to upload.
 *      - in: formData
 *        name: first_name
 *        type: string
 *        description: First Name.
 *      - in: formData
 *        name: last_name
 *        type: string
 *        description: Last Name.  
 *      - in: formData
 *        name: email
 *        type: string
 *        description: Email.       
 *      - in: formData
 *        name: gender
 *        type: string
 *        description: Gender ( male, female, N/A).         
 *      - in: formData
 *        name: skill_level
 *        type: Id
 *        description: Skill Level ID(63898d2fe77fe2994dd172cd).               
 *      - in: formData
 *        name: age
 *        type: string
 *        description: Age.
 *      - in: formData
 *        name: homeCourse
 *        type: string
 *        description: Home Course. 
 *      - in: formData
 *        name: homeCourseName
 *        type: string
 *        description: Home Course Name. 
 *      - in: formData
 *        name: personalize_experince
 *        type: string
 *        description: Personalize Your Experience.
 *      - in: formData
 *        name: handicap
 *        type: string
 *        description: Handicap. 
 *      - in: formData
 *        name: id_course
 *        type: string
 *        description: Course ID. 
 *      - in: formData
 *        name: courseName
 *        type: string
 *        description: Course Name. 
 *      - in: formData
 *        name: city
 *        type: string
 *        description: City Name. 
 *      - in: formData
 *        name: stateShort
 *        type: string
 *        description: State Name.
 *      - in: formData
 *        name: layoutTotalHoles
 *        type: string
 *        description: Total Holes Layout.  
 *      - in: formData
 *        name: longitude
 *        type: string
 *        description: longitude. 
 *      - in: formData
 *        name: latitude
 *        type: string
 *        description: latitude. 
 *      - in: formData
 *        name: ghinNumber
 *        type: string
 *        description: Ghin Number.
 *      - in: formData
 *        name: faceId
 *        type: string
 *        description: Face ID. 
 *      - in: formData
 *        name: fingerPrintId
 *        type: string
 *        description: Finger Print ID.   
 *     responses:
 *         200:
 *           description: Your profile has updated successfully
 *    
 */
 namedRouter.post("api.bluetees.user.updateprofile", '/user/update-profile', uploadFile.any(), userController.updateProfile);

   /**
  * @swagger
  * /user-details:
  *   get:
  *     summary: User Details
  *     tags:
  *       - Basic
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     responses:
  *        200:
  *          description: User details
  *         
  */
    namedRouter.get("api.user.details", '/user-details',userController.details);


 /**
 * @swagger
 * /user/delete:
 *   delete:
 *     summary: User Delete
 *     tags:
 *       - Basic
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: User Soft delete
 *         
 */
  namedRouter.delete("api.user.delete", '/user/delete', userController.delete);


  /**
  * @swagger
  * /user/golfclub/list:
  *   get:
  *     summary: Golf Club List
  *     tags:
  *       - Golf Club
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: Golf Club list fetched Successfully
  */
  namedRouter.get("api.user.golfclub.list", '/user/golfclub/list',userController.golfclubList);


  namedRouter.post("api.user.golfclub.update", '/user/golfclub/update', uploadFile.any(), userController.golfclubSelect);


   /**
   * @swagger
   * /user/send-email:
   *   post:
   *     summary: Send the Email
   *     tags:
   *       - Basic
   *     security:
   *       - Token: []
   *     produces:
   *       - application/json
   *     parameters:   
   *         - name: templateid
   *           description: Template ID
   *           in: formData
   *           required: true
   *         - in: formData
   *           name: from_email
   *           type: string
   *           description: Enter the Admin Email.    
   *         - in: formData
   *           name: from_name
   *           type: string
   *           description: Enter the Admin Name.
   *         - in: formData
   *           name: subject
   *           type: string
   *           description: Enter the Email Subject. 
   *         - in: formData
   *           name: to
   *           type: string
   *           description: Enter the Sender Email.  
   *     responses:
   *       200:
   *         description: User updated successfully
   */
    namedRouter.post("api.user.send-email", '/user/send-email',uploadFile.any(), userController.sendEmail);


   /**
   * @swagger
   * /user/send-data:
   *   post:
   *     summary: Send the data to postscript
   *     tags:
   *       - Basic
   *     security:
   *       - Token: []
   *     produces:
   *       - application/json
   *     parameters:   
   *         - in: formData
   *           name: phone_number
   *           type: number
   *           description: Enter the Phone number.
   *         - in: formData
   *           name: keyword_id
   *           type: string
   *           description: Enter the Keyword ID.
   *         - in: formData
   *           name: email
   *           type: string
   *           description: Enter the Keyword ID.          
   *     responses:
   *       200:
   *         description: Data sent to Postscript successfully
   */
    namedRouter.post("api.user.send-data", '/user/send-data', uploadFile.any(), postscriptController.sendData);


/**
 * @swagger
 * /user/phone-update/otp:
 *   post:
 *     summary: User update phone number by otp validation request
 *     tags:
 *       - Basic
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: User update phone number by otp validation request
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - first_name
 *           - last_name
 *           - email
 *           - country
 *           - language
 *           - country_code
 *           - phone     
 *         properties:
 *           first_name:
 *             type: string
 *           last_name:
 *             type: string
 *           email:
 *             type: string 
 *           country:
 *             type: string 
 *           language:
 *             type: string 
 *           country_code:
 *             type: string 
 *           phone:
 *             type: string 
 *     responses:
 *       200:
 *         description: OTP Sent Successfully.
 */

namedRouter.post("api.user.phone-update.otp", '/user/phone-update/otp',request_param.any(), userController.updatePhoneNumber);

/**
 * @swagger
 * /user/phone-update/validate:
 *   post:
 *     summary: User validate otp and update phone number.
 *     tags:
 *       - Basic
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: User validate otp and update phone number.
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - otp_code    
 *         properties:
 *           otp_code:
 *             type: string

 *     responses:
 *       200:
 *         description: Your profile has been updated successfully!
 */

namedRouter.post("api.user.phone-update.validate", '/user/phone-update/validate',request_param.any(), userController.validateOtpAndSavePhone);



module.exports = router;