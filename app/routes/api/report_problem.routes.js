const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const problemController = require('webservice/blue_tees/report_problem.controller');
const request_param = multer();



/**
 * @swagger
 * /problem/parent/list:
 *   get:
 *     summary: Problem Master List
 *     tags:
 *       - Report a Problem
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: Problem details
 *         
 */
 namedRouter.get("api.problem.parent.list", '/problem/parent/list', request_param.any(),  problemController.Parentlist);

/**
 * @swagger
 * /problem/child/list/{parent_problemId}:
 *   get:
 *     summary: Child Problem List
 *     tags:
 *       - Report a Problem
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: parent_problemId
 *         description: Parent Problem ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Problem details
 *         
 */
 namedRouter.get("api.problem.child.list", '/problem/child/list/:id', request_param.any(),  problemController.Childlist);

 /**
 * @swagger
 * /problem/list:
 *   get:
 *     summary: All Problem List
 *     tags:
 *       - Report a Problem
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: All Problem details
 *         
 */
  namedRouter.get("api.problem.list", '/problem/list', request_param.any(),  problemController.list);

 namedRouter.all('/problem*', auth.authenticateAPI);


 /**
 * @swagger
 * /problem/report/{checkProblemId}:
 *   post:
 *     summary: Create Problem by User
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: checkProblemId
 *           description: Checking for Gorgias and Igolf Problem ID
 *           in: path
 *           required: true
 *         - name: body
 *           in: body
 *           description: Problem Report Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - problemId
 *                 - problem
 *             properties:
 *                 problemId:
 *                     type: string
 *                 problem:
 *                     type: string           
 *     responses:
 *        200:
 *          description: Problem Report created successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
  namedRouter.post("api.problem.report", '/problem/report/:id', request_param.any(),  problemController.createReport);


  /**
 * @swagger
 * /problem/level:
 *   get:
 *     summary: Problem Level Master
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: Problems Fetched Successfully.
 *         
 */
 namedRouter.get("api.problem.level", '/problem/level', request_param.any(), problemController.problemByLevel);



module.exports = router;