const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const userGolfRoundController = require('webservice/blue_tees/user_golf_round.controller');
const config = require(appRoot + '/config/index')
const multer = require('multer');
const request_param = multer();

namedRouter.all('/user-golf-round*', auth.authenticateAPI);

/**
  * @swagger
  * /user-golf-round/create:
  *   post:
  *     summary: Round Create
  *     tags:
  *       -  User Golf Round
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: body
  *           in: body
  *           description: Round create data
  *           required: true
  *           schema:
  *             type: object
  *             required:
  *                 - courseId
  *                 - courseName
  *                 - courseCity
  *                 - courseState
  *                 - courseLatitude
  *                 - courseLongitude
  *                 - layoutTotalHoles
  *                 - roundType
  *                 - teeBox
  *                 - teeBoxOrder
  *                 - teeBoxLatitude
  *                 - teeBoxLongitude
  *                 - totalTime
  *                 - totalHoles
  *                 - roundData
  *             properties:
  *                 courseId:
  *                     type: string
  *                 courseName:
  *                     type: string
  *                 courseCity:
  *                     type: string
  *                 courseState:
  *                     type: string
  *                 courseLatitude:
  *                     type: string
  *                 courseLongitude:
  *                     type: string
  *                 layoutTotalHoles:
  *                     type: number
  *                 roundType:
  *                     type: string
  *                 teeBox:
  *                     type: string
  *                 teeBoxOrder:
  *                     type: number
  *                 teeBoxLatitude:
  *                     type: string
  *                 teeBoxLongitude:
  *                     type: string
  *                 totalTime:
  *                     type: string
  *                 totalHoles:
  *                     type: number
  *                 roundData:
  *                     type: array
  *                     items:
  *                         type: string
  *                     example: [{"hole":1, "par":4, "hcp":2, "tBoxDistance":500, },{"hole":2, "par":6, "hcp":4, "tBoxDistance":600}]
  *     responses:
  *       200:
  *         description: Round created successfully
  */
namedRouter.post("api.bluetees.user.golf.round.create", '/user-golf-round/create', request_param.any(), userGolfRoundController.create);

/**
* @swagger
* /user-golf-round/{roundId}:
*   delete:
*     summary: User Round Delete
*     tags:
*       - User Golf Round
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*       - name: roundId
*         description: Round ID
*         in: path
*         required: true
*     responses:
*        200:
*          description: Round deleted successfully
*         
*/
namedRouter.delete("api.bluetees.user.golf.round.delete", '/user-golf-round/:id', userGolfRoundController.delete);

//   /**
//  * @swagger
//  * /customer-golf-round/multiple-delete:
//  *   post:
//  *     summary: Customer Round Multiple Delete
//  *     tags:
//  *       - Customer Golf Round
//  *     security:
//  *       - Token: []
//  *     produces:
//  *       - application/json
//  *     parameters:
//   *         - name: body
//   *           in: body
//   *           description: Round delete data
//   *           required: true
//   *           schema:
//   *             type: object
//   *             required:
//   *                 - roundId
//   *             properties:
//   *                 roundId:
//   *                     type: array
//   *                     items:
//   *                         type: string
//   *                     example: ["1222222","8484848484","85858585858"]
//  *     responses:
//  *        200:
//  *          description: Round deleted successfully
//  *         
//  */
namedRouter.post("api.bluetees.customer.golf.round.multiple.delete", '/customer-golf-round/multiple-delete', userGolfRoundController.multipleDelete);


/**
  * @swagger
  * /user-golf-round/list:
  *   get:
  *     summary: User Golf Round List
  *     tags:
  *       - User Golf Round
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: Round history list fetched Successfully
  */
namedRouter.get("api.bluetees.user.golf.round.list", '/user-golf-round/list', userGolfRoundController.list);


/**
  * @swagger
  * /user-golf-round/summary:
  *   get:
  *     summary: User Golf Round Summary
  *     tags:
  *       - User Golf Round
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: Round Summary list fetched Successfully
  */
