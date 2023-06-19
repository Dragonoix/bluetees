const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const userController = require('user/controllers/user.controller');
const config = require(appRoot + '/config/index')
// Image upload in aws bucket //
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();
const multerS3 = require('multer-s3');
const multer = require('multer');
const fs = require('fs');

const Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (!fs.existsSync("./public/uploads")) {
            fs.mkdirSync("./public/uploads");
        }
        if (!fs.existsSync("./public/uploads/images")) {
            fs.mkdirSync("./public/uploads/images");
        }
        callback(null, "./public/uploads/images");
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
    }
});

const contentStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
            callback(null, './public/uploads/user')
        } else {
            callback(null, "./public/uploads/content-management");
        }
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
    }
});

const uploadFile = multer({
    storage: Storage,
    limits: {
        fileSize: 1*1024*1024
    }
});

const uploadContent = multer({
    storage: contentStorage
});


const request_param = multer();

/**
  * @swagger
  * /login:
  *   post:
  *     summary: Super Admin Login
  *     tags:
  *       - Basic
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       description: The login credentials
  *       required: true
  *       schema:
  *         type: object
  *         required:
  *           - email
  *           - password
  *         properties:
  *           email:
  *             type: string
  *           password:
  *             type: string
  *     responses:
  *       200:
  *         description: user logged in succesfully
  *         examples:
  *           application/json:
  *             {
  *               "type": "success",
  *               "message": "User logged in Successfully",
  *               "data": {
  *                   "platform": "web",
  *                   "_id": "5ff30ac3026424da732696aa",
  *                   "name": "Emily Hawk",
  *                   "email": "dev@blueteesgolf.com",
  *                   "password": "$2a$10$tacuk8DJEnTU/5TKiYySNuG0LjH7V9VP4uG/M..IRiBDfVulmW0iy",
  *                   "role": {
  *                       "_id": "63884d573a635195ac875f55",
  *                       "roleDisplayName": "Admin",
  *                       "rolegroup": "backend",
  *                       "role": "admin",
  *                       "desc": "Super Administrator of the application.",
  *                       "id": "63884d573a635195ac875f55"
  *                   },
  *                   "phone": "88776655",
  *                   "profile_image": "1670401369592_beautiful-hologram-water-color-frame-png_119551.jpg",
  *                   "deviceToken": "",
  *                   "deviceType": "",
  *                   "isDeleted": false,
  *                   "isActive": true,
  *                   "updatedAt": "2022-03-15T15:51:47.899Z",
  *                   "last_login_date": "2022-03-15T15:51:47.897Z"
  *               },
  *               "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzOTA0ZDU5M2FkYmJkMDIxMTdkYzIwYiIsIm5hbWUiOiJFbWlseSBIYXdrIiwiZW1haWwiOiJkZXZAYmx1ZXRlZXNnb2xmLmNvbSIsInBob25lIjoiODg3NzY2NTUiLCJyb2xlIjp7Il9pZCI6IjYzODg0ZDU3M2E2MzUxOTVhYzg3NWY1NSIsInJvbGVEaXNwbGF5TmFtZSI6IkFkbWluIiwicm9sZSI6ImFkbWluIiwicm9sZWdyb3VwIjoiYmFja2VuZCIsImRlc2MiOiI8cD5BZG1pbmlzdHJhdGlvbiBNYW5hZ2VyPC9wPiIsImlzRGVsZXRlZCI6ZmFsc2UsInN0YXR1cyI6IkFjdGl2ZSIsImNyZWF0ZWRBdCI6IjIwMjItMTAtMTNUMDc6MDA6MDEuOTI5WiIsInVwZGF0ZWRBdCI6IjIwMjItMTAtMTNUMDc6MDA6MDEuOTI5WiIsImlkIjoiNjM4ODRkNTczYTYzNTE5NWFjODc1ZjU1In0sImlhdCI6MTY3MDQwMTM4MiwiZXhwIjoxNjcwNTc0MTgyfQ.i29DgYU8HzM0n204E4eh6yvtU4YCg5U1BErgotAntvpNxfzDmookvWLsuPsfBdWnvijDkwXU3JZj8RR-zINxbA",
  *               "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkIjoiNjM5MDRkNTkzYWRiYmQwMjExN2RjMjBiIiwibmFtZSI6IkVtaWx5IEhhd2siLCJlbWFpbCI6ImRldkBibHVldGVlc2dvbGYuY29tIiwicGhvbmUiOiI4ODc3NjY1NSIsInJvbGUiOnsiX2lkIjoiNjM4ODRkNTczYTYzNTE5NWFjODc1ZjU1Iiwicm9sZURpc3BsYXlOYW1lIjoiQWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJyb2xlZ3JvdXAiOiJiYWNrZW5kIiwiZGVzYyI6IjxwPkFkbWluaXN0cmF0aW9uIE1hbmFnZXI8L3A-IiwiaXNEZWxldGVkIjpmYWxzZSwic3RhdHVzIjoiQWN0aXZlIiwiY3JlYXRlZEF0IjoiMjAyMi0xMC0xM1QwNzowMDowMS45MjlaIiwidXBkYXRlZEF0IjoiMjAyMi0xMC0xM1QwNzowMDowMS45MjlaIiwiaWQiOiI2Mzg4NGQ1NzNhNjM1MTk1YWM4NzVmNTUifX0sImlhdCI6MTY3MDQwMTM4MiwiZXhwIjoxNjcyOTkzMzgyfQ.74lO5OPz6BboOL-SoW-6HOjGqRbwSyo9sVxJdqjK93A"
  *           }
  */
