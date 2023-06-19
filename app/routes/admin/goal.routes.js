const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const goalController = require('goal/controllers/goal.controller');
const request_param = multer();

namedRouter.all('/goal*', auth.authenticateAPI);


/**
 * @swagger
 * /goal-master/list:
 *   get:
 *     summary: Goal master List
 *     tags:
 *       - Goal
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: goal details
 *         
 */
 namedRouter.get("admin.goal.level.list", '/goal-master/list', request_param.any(),  goalController.list);

 /**
 * @swagger
 * /goal-details/{goalId}:
 *   get:
 *     summary: Goal Details
 *     tags:
 *       - Goal
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: goalId
 *         description: Goal ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Goal details
 *         
 */
namedRouter.get("admin.goal.details", '/goal-details/:id', goalController.details);


/**
 * @swagger
 * /goal-master/create:
 *   post:
 *     summary: Create Goal Level
 *     tags:
 *       - Goal
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Goal Level Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - goal
 *             properties:
 *                 goal:
 *                     type: string           
 *     responses:
 *        200:
 *          description: Goal Level Added successfully!
 *        403:
 *          description: Goal Level is already exists!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.goal.level.create", '/goal-master/create', request_param.any(),  goalController.create);


  /**
  * @swagger
  * /goal-update/{goalId}:
  *   put:
  *     summary: Goal Master Update
  *     tags:
  *       - Goal
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: goalId
  *           description: Goal ID
  *           in: path
  *           required: true
  *         - name: body
  *           in: body
  *           description: Goal Update API
  *           schema:
  *             type: object
  *             required:
  *                 - goal
  *                 - status
  *             properties:
  *                 goal:
  *                     type: string
  *                 status:
  *                     type: string 
  *                     items:
  *                         type: string
  *                     example: Active/Inactive         
  *     responses:
  *        200:
  *          description: Goal Level Updated successfully!
  *        403:
  *          description: Goal Level is already exists for ID's!
  *        400:
  *          description: Bad Request
  *        500:
  *          description: Server Error
  */
  namedRouter.put("admin.goal.update", '/goal-update/:id', request_param.any(),  goalController.update);


   /**
  * @swagger
  * /goal/status-change/{goalId}:
  *   put:
  *     summary: Goal Status Change
  *     tags:
  *       - Goal
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: goalId
  *         description: Goal ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: Goal status has changed successfully
  *         
  */
    namedRouter.put("admin.goal.statuschange", '/goal/status-change/:id', goalController.statusChange);

   /**
  * @swagger
  * /goal-master-delete/{goalId}:
  *   delete:
  *     summary: Goal Master Delete
  *     tags:
  *       - Goal
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: goalId
  *         description: Goal Master ID
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: Goal Master deleted successfully
  */
namedRouter.delete("admin.goal.delete", '/goal-master-delete/:id',request_param.any(), goalController.delete);

/**
 * @swagger
 * /goal/getall:
 *   post:
 *     summary: Goal Get All
 *     tags:
 *       - Goal
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Goal Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - columns
 *                 - page
 *             properties:
 *                 columns:
 *                     type: array
 *                     example: [{"data": "status", "search": {"value":"Active"}},{"data": "goal", "search": {"value":"Weekend Warrior"}} ]
 *                 page: 
 *                     type: number
 *                     example: 1          
 *     responses:
 *        200:
 *          description: Goal Information Fetched successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.goal.getall", '/goal/getall', request_param.any(), goalController.getAllGoal);

module.exports = router;