namedRouter.get("api.bluetees.user.golf.round.summary", '/user-golf-round/summary', userGolfRoundController.summary);

// /**
//   * @swagger
//   * /user-golf-round/topfive-list:
//   *   get:
//   *     summary: Customer Golf Round List
//   *     tags:
//   *       - Customer Golf Round
//   *     security:
//   *       - Token: []
//   *     produces:
//   *       - application/json
//   *     responses:
//   *       200:
//   *         description: Top five Round history list fetched Successfully
//   */
namedRouter.get("api.bluetees.customer.golf.round.topfive.list", '/customer-golf-round/topfive-list', userGolfRoundController.topFiveRounds);

/**
 * @swagger
 * /user-golf-round/{roundId}:
 *   get:
 *     summary: User Round Details
 *     tags:
 *       - User Golf Round
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: roundId
 *         description: Round ID
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: Round details
 *         
 */
namedRouter.get("api.bluetees.user.golf.round.details", '/user-golf-round/:id', userGolfRoundController.details);

/**
 * @swagger
 * /user-golf-round/score-update/{roundId}:
 *   put:
 *     summary: Round Score Update
 *     tags:
 *       -  User Golf Round
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: roundId
 *           description: Round ID
 *           in: path
 *           required: true
 *         - name: body
 *           in: body
 *           description: Round edit data
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - holeId
 *                 - putts
 *                 - strokes
 *                 - approach_position_long
 *                 - approach_position_right
 *                 - approach_position_short
 *                 - approach_position_left
 *                 - approach_position_green
 *                 - fairwayLeft
 *                 - fairwayRight
 *                 - fairwayCenter
 *                 - isPuttsGiven
 *                 - isFairwaysGiven
 *                 - isGirGiven
 *             properties:
 *                 holeId:
 *                     type: string
 *                 strokes:
 *                     type: number
 *                 putts:
 *                     type: number
 *                 approach_position_long:
 *                     type: number
 *                 approach_position_right:
 *                     type: number 
 *                 approach_position_short:
 *                     type: number 
 *                 approach_position_left:
 *                     type: number 
 *                 approach_position_green:
 *                     type: number 
 *                 fairwayLeft:
 *                     type: number
 *                 fairwayRight:
 *                     type: number
 *                 fairwayCenter:
 *                     type: number
 *                 isPuttsGiven: 
 *                     type: string
 *                     items:
 *                         type: string
 *                     example: true/false
 *                 isFairwaysGiven:
 *                     type: string 
 *                     items:
 *                         type: string
 *                     example: true/false 
 *                 isGirGiven:
 *                     type: string 
 *                     items:
 *                         type: string
 *                     example: true/false 
 *                 
 *     responses:
 *       200:
 *         description: Golf Ball Brand updated successfully
 */


namedRouter.put("api.bluetees.user.golf.round.score.update", '/user-golf-round/score-update/:id', request_param.any(), userGolfRoundController.updateHoleScore);

/**
* @swagger
* /user-golf-round/shot-create/{roundId}:
*   post:
*     summary: Create Shot And Update Per Hole
*     tags:
*       -  User Golf Round
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: roundId
*           description: Round ID
*           in: path
*           required: true
*         - name: body
*           in: body
*           description: Create shot and update under a specific hole
*           required: true
*           schema:
*             type: object
*             required:
*                 - holeId
*                 - clubId
*                 - lat
*                 - long
*                 - distance
*             properties:
*                 holeId:
*                     type: string
*                 clubId:
*                     type: string
*                 lat:
*                     type: string
*                 long:
*                     type: string
*                 distance:
*                     type: number
*                 
*     responses:
*       200:
*         description: Shot added successfully
*/
namedRouter.post("api.bluetees.user.golf.round.shot.create", '/user-golf-round/shot-create/:id', request_param.any(), userGolfRoundController.createAndUpdateShotPerHole);


