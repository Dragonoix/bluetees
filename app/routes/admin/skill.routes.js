const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const skillController = require('skill/controllers/skill_level.controller');
const request_param = multer();

namedRouter.all('/skill*', auth.authenticateAPI);


/**
 * @swagger
 * /skill-master/list:
 *   get:
 *     summary: Skill master List
 *     tags:
 *       - Skill
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: skill details
 *         
 */
 namedRouter.get("admin.skill.level.list", '/skill-master/list', request_param.any(),  skillController.list);

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
namedRouter.get("admin.skill.details", '/skill-details/:id', skillController.details);


/**
 * @swagger
 * /skill-master/create:
 *   post:
 *     summary: Create Skill Level
 *     tags:
 *       - Skill
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Skill Level Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - skill_level
 *             properties:
 *                 skill_level:
 *                     type: string           
 *     responses:
 *        200:
 *          description: Skill Level Added successfully!
 *        403:
 *          description: Skill Level is already exists!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.skill.level.create", '/skill-master/create', request_param.any(),  skillController.create);


  /**
  * @swagger
  * /skill-update/{skillId}:
  *   put:
  *     summary: Skill Master Update
  *     tags:
  *       - Skill
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: skillId
  *           description: Skill ID
  *           in: path
  *           required: true
  *         - name: body
  *           in: body
  *           description: Skill Update API
  *           schema:
  *             type: object
  *             required:
  *                 - skill_level
  *                 - status
  *             properties:
  *                 skill_level:
  *                     type: string
  *                 status:
  *                     type: string 
  *                     items:
  *                         type: string
  *                     example: Active/Inactive         
  *     responses:
  *        200:
  *          description: Skill Level Updated successfully!
  *        403:
  *          description: Skill Level is already exists for ID's!
  *        400:
  *          description: Bad Request
  *        500:
  *          description: Server Error
  */
  namedRouter.put("admin.skill.update", '/skill-update/:id', request_param.any(),  skillController.update);


   /**
  * @swagger
  * /skill/status-change/{skillId}:
  *   put:
  *     summary: Skill Status Change
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
  *          description: Skill status has changed successfully
  *         
  */
    namedRouter.put("admin.skill.statuschange", '/skill/status-change/:id', skillController.statusChange);

   /**
  * @swagger
  * /skill-master-delete/{skillId}:
  *   delete:
  *     summary: Skill Master Delete
  *     tags:
  *       - Skill
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: skillId
  *         description: Skill Master ID
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: Skill Master deleted successfully
  */
namedRouter.delete("admin.skill.delete", '/skill-master-delete/:id',request_param.any(), skillController.delete);

/**
 * @swagger
 * /skill/getall:
 *   post:
 *     summary: Skill Get All
 *     tags:
 *       - Skill
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Skill Create
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - columns
 *                 - page
 *             properties:
 *                 columns:
 *                     type: array
 *                     example: [{"data": "status", "search": {"value":"Active"}},{"data": "skill_level", "search": {"value":"Weekend Warrior"}} ]
 *                 page: 
 *                     type: number
 *                     example: 1          
 *     responses:
 *        200:
 *          description: Skill Information Fetched successfully!
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
 namedRouter.post("admin.skill.getall", '/skill/getall', request_param.any(), skillController.getAllSkill);

module.exports = router;