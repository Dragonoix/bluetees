const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const goalController = require('webservice/blue_tees/goal.controller');
const request_param = multer();

namedRouter.all('/goal*', auth.authenticateAPI);


/**
 * @swagger
 * /goal-master/list:
 *   get:
 *     summary: Goal Master List
 *     tags:
 *       - Goal
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - in: query
 *           name: lang
 *           schema:
 *             type: string
 *     responses:
 *        200:
 *          description: goal details
 *         
 */
 namedRouter.get("api.goal.level.list", '/goal-master/list', request_param.any(),  goalController.list);

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
namedRouter.get("api.goal.details", '/goal-details/:id', goalController.details);




module.exports = router;