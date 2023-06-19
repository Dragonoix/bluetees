const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const tutorialsController = require('tutorials/controllers/tutorials.controller');
const config = require(appRoot + '/config/index')
const multer = require('multer');
const request_param = multer();

namedRouter.all('/tutorials*', auth.authenticateAPI);

/**
  * @swagger
  * /tutorials/create:
  *   post:
  *     summary: Tutorial Create
  *     tags:
  *       - Tutorials
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: body
  *           in: body
  *           description: Tutorial Create API
  *           required: true
  *           schema:
  *             type: object
  *             required:
  *                 - title
  *                 - productId
  *                 - youtubeVideoLink
  *                 - status
  *             properties:
  *                 title:
  *                     type: string
  *                 productId:
  *                     type: string
  *                 youtubeVideoLink: 
  *                     type: string
  *                 status:
  *                     type: string 
  *                     items:
  *                         type: string
  *                     example: Active/Inactive 
  *                 translate:
 *                      type: array
 *                      example: [{"shortcode" : "jaUS", "title" : "This is japanese youtube tutorial" } ]  
  *     responses:
  *       200:
  *         description: Tutorial created successfully
  */
 namedRouter.post("admin.tutorials.create", '/tutorials/create',request_param.any(), tutorialsController.create);


 
 
 /**
  * @swagger
  * /tutorials/list/{productId}:
  *   get:
  *     summary: Tutorials List
  *     security:
  *       - Token: []
  *     tags:
  *       - Tutorials
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: productId
  *         description: Product
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: Tutorial list fetched Successfully
  */
 namedRouter.get("admin.tutorials.list", '/tutorials/list/:productId',request_param.any(), tutorialsController.list);
 
 /**
  * @swagger
  * /tutorials-details/{tutorialId}:
  *   get:
  *     summary: Tutorial Details
  *     tags:
  *       - Tutorials
  *     security:
  *       - Token: []
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
namedRouter.get("admin.tutorials.details", '/tutorials-details/:id',request_param.any(), tutorialsController.details);



 /**
  * @swagger
  * /tutorials-update/{tutorialId}:
  *   put:
  *     summary: Tutorial Update
  *     tags:
  *       - Tutorials
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: tutorialId
  *           description: Tutorial ID
  *           in: path
  *           required: true
  *         - name: body
  *           in: body
  *           description: Tutorial Update API
  *           schema:
  *             type: object
  *             required:
  *                 - title
  *                 - productId
  *                 - youtubeVideoLink
  *                 - status
  *             properties:
  *                 title:
  *                     type: string
  *                 productId:
  *                     type: string
  *                 youtubeVideoLink: 
  *                     type: string
  *                 status:
  *                     type: string 
  *                     items:
  *                         type: string
  *                     example: Active/Inactive 
  *     responses:
  *       200:
  *         description: Tutorial updated successfully
  */
  namedRouter.put("admin.tutorials.update", '/tutorials-update/:id',request_param.any(), tutorialsController.update);


     /**
  * @swagger
  * /tutorials/status-change/{tutorialId}:
  *   put:
  *     summary: Tutorial Status Change
  *     tags:
  *       - Tutorials
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: tutorialId
  *         description: Tutorial ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: Tutorial status has changed successfully
  *         
  */
      namedRouter.put("admin.tutorials.statuschange", '/tutorials/status-change/:id', tutorialsController.statusChange);


  /**
  * @swagger
  * /tutorials-delete/{tutorialId}:
  *   delete:
  *     summary: Tutorial Delete
  *     tags:
  *       - Tutorials
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: tutorialId
  *         description: Tutorial ID
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: Tutorial deleted successfully
  */
namedRouter.delete("admin.tutorials.delete", '/tutorials-delete/:id',request_param.any(), tutorialsController.delete);

/**
 * @swagger
 * /tutorials/getall:
 *   post:
 *     summary: Tutorials Get All
 *     tags:
 *       - Tutorials
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Tutorials Create
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
 *                     example: {"value":"The Pro Golf Player"}
 *                 columns:
 *                     type: array
 *                     example: [{"data": "status", "search": {"value":"Active"}}] 
 *                 page: 
 *                     type: number
 *                     example: 1           
 *     responses:
 *        200:
 *          description: Tutorials Fetched successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.tutorials.getall", '/tutorials/getall', request_param.any(), tutorialsController.getAllTutorial);


module.exports = router;