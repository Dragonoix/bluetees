const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const mediaController = require('social_media/controllers/social_media.controller');
const request_param = multer();

namedRouter.all('/social-media*', auth.authenticateAPI);


/**
 * @swagger
 * /social-media/list:
 *   get:
 *     summary: How did you hear about us Lists
 *     tags:
 *       - How did you hear about us 
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: Social Media Details
 *         
 */
 namedRouter.get("admin.social.media.list", '/social-media/list', request_param.any(),  mediaController.list);

 /**
 * @swagger
 * /social-media/getall:
 *   post:
 *     summary: Social Media Get All
 *     tags:
 *       - How did you hear about us 
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Social Media Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - columns
 *                 - page
 *             properties:
 *                 columns:
 *                     type: array
 *                     example: [{"data": "status", "search": {"value":"Active"}},{"data": "social_media", "search": {"value":"Google"}} ]
 *                 page: 
 *                     type: number
 *                     example: 1          
 *     responses:
 *        200:
 *          description: Social Media Information Fetched successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
  namedRouter.post("admin.social.media.getall", '/social-media/getall', request_param.any(), mediaController.getAllMedia);

 /**
 * @swagger
 * /social-media/{mediaId}:
 *   get:
 *     summary: How did you hear about us full Details
 *     tags:
 *       - How did you hear about us
 *     security:
 *       - Token: []
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
namedRouter.get("admin.social.media.details", '/social-media/:id', mediaController.details);


/**
 * @swagger
 * /social-media/create:
 *   post:
 *     summary: Create Social Media tags
 *     tags:
 *       - How did you hear about us 
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Social Media Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - social_media
 *             properties:
 *                 social_media:
 *                     type: string           
 *     responses:
 *        200:
 *          description: Social Media tag Added successfully!
 *        403:
 *          description: Social Media tag is already exists!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.social.media.create", '/social-media/create', request_param.any(),  mediaController.create);


  /**
  * @swagger
  * /social-media-update/{mediaId}:
  *   put:
  *     summary: Social Media Update
  *     tags:
  *       - How did you hear about us 
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: mediaId
  *           description: Social Media ID
  *           in: path
  *           required: true
  *         - name: body
  *           in: body
  *           description: Social Media API
  *           schema:
  *             type: object
  *             required:
  *                 - social_media
  *                 - status
  *             properties:
  *                 social_media:
  *                     type: string
  *                 status:
  *                     type: string 
  *                     items:
  *                         type: string
  *                     example: Active/Inactive         
  *     responses:
  *        200:
  *          description: Social Media tag is Updated successfully!
  *        403:
  *          description: Social Media tag  is already exists for ID's!
  *        400:
  *          description: Bad Request
  *        500:
  *          description: Server Error
  */
  namedRouter.put("admin.social.media.update", '/social-media-update/:id', request_param.any(),  mediaController.update);


    /**
  * @swagger
  * /social-media/status-change/{mediaId}:
  *   put:
  *     summary: Social Media Status Change
  *     tags:
  *       - How did you hear about us 
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: mediaId
  *         description: Social Media ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: Social Media status has changed successfully
  *         
  */
     namedRouter.put("admin.social.media.statuschange", '/social-media/status-change/:id', mediaController.statusChange);

   /**
  * @swagger
  * /social-media-delete/{mediaId}:
  *   delete:
  *     summary: Social Media tag Delete
  *     tags:
  *       - How did you hear about us
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: mediaId
  *         description: Social Media ID
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: Social Media tag is deleted successfully
  */
namedRouter.delete("admin.social.media.delete", '/social-media-delete/:id',request_param.any(), mediaController.delete);




module.exports = router;