/**
* @swagger
* /user-golf-round/round-complete/{roundId}:
*   post:
*     summary: User Round Complete
*     tags:
*       - User Golf Round
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*       - name: roundId
*         description: Round ID
*         in: path
*         required: true
*       - name: body
*         in: body
*         description: Round Complete
*         required: true
*         schema:
*             type: object
*             required:
*                 - finishScorecard
*                 - totalTime
*             properties: 
*                 finishScorecard:
*                     type: string 
*                     items:
*                         type: string
*                     example: true/false
*                 totalTime:
*                     type: number  
*     responses:
*        200:
*          description: Round complete
*         
*/
namedRouter.post("api.bluetees.user.golf.round.complete", '/user-golf-round/round-complete/:id', request_param.any(), userGolfRoundController.roundComplete);



/**
* @swagger
* /user-golf-round/round-complete-offline/{roundId}:
*   post:
*     summary: User Round Complete
*     tags:
*       - User Golf Round
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*       - name: roundId
*         description: Round ID
*         in: path
*         required: true
*       - name: body
*         in: body
*         description: Round Complete
*         required: true
*         schema:
*             type: object
*             required:
*                 - userId
*                 - courseId
*                 - courseName
*                 - courseCity
*                 - courseState
*                 - courseLatitude
*                 - courseLongitude
*                 - totalHoles
*                 - layoutTotalHoles
*                 - roundType
*                 - teeBox
*                 - teeBoxOrder
*                 - teeBoxLatitude
*                 - teeBoxLongitude
*                 - totalTime
*                 - totalStrokes
*                 - totalPutts
*                 - finishScorecard
*                 - roundData
*                 - holeTotalPar
*                 - holeTotalPutts
*                 - totalHoleCountFairway
*                 - totalPar
*                 - totalHcp
*                 - total_ace
*                 - total_albatross
*                 - total_eagle
*                 - total_birdie
*                 - total_par
*                 - total_bogey
*                 - total_double_bogey
*                 - total_triple_bogey
*                 - total_over
*                 - TotalScore
*                 - approach_position_long_percentage
*                 - approach_position_right_percentage
*                 - approach_position_short_percentage
*                 - approach_position_left_percentage
*                 - approach_position_green_percentage
*                 - total_fairwayLeft
*                 - total_fairwayRight
*                 - total_fairwayCenter
*                 - longest_drive
*                 - clubData
*             properties: 
*                 userId:
*                     type: string
*                 courseId:
*                     type: string
*                 courseName:
*                     type: string
*                 courseCity:
*                     type: string
*                 courseState:
*                     type: string
*                 courseLatitude:
*                     type: string
*                 courseLongitude:
*                     type: string
*                 totalHoles:
*                     type: number
*                 layoutTotalHoles:
*                     type: number
*                 roundType:
*                     type: string
*                 teeBox:
*                     type: string
*                 teeBoxOrder:
*                     type: number
*                 teeBoxLatitude:
*                     type: string
*                 teeBoxLongitude:
*                     type: string
*                 totalTime:
*                     type: number
*                 totalScore:
*                     type: number
*                 totalStrokes:
*                     type: number
*                 totalPutts:
*                     type: number
*                 finishScorecard:
*                     type: string 
*                     items:
*                         type: string
*                     example: true/false
*                 roundData:
*                      type: array
*                      example: [{"hole":1,"tBoxDistance":314,"par":4,"hcp":0,"strokes":0,"putts":0,"isPuttsGiven":false,"isGirHole":0,"fairwayLeft":0,"fairwayRight":0,"fairwayCenter":0,"approach_position_long":0,"approach_position_right":0,"approach_position_short":0,"approach_position_left":0,"approach_position_green":0,"user_ace":0,"user_albatross":0,"user_eagle":0,"user_birdie":0,"user_par":0,"user_bogey":0,"user_double_bogey":0,"user_triple_bogey":0,"user_over":0,"isFairwaysGiven":false,"isGirGiven":false,"isCompleted":false,"allShots":[{"clubId":"63a9366c86f1fac7332acedb","lat":"23","long":"32","distance":500},{"clubId":"63a9366c86f1fac7332acedb","lat":"23","long":"32","distance":500}],"createdAt":"2023-02-09T11:33:09.528Z","updatedAt":"2023-02-09T11:33:09.528Z"},]
*                 holeTotalPar:
*                     type: number
*                 holeTotalPutts:
*                     type: number
*                 totalHoleCountFairway:
*                     type: number
*                 totalPar:
*                     type: number
*                 totalHcp:
*                     type: number
*                 total_ace:
*                     type: number
*                 total_albatross:
*                     type: number
*                 total_eagle:
*                     type: number
*                 total_birdie:
*                     type: number
*                 total_par:
*                     type: number
*                 total_bogey:
*                     type: number
*                 total_double_bogey:
*                     type: number
*                 total_triple_bogey:
*                     type: number
*                 total_over:
*                     type: number
*                 TotalScore:
*                     type: number
*                 approach_position_long_percentage:
*                     type: number
*                 approach_position_right_percentage:
*                     type: number
*                 approach_position_short_percentage:
*                     type: number
*                 approach_position_left_percentage:
*                     type: number
*                 approach_position_green_percentage:
*                     type: number
*                 total_fairwayLeft:
*                     type: number
*                 total_fairwayRight:
*                     type: number
*                 total_fairwayCenter:
*                     type: number
*                 longest_drive:
*                     type: number
*                 clubData:
*                     type: array
*                     items:
*                         type: string
*                     example: [{"clubId":"63a9366c86f1fac7332acedb", "total_distance":500},{"clubId":"63a9366c86f1fac7332acedb", "total_distance":500}]    
*     responses:
*     200:
*          description: Round complete
*         
*/
namedRouter.post("api.bluetees.user.golf.round.complete.offline", '/user-golf-round/round-complete-offline/:id', request_param.any(), userGolfRoundController.roundCompleteOffline);