// login process route
namedRouter.post("admin.login", '/login',request_param.any(), userController.signin);


/**
  * @swagger
  *    /refreshToken:
    *      post:
    *        summary: Refresh token generate
    *        tags:
    *          - Auth
    *        security:
    *          - Token: []
    *        produces:
    *          - application/json
    *        parameters:
    *            - name: body
    *              in: body
    *              description: The refresh token
    *              required: true
    *              schema:
    *                type: object
    *                required:
    *                    - refreshToken
    *                properties:
    *                    refreshToken:
    *                        type: string
    *        responses:
    *          200:
    *            description: a new jwt token with a new expiry date is issued
    *            examples:
    *              application/json:
    *               {
    *                         "type": "success",
    *                         "message": "a new token is issued ",
    *                         "data": {
    *                             "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWZmMzBhYzMwMjY0MjRkYTczMjY5NmFhIiwibmFtZSI6IlN1cGVyIEFkbWluIiwiZW1haWwiOiJzdXBlcmFkbWluQGFkbWluLmNvbSIsInBob25lIjoiMTIzNDU2NyIsInJvbGUiOnsiX2lkIjoiNWZmMzBhYjEwMjY0MjRkYTczMjY5NDQ3Iiwicm9sZURpc3BsYXlOYW1lIjoiU3VwZXIgQWRtaW4iLCJyb2xlZ3JvdXAiOiJiYWNrZW5kIiwicm9sZSI6InN1cGVyX2FkbWluIiwiZGVzYyI6IlN1cGVyIEFkbWluaXN0cmF0b3Igb2YgdGhlIGFwcGxpY2F0aW9uLiIsImlkIjoiNWZmMzBhYjEwMjY0MjRkYTczMjY5NDQ3In0sImlhdCI6MTY0NzQxOTkwNiwiZXhwIjoxNjQ3NTA2MzA2fSwiaWF0IjoxNjQ3NDI4NDk5LCJleHAiOjE2NDc1MTQ4OTl9.cjn-hDBAbwFRyjmLYT7SZDg74kBM3pUFy_p-KFe2dUkngu5QGtqUJy6b_yXIGTSiABOXlhykSmDlWC6GQrmkDg"
    *                         }
    *                }
  */
namedRouter.post("admin.refreshtoken", '/refreshToken',request_param.any(), userController.refreshToken);

// Export the express.Router() instance
namedRouter.all('/*', auth.authenticateAPI);
/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Super Admin profile details
 *     tags:
 *       - Basic
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: return the user profile
 *         
 */
namedRouter.get("admin.profile", '/profile',userController.getProfile);

/**
  * @swagger
  * /change/password:
  *   post:
  *     summary: Super Admin change password
  *     tags:
  *       - Basic
  *     security:
 *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *      - name: body
  *        in: body
  *        description: Admin password change
  *        required: true
  *        schema:
  *             type: object
  *             required:
  *                 - old_password
  *                 - password
  *             properties:
  *                 old_password:
  *                     type: string
  *                 password:
  *                     type: string
  *     responses:
  *       200:
  *         description: Your password has been changed successfully
  *    
  */
namedRouter.post("admin.changepassword", '/change/password',request_param.any(), userController.changePassword);

/** 
  * @swagger
  * /update/profile:
  *   put:
  *     summary: Super Admin profile update
  *     tags:
  *       - Basic
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
  *     responses:
  *         200:
  *            description: Your profile has updated successfully
  *    
  */
namedRouter.put("admin.updateprofile", '/update/profile',uploadFile.any(), userController.updateProfile);

module.exports = router;