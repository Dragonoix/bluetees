const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const request_param = multer();
const permissionController = require('permission/controllers/permission.controller');

namedRouter.all('/permission*', auth.authenticateAPI);
/**
  * @swagger
  * /permission/list/{roleId}:
  *   get:
  *     summary: Permissions list by role
  *     tags:
  *       - Permission
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
  *          description: Permissions list by role
  */
 namedRouter.get("admin.permission.list.role", '/permission/list/:id',request_param.any(), permissionController.getListByRole);

/**
  * @swagger
  * /permission/update:
  *   post:
  *     summary: Permission Update
  *     tags:
  *       - Permission
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: body
  *           in: body
  *           description:  Permission Update API
  *           required: true
  *           schema:
  *             type: object
  *             required:
  *                 - role_id
  *                 - permission_id
  *             properties:
  *                 role_id:
  *                     type: string
  *                 permission_id:
  *                     type: array
  *                     items:
  *                         type: string
  *                     example: ["6409b9fa067c0afa33db57b2","640ac97671f50c27301c6e74"]
  *     responses:
  *       200:
  *         description: Permission Updated successfully
  */
 namedRouter.post("admin.permission.update", '/permission/update',request_param.any(), permissionController.updatePermission);

module.exports = router;