const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const mediaController = require('webservice/blue_tees/social_media.controller');
const request_param = multer();


/**
 * @swagger
 * /social-media/list:
 *   get:
 *     summary: How did you hear about us Lists
 *     tags:
 *       - How did you hear about us
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: skill details
 *         
 */
 namedRouter.get("api.social.media.list", '/social-media/list', request_param.any(),  mediaController.list);

  /**
 * @swagger
 * /social-media-details/{mediaId}:
 *   get:
 *     summary: How did you hear about us full Details
 *     tags:
 *       - How did you hear about us
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: mediaId
 *         description: Social Media ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Social Media details
 *         
 */
namedRouter.get("api.social.media.details", '/social-media-details/:id', mediaController.details);




module.exports = router;