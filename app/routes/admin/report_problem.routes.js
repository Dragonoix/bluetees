const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const problemController = require('report_problem/controllers/report_problem.controller');
const request_param = multer();

namedRouter.all('/problem*', auth.authenticateAPI);


/**
 * @swagger
 * /problem/parent/list:
 *   post:
 *     summary: Problem Master List
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Parent Problem Create
 *         required: true
 *         schema:
 *             type: object
 *             required:
 *                 - page
 *             properties:
 *                 page: 
 *                     type: number
 *                     example: 1 
 *     responses:
 *        200:
 *          description: Problem details
 *         
 */
 namedRouter.post("admin.problem.parent.list", '/problem/parent/list', request_param.any(),  problemController.Parentlist);

/**
 * @swagger
 * /problem/child/list/{parent_problemId}:
 *   post:
 *     summary: Child Problem List
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: parent_problemId
 *         description: Parent Problem ID
 *         in: path
 *         required: true
 *       - name: body
 *         in: body
 *         description: Child Problem Create
 *         required: true
 *         schema:
 *             type: object
 *             required:
 *                 - page
 *             properties:
 *                 page: 
 *                     type: number
 *                     example: 1  
 *     responses:
 *        200:
 *          description: Child Problem List
 *         
 */
 namedRouter.post("admin.problem.child.list", '/problem/child/list/:id', request_param.any(),  problemController.Childlist);

  /**
 * @swagger
 * /problem/parent-details/{parentId}:
 *   get:
 *     summary: Parent Problem Details
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: parentId
 *         description: Parent Problem ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Parent Problem details
 *         
 */
