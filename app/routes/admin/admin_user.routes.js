const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const adminUserController = require('admin_user/controllers/adminuser.controller');
const config = require(appRoot + '/config/index')
// Image upload in aws bucket //
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
   * /user/forget-password:
   *   post:
   *     summary: User Forget Password
   *     tags:
   *       - User
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         description: User Forget Password
   *         required: true
   *         schema:
   *             type: object
   *             required:
   *                 - email
   *             properties:
   *                 email:
   *                    type: string
   *     responses:
   *        200:
   *          description: We have sent you a link to reset your Password
   *         
  */
  namedRouter.post("admin.adminuser.forget.password", '/user/forget-password',request_param.any(),adminUserController.forgetPassword);
  
  
  /**
   * @swagger
   * /user/reset-password/:token:
   *   post:
   *     summary: User Reset Password
   *     tags:
   *       - User
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         in: path
   *         required: true
   *       - name: body
   *         in: body
   *         description: User Reset Password
   *         required: true
   *         schema:
   *             type: object
   *             required:
   *                 - newPassword
   *                 - confirmNewPassword
   *             properties:
   *                 newPassword:
   *                    type: string
   *                 confirmNewPassword:
   *                    type: string
   *     responses:
   *        200:
   *          description: User password has been changed successfully
   *         
   */
  
  namedRouter.post("admin.adminuser.reset.password", '/user/reset-password',request_param.any(),adminUserController.resetPassword);
  
  namedRouter.all('/user*', auth.authenticateAPI);
  namedRouter.all('/admin-user*', auth.authenticateAPI);

  /**
   * @swagger
   * /user/getall:
   *   post:
   *     summary: User List
   *     tags:
   *       - User
   *     security:
   *       - Token: []
   *     produces:
   *       - application/json
   *     parameters:
   *         - name: body
   *           in: body
   *           description: User List
   *           required: true
   *           schema:
 *             type: object
 *             required:
 *                 - search
 *                 - columns
 *                 - page
 *             properties:
 *                 search:
 *                     type: object 
 *                     example: {"value":"Kent"}
 *                 columns:
 *                     type: array
 *                     example: [{"data": "status", "search": {"value":"Active"}}] 
 *                 page: 
 *                     type: number
 *                     example: 1
   *     responses:
   *       200:
   *         description: User list fetched Successfully
   */
 namedRouter.post("admin.adminuser.getall", '/user/getall',request_param.any(), adminUserController.list);

  /**
  * @swagger
  * /user-details/{UserId}:
  *   get:
  *     summary: User Details
  *     tags:
  *       - User
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: UserId
  *         description: User ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: User details
  *         
  */
 namedRouter.get("admin.adminuser.details", '/user-details/:id',adminUserController.details);


  /**
  * @swagger
  * /admin-user/dashboard:
  *   get:
  *     summary: Admin User Dashboard
  *     tags:
  *       - Basic
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     responses:
  *        200:
  *          description: All the details respect to users to Admin
  *         
  */
   namedRouter.get("admin.adminuser.dashboard", '/admin-user/dashboard',adminUserController.dashboard);
 
  /**
   * @swagger
   * /user-update/{UserId}:
   *   put:
   *     summary: User Update
   *     tags:
   *       - User
   *     security:
   *       - Token: []
   *     produces:
   *       - application/json
   *     parameters:
   *         - name: adminUserId
   *           description: Admin User ID
   *           in: path
   *           required: true
   *         - in: formData
   *           name: Profile_image
   *           type: file
   *           description: The file to upload.
   *         - in: formData
   *           name: name
   *           type: string
   *           description: Name.    
   *         - in: formData
   *           name: email
   *           type: string
   *           description: Email.    
   *         - in: formData
   *           name: phone
   *           type: string
   *           description: Phone Number.     
   *         - in: formData
   *           name: gender
   *           type: string
   *           description: Gender.     
   *         - in: formData
   *           name: age
   *           type: string
   *           description: age.     
   *                 
   *     responses:
   *       200:
   *         description: User updated successfully
   */
   namedRouter.put("admin.adminuser.update", '/user-update/:id',uploadFile.any(), adminUserController.update);
 
 /**
  * @swagger
  * /user/status-change/{UserId}:
  *   put:
  *     summary: User Status Change
  *     tags:
  *       - User
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: UserId
  *         description: User ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: User status has changed successfully
  *         
  */
  namedRouter.put("admin.adminuser.statuschange", '/user/status-change/:id',adminUserController.statusChange);
 
  
  /**
  * @swagger
  * /user-delete/{UserId}:
  *   delete:
  *     summary: User Delete
  *     tags:
  *       - User
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: adminUserId
  *         description: Admin User ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: User delete
  *         
  */
 namedRouter.delete("admin.adminuser.delete", '/user-delete/:id',adminUserController.delete);


   /**
   * @swagger
   * /user/create-email:
   *   post:
   *     summary: Email Template Create
   *     tags:
   *       - Basic
   *     security:
   *       - Token: []
   *     produces:
   *       - application/json
   *     parameters:   
   *         - in: formData
   *           name: name
   *           type: string
   *           description: Enter the name.    
   *         - in: formData
   *           name: html
   *           type: string
   *           description: Enter the text. 
   *     responses:
   *       200:
   *         description: User updated successfully
   */
    namedRouter.post("admin.adminuser.createEmail", '/user/create-email',uploadFile.any(), adminUserController.createEmailTemplate);

        /* APIs for the admin user */
     /**
   * @swagger
   * /user/add/admin-user:
   *   post:
   *     summary: Add Admin User
   *     tags:
   *       - Admin User
   *     security:
   *       - Token: []
   *     produces:
   *       - application/json
   *     parameters:
   *         - in: formData
   *           name: profile_image
   *           type: file
   *           description: The file to upload.
   *         - in: formData
   *           name: first_name
   *           type: string
   *           required: true
   *           description: First Name.
   *         - in: formData
   *           name: last_name
   *           type: string
   *           required: true
   *           description: Last Name.
   *         - in: formData
   *           name: email
   *           type: string
   *           required: true
   *           description: Email Address.  
   *         - in: formData
   *           name: phone
   *           type: string
   *           description: Phone Number. 
   *         - in: formData
   *           name: role
   *           required: true
   *           type: string
   *           description: Role Id.  
   *     responses:
   *       200:
   *         description: Admin user has been added successfully.
   *       403:
   *         description: User already exists with same email
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Server Error
   */
     namedRouter.post("admin.user.add", '/user/add/admin-user',uploadFile.any(), adminUserController.addAdminUser);

     /**
   * @swagger
   * /user/admin-user-view/{user_id}:
   *   get:
   *     summary: Get Admin User Details
   *     tags:
   *       - Admin User
   *     security:
   *       - Token: []
   *     parameters:
   *       - name: user_id
   *         description: Admin User ID
   *         in: path
   *         required: true
   *     produces:
   *       - application/json
   *     responses:
   *        200:
   *          description: Admin user details has been fetched successfully
   *        400:
   *         description: Bad Request
   */
     namedRouter.get("admin.user.view", '/user/admin-user-view/:id',request_param.any(),adminUserController.adminUserView);
 
     /**
    * @swagger
    * /user/admin-user-update:
    *   post:
    *     summary: Admin user update
    *     tags:
    *       - Admin User
    *     security:
    *       - Token: []
    *     produces:
    *       - application/json
    *     parameters:
    *         - in: formData
    *           name: profile_image
    *           type: file
    *           description: The file to upload.
    *         - in: formData
    *           name: first_name
    *           type: string
    *           description: First Name.
    *         - in: formData
    *           name: last_name
    *           type: string
    *           description: Last Name.
    *         - in: formData
    *           name: user_id
    *           type: string
    *           required: true
    *           description: User Id(_id of the user).  
    *         - in: formData
    *           name: phone
    *           type: string
    *           description: Phone Number. 
    *         - in: formData
    *           name: role
    *           type: string
    *           description: Role Id.  
    *     responses:
    *       200:
    *         description:Admin user details has been updated successfully.
    *       400:
    *         description: Bad Request
    *       500:
    *         description: Server Error
    */
     namedRouter.post("admin.user.update", '/user/admin-user-update',uploadFile.any(), adminUserController.adminUserUpdate);
 
     /**
   * @swagger
   * /user/admin-user/status-change/:id:
   *   post:
   *     summary: Admin User Status Change
   *     tags:
   *       - Admin User
   *     security:
   *       - Token: []
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: User Id(_id of the user)
   *         in: path
   *         required: true
   *     responses:
   *        200:
   *          description: Admin user status has been changed successfully 
   */
   namedRouter.post("admin.user.statusChange",'/user/admin-user/status-change/:id',adminUserController.adminUserStatusChange);
 
    /**
   * @swagger
   * /user/admin-user-delete/:id:
   *   post:
   *     summary: Admin User Delete
   *     tags:
   *       - Admin User
   *     security:
   *       - Token: []
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: User Id(_id of the user)
   *         in: path
   *         required: true
   *     responses:
   *        200:
   *          description: Admin user status has been changed successfully 
   */
   namedRouter.post("admin.user.delete", '/user/admin-user-delete/:id',adminUserController.adminUserDelete);
 
   /**
  * @swagger
  * /user/admin-user-list:
  *   post:
  *     summary: Get Admin User List
  *     tags:
  *       - Admin User
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: body
  *           in: body
  *           description: User List
  *           required: true
  *           schema:
  *             type: object
  *             required:
  *                 - search
  *                 - columns
  *                 - page
  *             properties:
  *                 search:
  *                     type: object 
  *                     example: {"value":"Kent"}
  *                 columns:
  *                     type: array
  *                     example: [{"data": "status", "search": {"value":"Active"}}] 
  *                 page: 
  *                     type: number
  *                     example: 1
  *     responses:
  *        200:
  *          description: Admin user list been fetched successfully
  *        400:
  *          description: Bad Request
  *        500:
  *          description: Server Error
  */
 
   namedRouter.post("admin.user.list", '/user/admin-user-list',adminUserController.getAdminUserList);

   /**
 * @swagger
 * /backend-role/list:
 *   get:
 *     summary: Backend Role List
 *     tags:
 *       - Admin User
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: Backend Role details
 *         
 */
 namedRouter.get("admin.user.backend.list", '/backend-role/list', request_param.any(),  adminUserController.backendList);


