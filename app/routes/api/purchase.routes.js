const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const purchaseController = require('webservice/blue_tees/purchase.controller');
const request_param = multer();


/**
 * @swagger
 * /purchase/list/{location}:
 *   get:
 *     summary: Location List
 *     tags:
 *       - Purchase
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: location
 *         description: Location
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Location details
 *         
 */
 namedRouter.get("api.purchase.list", '/purchase/list/:location', request_param.any(),  purchaseController.list);

  /**
 * @swagger
 * /purchase-details/{purchaseId}:
 *   get:
 *     summary: Purchase Details
 *     tags:
 *       - Purchase
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
namedRouter.get("api.purchase.details", '/purchase-details/:id', purchaseController.details);




module.exports = router;