const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const purchaseController = require('purchase/controllers/purchase.controller');
const request_param = multer();

namedRouter.all('/purchase*', auth.authenticateAPI);


/**
 * @swagger
 * /purchase/list:
 *   get:
 *     summary: Purchase List
 *     tags:
 *       - Purchase
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: Purchase details
 *         
 */
 namedRouter.get("admin.purchase.list", '/purchase/list', request_param.any(),  purchaseController.list);

 /**
 * @swagger
 * /purchase-details/{purchaseId}:
 *   get:
 *     summary: Purchase Details
 *     tags:
 *       - Purchase
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: purchaseId
 *         description: Purchase ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Purchase details
 *         
 */
namedRouter.get("admin.purchase.details", '/purchase-details/:id', purchaseController.details);


/**
 * @swagger
 * /purchase/create:
 *   post:
 *     summary: Create Oder Purchase from respective Locations
 *     tags:
 *       - Purchase
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Purchase Level Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - purchase_from
 *                 - location
 *             properties:
 *                 purchase_from:
 *                     type: string  
 *                 location:
 *                     type: string                  
 *     responses:
 *        200:
 *          description: Purchase Added successfully!
 *        403:
 *          description: Purchase Website is already exists!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.purchase.create", '/purchase/create', request_param.any(),  purchaseController.create);


 /**
 * @swagger
 * /purchase-update/{purchaseId}:
 *   put:
 *     summary: Purchase Update
 *     tags:
 *       - Purchase
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: purchaseId
 *           description: Purchase ID
 *           in: path
 *           required: true
 *         - name: body
 *           in: body
 *           description: Purchase Update API
 *           schema:
 *             type: object
 *             required:
 *                 - purchase_from
 *                 - location
 *             properties:
 *                 purchase_from:
 *                     type: string 
 *                 location: 
 *                     type: string 
 *                     items:
 *                         type: string
 *                     example: UK/US
 *          
 *     responses:
 *        200:
 *          description: Purchase Added successfully!
 *        403:
 *          description: Purchase website is already exists for a particular ID's!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
  namedRouter.put("admin.purchase.update", '/purchase-update/:id', request_param.any(),  purchaseController.update);

       /**
  * @swagger
  * /purchase/status-change/{purchaseId}:
  *   put:
  *     summary: Purchase Status Change
  *     tags:
  *       - Purchase
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: purchaseId
  *         description: Purchase ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: Purchase status has changed successfully
  *         
  */
        namedRouter.put("admin.purchase.statuschange", '/purchase/status-change/:id', purchaseController.statusChange);


    /**
  * @swagger
  * /purchasefrom-delete/{purchaseId}:
  *   delete:
  *     summary: Purchase Delete API
  *     tags:
  *       - Purchase
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
 *     parameters:
  *         - name: purchaseId
  *           description: Purchase from ID
  *           in: path
  *           required: true
  *     responses:
  *       200:
  *         description: Purchase deleted successfully
  */
namedRouter.delete("admin.purchase.delete", '/purchasefrom-delete/:id',request_param.any(), purchaseController.delete);

/**
 * @swagger
 * /purchase/getall:
 *   post:
 *     summary: Purchase Get All
 *     tags:
 *       - Purchase
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Purchase Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - columns
 *                 - page
 *             properties:
 *                 columns:
 *                     type: array
 *                     example: [{"data": "status", "search": {"value":"Active"}},{"data": "location", "search": {"value":"US"}}]
 *                 page: 
 *                     type: number
 *                     example: 1          
 *     responses:
 *        200:
 *          description: Purchase Fetched successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.purchase.getall", '/purchase/getall', request_param.any(), purchaseController.getAllPurchase);


module.exports = router;