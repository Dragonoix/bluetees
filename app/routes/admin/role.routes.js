const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const roleController = require('role/controllers/role.controller');
const request_param = multer();

namedRouter.all('/role*', auth.authenticateAPI);
/**
  * @swagger
  * /role/list:
  *   post:
  *     summary: Role List
  *     tags:
  *       - Role
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: body
  *           in: body
  *           description: the search keyword
  *           required: true
  *           schema:
  *             type: object
  *             required:
  *                 - searchString
  *                 - status
  *                 - page_no
  *             properties:
  *                 searchString:
  *                     type: string
  *                 status:
  *                     type: string
  *                     enum: ["Active","Inactive"]
  *                 page_no:
  *                     type: number
  *     responses:
  *       200:
  *         description: Role list has been fetched Successfully
  */
namedRouter.post("admin.role.list", '/role/list',request_param.any(), roleController.list);

/**
  * @swagger
  * /role/create:
  *   post:
  *     summary: Role Create
  *     tags:
  *       - Role
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: body
  *           in: body
  *           description: Role add data
  *           required: true
  *           schema:
  *             type: object
  *             required:
  *                 - roleDisplayName
  *                 - desc
  *             properties:
  *                 roleDisplayName:
  *                     type: string
  *                 desc:
  *                     type: string
  *     responses:
  *       200:
  *         description: Role added successfully
  */
 namedRouter.post("admin.role.create", '/role/create',request_param.any(), roleController.create);

 /**
  * @swagger
  * /role/status-change/{roleId}:
  *   post:
  *     summary: Role Status Change
  *     tags:
  *       - Role
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: roleId
  *         description: Role ID
  *         in: path
  *         required: true
  *     responses:
  *       200:
  *         description: Role status has been changes successfully
  */
 namedRouter.post("admin.role.status", '/role/status-change/:id',roleController.statusChange);

 /**
  * @swagger
  * /role/get-all-backend-role:
  *   get:
  *     summary: Get All Backend Role
  *     tags:
  *       - Role
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: Role data has been fetched successfully
  */
 namedRouter.get("admin.role.getBackendRole", '/role/get-all-backend-role',roleController.getAllBackendRole);

// /**
//  * @swagger
//  * /role/{roleId}:
//  *   get:
//  *     summary: Role Details
//  *     tags:
//  *       - Role
//  *     security:
//  *       - Token: []
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - name: roleId
//  *         description: Role ID
//  *         in: path
//  *         required: true
//  *     responses:
//  *        200:
//  *          description: Role details
//  *         
//  */
 namedRouter.get("admin.role.details", '/role/:id',roleController.details);


 /**
  * @swagger
  * /role/{roleId}:
  *   put:
  *     summary: Role Update
  *     tags:
  *       - Role
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: roleId
  *           description: Role ID
  *           in: path
  *           required: true
  *         - name: body
  *           in: body
  *           description: Role edit data
  *           required: true
  *           schema:
  *             type: object
  *             required:
  *                 - roleDisplayName
  *                 - desc
  *             properties:
  *                 roleDisplayName:
  *                     type: string
  *                 desc:
  *                     type: string
  *     responses:
  *       200:
  *         description: Role updated successfully
  */
  namedRouter.put("admin.role.update", '/role/:id',request_param.any(), roleController.update);

  // /**
  // * @swagger
  // * /role/update-all:
  // *   post:
  // *     summary: Role Multiple Update
  // *     tags:
  // *       - Role
  // *     security:
  // *       - Token: []
  // *     produces:
  // *       - application/json
  // *     parameters:
  // *         - name: body
  // *           in: body
  // *           description: Roles multiple edit
  // *           required: true
  // *           schema:
  // *             type: object
  // *             required:
  // *                 - roles
  // *             properties:
  // *                 roles:
  // *                     type: array
  // *                     items:
  // *                         type: string
  // *                     example: [{"roleDisplayName":"Sub Admin","desc":"Sub Admin Role","role_id":"62555e4f96696ffb8793f467"},{"roleDisplayName":"Customer","desc":"Customer Role","role_id":"6233138c26bac8bb0292cdbc"}]
  // *     
  // *     responses:
  // *       200:
  // *         description: All roles updated successfully
  // */
   namedRouter.post("admin.role.multipleUpdate", '/role/update-all', request_param.any(), roleController.multipleUpdate);

  /**
 * @swagger
 * /role/delete/{roleId}:
 *   delete:
 *     summary: Role Delete
 *     tags:
 *       - Role
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: roleId
 *         description: Role ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Role delete
 *         
 */
namedRouter.delete("admin.role.delete", '/role/delete/:id',roleController.delete);

module.exports = router;