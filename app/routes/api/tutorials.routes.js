const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const tutorialsController = require('webservice/blue_tees/tutorials.controller');
const config = require(appRoot + '/config/index')
const multer = require('multer');
const request_param = multer();


/**
  * @swagger
  * /tutorials/list/{productId}:
  *   get:
  *     summary: Tutorials List
  *     tags:
  *       - Tutorials
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: productId
  *         description: Product ID
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: Tutorial list fetched Successfully
  */
 namedRouter.get("api.bluetees.tutorials.list", '/tutorials/list/:productId',request_param.any(), tutorialsController.list);


 /**
  * @swagger
  * /tutorials/{tutorialId}:
  *   get:
  *     summary: Tutorial details
  *     tags:
  *       - Tutorials
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: tutorialId
  *         description: Tutorial ID
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: Tutorial details fetched Successfully
  */
namedRouter.get("api.bluetees.tutorials.details", '/tutorials/:id',request_param.any(), tutorialsController.details);


module.exports = router;