/**
* @swagger
* /user-golf-round/multiple-round:
*   post:
*     summary: User Round Complete
*     tags:
*       - User Golf Round
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*       - name: body
*         in: body
*         description: Round Complete
*         required: true
*         schema:
*             type: object
*             required:
*                 - data
*             properties: 
*                 data:
*                     type: array
*                     example: [{}, {}]
*     responses:
*     200:
*          description: Round complete
*         
*/
namedRouter.post("api.bluetees.user.golf.multiple.round", '/user-golf-round/multiple-round', request_param.any(), userGolfRoundController.multipleRoundCompleteOffline);


/**
* @swagger
* /user-golf-round/avg/list:
*   get:
*     summary: Average Distance List
*     tags:
*       - User Golf Round
*     security:
*       - Token: []
*     produces:
*       - application/json
*     responses:
*        200:
*          description: Average Distance List
*         
*/
namedRouter.get("api.bluetees.user.golf.round.avg.list", '/user-golf-round/avg/list', request_param.any(), userGolfRoundController.avglist);

/**
* @swagger
* /user-golf-round/distance/clear/{roundId}:
*   post:
*     summary: Distance Clear
*     tags:
*       - User Golf Round
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*       - name: roundId
*         description: Round ID
*         in: path
*         required: true
*       - name: body
*         in: body
*         description: Distance Clear
*         required: true
*         schema:
*             type: object
*             required:
*                 - holeId
*                 - shotId
*             properties: 
*                 holeId:
*                     type: string 
*                 shotId:
*                     type: string  
*                 
*     responses:
*        200:
*          description: Distance Clear
*         
*/
namedRouter.post("api.bluetees.user.golf.round.distance.clear", '/user-golf-round/distance/clear/:id', request_param.any(), userGolfRoundController.distanceClear);


namedRouter.post("api.bluetees.user.golf.appraoch.assist.distance", '/user-golf-round/appraoch-assist-distance', request_param.any(), userGolfRoundController.approachAssist);

module.exports = router;