namedRouter.get("admin.problem.parent.details", '/problem/parent-details/:id', problemController.parentDetails);

  /**
 * @swagger
 * /problem/child-details/{childId}:
 *   get:
 *     summary: Child Problem Details
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: childId
 *         description: Child Problem ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Child Problem details
 *         
 */
   namedRouter.get("admin.problem.child.details", '/problem/child-details/:id', problemController.childDetails);



 /**
 * @swagger
 * /problem/report/list:
 *   get:
 *     summary: Problem Report List
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: Problem details
 *         
 */
  namedRouter.get("admin.problem.report.list", '/problem/report/list', request_param.any(),  problemController.Reportlist);

    /**
 * @swagger
 * /problem/user-problem-report-details/{reportProblemId}:
 *   get:
 *     summary: User Problem Report Details
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: reportProblemId
 *         description: User Problem Report ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: User Problem Report details
 *         
 */
     namedRouter.get("admin.problem.user.report.details", '/problem/user-problem-report-details/:id', problemController.userReportDetails);


 /**
 * @swagger
 * /problem-master/create:
 *   post:
 *     summary: Create Problem by Category
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Problem Master Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - parent_problemId
 *                 - problem_name
 *                 - translate
 *             properties:
 *                 parent_problemId:
 *                     type: string
 *                 problem_name:
 *                     type: string
 *                 translate:
 *                     type: array
 *                     example:  [{"shortcode":"jaUS","problem_name":"Ja - Map / Geography Correction"},{"shortcode":"koUS","problem_name":"Ko - Map / Geography Correction"},{"shortcode":"deUS","problem_name":"De - Map / Geography Correction"},{"shortcode":"svUS","problem_name":"Sv - Map / Geography Correction"},{"shortcode":"frUS","problem_name":"Fr - Map / Geography Correction"},{"shortcode":"esES","problem_name":"Es - Map / Geography Correction"},{"shortcode":"itUS","problem_name":"It - Map / Geography Correction"},{"shortcode":"ptUS","problem_name":"Pt - Map / Geography Correction"},{"shortcode":"zhHansUS","problem_name":"ChMa - Map / Geography Correction"},{"shortcode":"zhHantHK","problem_name":"ChCa - Map / Geography Correction"},{"shortcode":"frCA","problem_name":"Fr - Map / Geography Correction"}]
 *     responses:
 *        200:
 *          description: Problem Master Added successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
  namedRouter.post("admin.problem.create", '/problem-master/create', request_param.any(),  problemController.create);



 /**
 * @swagger
 * /problem-master/update/{problemId}:
 *   put:
 *     summary: Update Child Problem
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: problemId
 *           description: Problem ID
 *           in: path
 *           required: true
 *         - name: body
 *           in: body
 *           description: Child Problem Master Update
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - parent_problemId
 *                 - problem_name
 *                 - translate
 *             properties:
 *                 parent_problemId:
 *                     type: string
 *                 problem_name:
 *                     type: string
 *                 translate:
 *                     type: array
 *                     example:  [{"shortcode":"jaUS","problem_name":"Ja - Map / Geography Correction"},{"shortcode":"koUS","problem_name":"Ko - Map / Geography Correction"},{"shortcode":"deUS","problem_name":"De - Map / Geography Correction"},{"shortcode":"svUS","problem_name":"Sv - Map / Geography Correction"},{"shortcode":"frUS","problem_name":"Fr - Map / Geography Correction"},{"shortcode":"esES","problem_name":"Es - Map / Geography Correction"},{"shortcode":"itUS","problem_name":"It - Map / Geography Correction"},{"shortcode":"ptUS","problem_name":"Pt - Map / Geography Correction"},{"shortcode":"zhHansUS","problem_name":"ChMa - Map / Geography Correction"},{"shortcode":"zhHantHK","problem_name":"ChCa - Map / Geography Correction"},{"shortcode":"frCA","problem_name":"Fr - Map / Geography Correction"}]           
 *     responses:
 *        200:
 *          description: Child Problem Master Updated successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
  namedRouter.put("admin.problem.update", '/problem-master/update/:id', request_param.any(),  problemController.update);

   /**
 * @swagger
 * /problem-master/parent/update/{problemParentId}:
 *   put:
 *     summary: Update Parent Problem
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: problemParentId
 *           description: Problem ID
 *           in: path
 *           required: true
 *         - name: body
 *           in: body
 *           description: Problem Master Update
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - problem_name
 *                 - translate
 *             properties:
 *                 problem_name:
 *                     type: string
 *                 translate:
 *                     type: array
 *                     example: [{"shortcode":"jaUS","problem_name":"Ja - App Problems"},{"shortcode":"koUS","problem_name":"Ko - App Problems"},{"shortcode":"deUS","problem_name":"De - App Problems"},{"shortcode":"svUS","problem_name":"Sv - App Problems"},{"shortcode":"frUS","problem_name":"Fr - App Problems"},{"shortcode":"esES","problem_name":"Es - App Problems"},{"shortcode":"itUS","problem_name":"It - App Problems"},{"shortcode":"ptUS","problem_name":"Pt - App Problems"},{"shortcode":"zhHansUS","problem_name":"ChMa - App Problems"},{"shortcode":"zhHantHK","problem_name":"ChCa - App Problems"},{"shortcode":"frCA","problem_name":"Fr - App Problems"}]           
 *     responses:
 *        200:
 *          description: Parent Problem Master Updated successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
    namedRouter.put("admin.problem.master.update", '/problem-master/parent/update/:id', request_param.any(),  problemController.updateParent);


     /**
  * @swagger
  * /problem/status-change/{problemId}:
  *   put:
  *     summary: Problem Status Change
  *     tags:
  *       - Report a Problem
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: problemId
  *         description: Problem ID
  *         in: path
  *         required: true
  *     responses:
  *        200:
  *          description: Report a Problem status has changed successfully
  *         
  */
      namedRouter.put("admin.problem.statuschange", '/problem/status-change/:id', problemController.statusChange);


     /**
  * @swagger
  * /problem-master-delete/{problemId}:
  *   delete:
  *     summary: Problem Master Delete
  *     tags:
  *       - Report a Problem
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: problemId
  *         description: Problem Master ID
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: Problem Master deleted successfully
  */
namedRouter.delete("admin.problem.delete", '/problem-master-delete/:id',request_param.any(), problemController.delete);


/**
 * @swagger
 * /problem/getall:
 *   post:
 *     summary: Report Problem Get All
 *     tags:
 *       - Report a Problem
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Report Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - columns
 *                 - page
 *             properties:
 *                 columns:
 *                     type: array
 *                     example: [{"data": "problem", "search": {"value":"App Problems"}},{"data": "status", "search": {"value":"Active"}},{"data": "date", "search": {"value":"2023-02-16"}} ]
 *                 page: 
 *                     type: number
 *                     example: 1          
 *     responses:
 *        200:
 *          description: Report Problem Fetched successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.problem.getall", '/problem/getall', request_param.any(), problemController.getAllProblem);

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
 namedRouter.get("admin.problem.level", '/problem/level', request_param.any(), problemController.problemByLevel);
 


module.exports = router;