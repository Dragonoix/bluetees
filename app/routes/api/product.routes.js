const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const productController = require('webservice/blue_tees/product.controller');
const request_param = multer();

namedRouter.all('/product*', auth.authenticateAPI);


/**
 * @swagger
 * /product/list:
 *   get:
 *     summary: Product List
 *     tags:
 *       - Product
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: Product details
 *         
 */
 namedRouter.get("api.product.list", '/product/list', request_param.any(),  productController.list);




module.exports = router;