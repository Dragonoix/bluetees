const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const productController = require('product/controllers/product.controller');
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

namedRouter.all('/product*', auth.authenticateAPI);

/**
  * @swagger
  * /product/list:
  *   post:
  *     summary: Product List
  *     tags:
  *       - Product
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: body
  *         in: body
  *         description: Product Create
  *         required: true
  *         schema:
  *             type: object
  *             required:
  *                 - page
  *             properties:
  *                 page: 
  *                     type: number
  *                     example: 1   
  *     responses:
  *       200:
  *         description: Golf Ball Brand list fetched Successfully
  */
namedRouter.post("admin.product.list", '/product/list',request_param.any(), productController.getAllProduct);

/**
  * @swagger
  * /product/store:
  *   post:
  *     summary: Product Store
  *     tags:
  *       - Product
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: Product added successfully
  */
 namedRouter.post("admin.product.store", '/product/store', uploadFile.any(), productController.store);
 
 /**
  * @swagger
  * /product/{productId}:
  *   get:
  *     summary: Product Details
  *     tags:
  *       - Product
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: productId
  *         description: Product ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: Product details
  *         
  */
 namedRouter.get("admin.product.details", '/product/:id',productController.details);


//  /**
//   * @swagger
//   * /product-update/{productId}:
//   *   put:
//   *     summary: Product Update
//   *     tags:
//   *       - Product
//   *     security:
//   *       - Token: []
//   *     produces:
//   *       - application/json
//   *     parameters:
//   *         - name: productId
//   *           description: Product ID
//   *           in: path
//   *           required: true
//   *         - name: body
//   *           in: body
//   *           description: Product edit data
//   *           required: true
//   *           schema:
//   *             type: object
//   *             required:
//   *                 - monthly_subscription_amount
//   *                 - halfyearly_subscription_amount
//   *                 - yearly_subscription_amount
//   *             properties:
//   *                 monthly_subscription_amount:
//   *                     type: string
//   *                 halfyearly_subscription_amount:
//   *                     type: string
//   *                 yearly_subscription_amount:
//   *                     type: string
//   *     responses:
//   *       200:
//   *         description: Product subscription amount updated successfully
//   */
  namedRouter.put("admin.product.update", '/product-update/:id',uploadFile.any(), productController.update);
 
  /**
  * @swagger
  * /product/{productId}:
  *   delete:
  *     summary: Product Delete
  *     tags:
  *       - Product
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: productId
  *         description: Product ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: Product delete
  *         
  */
namedRouter.delete("admin.product.delete", '/product/:id',productController.delete);

module.exports = router;