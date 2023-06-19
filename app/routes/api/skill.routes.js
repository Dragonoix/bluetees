const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const skillController = require('webservice/blue_tees/skill_level.controller');
const request_param = multer();

namedRouter.all('/skill*', auth.authenticateAPI);


/**
 * @swagger
 * /skill-master/list:
 *   get:
 *     summary: Skill Master List
 *     tags:
 *       - Skill
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
 *          description: skill details
 *         
 */
 namedRouter.get("api.skill.level.list", '/skill-master/list', request_param.any(),  skillController.list);

  /**
 * @swagger
 * /skill-details/{skillId}:
 *   get:
 *     summary: Skill Details
 *     tags:
 *       - Skill
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: skillId
 *         description: Skill ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Skill details
 *         
 */
namedRouter.get("api.skill.details", '/skill-details/:id', skillController.details);




module.exports = router;