const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const golfClubController = require('golf_club/controllers/golf_club.controller');
const config = require(appRoot + '/config/index')
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

namedRouter.all('/golf-club*', auth.authenticateAPI);


/**
  * @swagger
  * /golf-club/list:
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
namedRouter.get("admin.golfclub.list", '/golf-club/list',request_param.any(), golfClubController.list);

/**
 * @swagger
 * /golf-club/getall:
 *   post:
 *     summary: Golf Club Get All
 *     tags:
 *       - Golf Club
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Golf Club Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - columns
 *                 - page
 *             properties:
 *                 columns:
 *                     type: array
 *                     example: [{"data": "problem", "search": {"value":"App Problems"}},{"data": "status", "search": {"value":"Active"}},{"data": "date", "search": {"value":"2023-02-16"}} ]
 *                 page: 
 *                     type: number
 *                     example: 1          
 *     responses:
 *        200:
 *          description: Golf Club Fetched successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.golfclub.getall", '/golf-club/getall', request_param.any(), golfClubController.getAllClub);

/**
  * @swagger
  * /golf-club/create:
  *   post:
  *     summary: Golf Club Create
  *     tags:
  *       - Golf Club
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - in: formData
  *         name: short_image
  *         type: file
  *         description: The file to upload.
  *       - in: formData
  *         name: title
  *         type: string
  *         description: Golf Title.
  *       - in: formData
  *         name: short_title
  *         type: string
  *         description: Short form of Golf Title.    
  *     responses:
  *       200:
  *         description: Golf Club added successfully
  */
 namedRouter.post("admin.golfclub.create", '/golf-club/create', uploadFile.any(), golfClubController.create);
 

/**
 * @swagger
 * /golf-club/{golfClubBrandId}:
 *   get:
 *     summary: Golf Club Details
 *     tags:
 *       - Golf Club
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: golfClubId
 *         description: Golf Club ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Golf Club details
 *         
 */
 namedRouter.get("admin.golfclub.details", '/golf-club/:id',golfClubController.details);



 /**
  * @swagger
  * /golf-club/{golfClubId}:
  *   put:
  *     summary: Golf Club Update
  *     tags:
  *       - Golf Club
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: golfClubId
  *         description: Golf Club ID
  *         in: path
  *         required: true
  *       - in: formData
  *         name: short_image
  *         type: file
  *         description: The file to upload.
  *       - in: formData
  *         name: title
  *         type: string
  *         description: Golf Title.
  *       - in: formData
  *         name: short_title
  *         type: string
  *         description: Short form of Golf Title.
  *       - in: formData
  *         name: isSelected
  *         type: boolean
  *         description: Select value True / False.
  *     responses:
  *       200:
  *         description: Golf Club updated successfully
  */
  namedRouter.put("admin.golfclub.update", '/golf-club/:id',uploadFile.any(), golfClubController.update);

  /**
  * @swagger
  * /golf-club/status-change/{clubId}:
  *   put:
  *     summary: Golf Club Status Change
  *     tags:
  *       - Golf Club
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: clubId
  *         description: Club ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: Golf Club status has changed successfully
  *         
  */
   namedRouter.put("admin.golfclub.statuschange", '/golf-club/status-change/:id', golfClubController.statusChange);

 /**
 * @swagger
 * /golf-club/{golfClubId}:
 *   delete:
 *     summary: Golf Club Delete
 *     tags:
 *       - Golf Club
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: golfClubId
 *         description: Golf Club ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Golf Club delete
 *         
 */
namedRouter.delete("admin.golfclub.delete", '/golf-club/:id',golfClubController.delete);

module.exports = router;