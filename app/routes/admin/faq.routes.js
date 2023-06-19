const express = require('express');
const routeLabel = require('route-label');
const config = require(appRoot + '/config/index')
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const faqController = require('faq/controllers/faq.controller');
const fs = require('fs');
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();
const multerS3 = require('multer-s3');


/* const Storage = multer.diskStorage({
  destination: (req, file, callback) => {
      if (!fs.existsSync("./public/uploads/faq")) {
          fs.mkdirSync("./public/uploads/faq");
      }
      if (!fs.existsSync("./public/uploads/faq")) {
          fs.mkdirSync("./public/uploads/faq");
      }
      callback(null, "./public/uploads/faq");

  },
  filename: (req, file, callback) => {
      callback(null, Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
  }
}); */

/* const uploadFile = multer({
  storage: Storage
}); */

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

namedRouter.all('/faq*', auth.authenticateAPI);


/**
 * @swagger
 * /faq/list:
 *   get:
 *     summary: FAQ List
 *     tags:
 *       - FAQ
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json  
 *     responses:
 *        200:
 *          description: FAQ details
 *         
 */
 namedRouter.get("admin.faq.list", '/faq/list', request_param.any(),  faqController.list);

 /**
 * @swagger
 * /faq-details/{faqId}:
 *   get:
 *     summary: FAQ Details
 *     tags:
 *       - FAQ
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: faqId
 *         description: FAQ ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: FAQ details
 *         
 */
namedRouter.get("admin.faq.details", '/faq-details/:id', faqController.details);


/**
 * @swagger
 * /faq/create:
 *   post:
 *     summary: Create FAQ 
 *     tags:
 *       - FAQ
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - in: formdata
 *           name: image
 *           type: file
 *         - name: body
 *           in: body
 *           description: FAQ Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - question
 *                 - answer
 *                 - videoLink
 *                 - translate
 *             properties:
 *                 question:
 *                     type: string 
 *                 answer:
 *                     type: string 
 *                 videoLink:
 *                     type: string
 *                 translate:
 *                      type: array
 *                      example: [{"shortcode" : "jaUS", "question" : "What is Blue Tees App?", "answer" : "Blue Tess is a Golf game APP for players." } ]        
 *     responses:
 *        200:
 *          description: FAQ Added successfully!
 *        403:
 *          description: FAQ is already exists!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.faq.create", '/faq/create', uploadFile.any(),  faqController.create);


  /**
  * @swagger
  * /faq-update/{faqId}:
  *   put:
  *     summary: FAQ Update
  *     tags:
  *       - FAQ
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - in: formdata
  *           name: image
  *           type: file
  *         - name: faqId
  *           description: FAQ ID
  *           in: path
  *           required: true
  *         - name: body
  *           in: body
  *           description: FAQ Update API
  *           schema:
  *             type: object
  *             required:
  *                 - question
  *                 - answer
  *                 - videoLink
  *                 - translate
  *                 - status
  *             properties:
  *                 question:
  *                     type: string
  *                 answer:
  *                     type: string
  *                 videoLink:
  *                     type: string
  *                 translate:
  *                      type: array
  *                      example: [{"shortcode" : "jaUS", "question" : "What is Blue Tees App?", "answer" : "Blue Tess is a Golf game APP for players." } ]
  *                 status:
  *                     type: string 
  *                     items:
  *                         type: string
  *                     example: Active/Inactive         
  *     responses:
  *        200:
  *          description: FAQ Updated successfully!
  *        403:
  *          description: FAQ is already exists for ID's!
  *        400:
  *          description: Bad Request
  *        500:
  *          description: Server Error
  */
  namedRouter.put("admin.faq.update", '/faq-update/:id', uploadFile.any(),  faqController.update);

   /**
  * @swagger
  * /faq/status-change/{faqId}:
  *   put:
  *     summary: Faq Status Change
  *     tags:
  *       - FAQ
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: faqId
  *         description: FAQ ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: Faq status has changed successfully
  *         
  */
    namedRouter.put("admin.faq.statuschange", '/faq/status-change/:id', faqController.statusChange);

   /**
  * @swagger
  * /faq-delete/{faqId}:
  *   delete:
  *     summary: FAQ Delete
  *     tags:
  *       - FAQ
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: faqId
  *         description: FAQ ID
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: FAQ deleted successfully
  */
namedRouter.delete("admin.faq.delete", '/faq-delete/:id',request_param.any(), faqController.delete);

/**
 * @swagger
 * /faq/getall:
 *   post:
 *     summary: FAQ Get All
 *     tags:
 *       - FAQ
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: FAQ Create
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
 *                     example: {"value":"what is Golf?"}
 *                 columns:
 *                     type: array
 *                     example: [{"data": "status", "search": {"value":"Active"}}] 
 *                 page: 
 *                     type: number
 *                     example: 1           
 *     responses:
 *        200:
 *          description: FAQ Fetched successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
namedRouter.post("admin.faq.getall", '/faq/getall', request_param.any(), faqController.getAllFaq);






module.exports = router;