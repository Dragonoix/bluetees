const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const settingController = require('setting/controllers/setting.controller');
const request_param = multer();

namedRouter.all('/setting*', auth.authenticateAPI);
/**
  * @swagger
  * /setting/list:
  *   get:
  *     summary: Setting List
  *     tags:
  *       - Setting
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json

  *     responses:
  *       200:
  *         description: Setting list fetched Successfully
  */
namedRouter.get("admin.setting.list", '/setting/list',request_param.any(), settingController.list);

// /**
//  * @swagger
//  * /setting/{settingId}:
//  *   get:
//  *     summary: Setting Details
//  *     tags:
//  *       - Setting
//  *     security:
//  *       - Token: []
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - name: settingId
//  *         description: Setting ID
//  *         in: path
//  *         required: true
//  *     responses:
//  *        200:
//  *          description: Setting details
//  *         
//  */
 namedRouter.get("admin.setting.details", '/setting/:id',settingController.details);

 /**
  * @swagger
  * /setting/update/{settingId}:
  *   post:
  *     summary: Setting Update
  *     tags:
  *       - Setting
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: settingId
  *           description: Setting Update
  *           in: path
  *           required: true
  *         - name: body
  *           in: body
  *           description: Setting edit data
  *           required: true
  *           schema:
  *             type: object
  *             required:
  *                 - setting_value
  *             properties:
  *                 setting_value:
  *                     type: string
  *     
  *     responses:
  *       200:
  *         description: Setting updated successfully
  */
  namedRouter.post("admin.setting.update", '/setting/update/:id',request_param.any(), settingController.update);


  // /**
  // * @swagger
  // * /setting/update-all:
  // *   post:
  // *     summary: Settings Multiple Update
  // *     tags:
  // *       - Setting
  // *     security:
  // *       - Token: []
  // *     produces:
  // *       - application/json
  // *     parameters:
  // *         - name: body
  // *           in: body
  // *           description: Settings multiple edit
  // *           required: true
  // *           schema:
  // *             type: object
  // *             required:
  // *                 - settings
  // *             properties:
  // *                 settings:
  // *                     type: array
  // *                     items:
  // *                         type: string
  // *                     example: [{"setting_name":"Site Email","setting_value":"admin@bluetees.com","setting_id":"5ff31670026424da7327f09b"},{"setting_name":"Site Title","setting_value":"Blue Tees","setting_id":"616fea4eb167b817e5bcbc65"}]
  // *     
  // *     responses:
  // *       200:
  // *         description: All settings updated successfully
  // */
   namedRouter.post("admin.setting.multipleUpdate", '/setting/update-all', request_param.any(), settingController.multipleUpdate);


  // /**
  // * @swagger
  // * /course/list:
  // *   post:
  // *     summary: Course List from igolf
  // *     tags:
  // *       - Setting
  // *     security:
  // *       - Token: []
  // *     produces:
  // *       - application/json
  // *     parameters:
  // *         - name: body
  // *           in: body
  // *           description: search by city
  // *           required: true
  // *           schema:
  // *             type: object
  // *             required:
  // *                 - city
  // *             properties:
  // *                 city:
  // *                     type: string
  // *     responses:
  // *       200:
  // *         description: Course list fetched Successfully
  // */
  namedRouter.post("admin.course.list", '/course/list',request_param.any(), settingController.courseList);

module.exports = router;