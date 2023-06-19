const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const imageController = require('screen_image/controllers/image.controller');
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

namedRouter.all('/screen-image*', auth.authenticateAPI);


// /**
//  * @swagger
//  * /screen-image/list:
//  *   get:
//  *     summary: Login Screen Images List
//  *     tags:
//  *       - Screen_Image
//  *     security:
//  *       - Token: []
//  *     produces:
//  *       - application/json
//  *     responses:
//  *        200:
//  *          description: Images details
//  *         
//  */
//  namedRouter.get("admin.screen.image.list", '/screen-image/list', request_param.any(),  imageController.list);

//  /**
//  * @swagger
//  * /skill-details/{skillId}:
//  *   get:
//  *     summary: Skill Details
//  *     tags:
//  *       - Skill
//  *     security:
//  *       - Token: []
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - name: skillId
//  *         description: Skill ID
//  *         in: path
//  *         required: true
//  *     responses:
//  *        200:
//  *          description: Skill details
//  *         
//  */
// namedRouter.get("admin.skill.details", '/skill-details/:id', imageController.details);


/**
 * @swagger
 * /screen-image/create:
 *   post:
 *     summary: Create Image for Login Screen
 *     tags:
 *       - Screen_Image
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         description: The file to upload.        
 *     responses:
 *        200:
 *          description: Images are Added successfully!
 *        403:
 *          description: Images are already exists!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.screen.image.create", '/screen-image/create', uploadFile.any(),  imageController.create);


  /**
  * @swagger
  * /screen-image-update/{imageId}:
  *   put:
  *     summary: Image Update
  *     tags:
  *       - Screen_Image
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: imageId
  *         description: Image ID
  *         in: path
  *         required: true
  *       - in: formData
  *         name: image
  *         type: file
  *         description: The file to upload.
  *       - in: formData
  *         name: status
  *         type: string
  *         description: Choose Active or Inactive.
  *         enum: [ 'Active', 'Inactive']
  *          
  *     responses:
  *        200:
  *          description: Images Updated successfully!
  *        400:
  *          description: Bad Request
  *        500:
  *          description: Server Error
  */
  namedRouter.put("admin.image.update", '/screen-image-update/:id', uploadFile.any(),  imageController.update);

   /**
  * @swagger
  * /screen-image-delete/{imageId}:
  *   delete:
  *     summary: Image Delete
  *     tags:
  *       - Screen_Image
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: imageId
  *         description: Image ID
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: Images deleted successfully
  */
namedRouter.delete("admin.screen.image.delete", '/screen-image-delete/:id',request_param.any(), imageController.delete);



/**
 * @swagger
 * /screen-image/getall:
 *   post:
 *     summary: Get All Screen Images
 *     tags:
 *       - Screen_Image
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Get All Screen Images
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - columns
 *                 - page
 *             properties:
 *                 columns:
 *                     type: array
 *                     example: [{"data": "status", "search": {"value":"Active"}}]
 *                 page: 
 *                     type: number
 *                     example: 1          
 *     responses:
 *        200:
 *          description: All screen images fetched successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */


 namedRouter.post("admin.screen.image.getall", '/screen-image/getall', request_param.any(),  imageController.list);



   /**
  * @swagger
  * /screen-image/status-change/{imageId}:
  *   put:
  *     summary: Skill Status Change
  *     tags:
  *       - Screen_Image
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: imageId
  *         description: Screen Image ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: Screen Image status has been changed successfully
  *         
  */
    namedRouter.put("admin.screen-image.statuschange", '/screen-image/status-change/:id', imageController.statusChange);



module.exports = router;