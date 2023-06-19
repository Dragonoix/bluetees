const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const imageController = require('webservice/blue_tees/screen_image.controller');
const config = require(appRoot + '/config/index')
const multer = require('multer');
const request_param = multer();


/**
  * @swagger
  * /image/list:
  *   get:
  *     summary: Image List
  *     tags:
  *       - Screen_Image
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: Tutorial list fetched Successfully
  */
 namedRouter.get("api.bluetees.image.list", '/image/list',request_param.any(), imageController.list);


module.exports = router;