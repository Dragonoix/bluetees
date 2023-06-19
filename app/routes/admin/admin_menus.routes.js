const express = require('express');
const routeLabel = require('route-label');
const config = require(appRoot + '/config/index')
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const adminMenusController = require('admin_menus/controllers/admin_menus.controller');
const fs = require('fs');
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();
const multerS3 = require('multer-s3');

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

namedRouter.all('/admin-menu*', auth.authenticateAPI);


/**
 * @swagger
 * /admin-menu/list:
 *   get:
 *     summary: Admin Menu List
 *     tags:
 *       - Permission
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json  
 *     responses:
 *        200:
 *          description: Admin Menu details
 *         
 */
 namedRouter.get("admin.admin.menu.list", '/admin-menu/list', request_param.any(),  adminMenusController.list);

 /**
 * @swagger
 * /admin-menu/details/{adminId}:
 *   get:
 *     summary: Admin Menu Details
 *     tags:
 *       - Permission
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: adminId
 *         description: Admin Menu ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Admin Menu details
 *         
 */
namedRouter.get("admin.admin.menu.details", '/admin-menu/details/:id', adminMenusController.details);


module.exports = router;