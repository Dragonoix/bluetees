const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const faqController = require('webservice/blue_tees/faq.controller');
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
 namedRouter.get("api.faq.list", '/faq/list', request_param.any(),  faqController.list);

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
namedRouter.get("api.faq.details", '/faq-details/:id', faqController.details);





module.exports = router;