/**
   * @swagger
   * /user/getall-domestic-rounds:
   *   post:
   *     summary: User List
   *     tags:
   *       - User
   *     security:
   *       - Token: []
   *     produces:
   *       - application/json
   *     parameters:
   *         - name: body
   *           in: body
   *           description: User List
   *           required: true
   *           schema:
   *             type: object
   *             required:
   *                 - page
   *             properties:
   *                 page: 
   *                     type: number
   *                     example: 1
   *     responses:
   *       200:
   *         description: All Domestic Rounds With Pagination
   */
 namedRouter.post("admin.user.getall-domestic-rounds", '/user/getall-domestic-rounds', request_param.any(),  adminUserController.getallDomesticRounds);



/**
   * @swagger
   * /user/getall-international-rounds:
   *   post:
   *     summary: User List
   *     tags:
   *       - User
   *     security:
   *       - Token: []
   *     produces:
   *       - application/json
   *     parameters:
   *         - name: body
   *           in: body
   *           description: User List
   *           required: true
   *           schema:
   *             type: object
   *             required:
   *                 - page
   *             properties:
   *                 page: 
   *                     type: number
   *                     example: 1
   *     responses:
   *       200:
   *         description: All international Rounds With Pagination
   */
 namedRouter.post("admin.user.getall-international-rounds", '/user/getall-international-rounds', request_param.any(),  adminUserController.getallInternationalRounds);



   /**
 * @swagger
 * /admin-user/customer-support-dashboard/list:
 *   get:
 *     summary: Customer Support Dashboard
 *     tags:
 *       - Basic
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: Customer Support Dashboard Details.
 *         
 */
    namedRouter.get("admin.customer.support.dashboard", '/admin-user/customer-support-dashboard/list', request_param.any(), adminUserController.customerDashboard);


   /**
 * @swagger
 * /admin-user/customer-support-dashboard/gorgias:
 *   get:
 *     summary: Customer Support Dashboard gorgias data
 *     tags:
 *       - Basic
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: Customer Support Dashboard Gorgias Details
 *         
 */
   namedRouter.get("admin.customer.support.dashboard.gorgias", '/admin-user/customer-support-dashboard/gorgias', request_param.any(), adminUserController.customerDashboardGorgiasData);





module.exports = router;