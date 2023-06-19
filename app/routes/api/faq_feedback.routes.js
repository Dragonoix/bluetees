const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const faqFeedbackController = require('webservice/blue_tees/faq_feedback.controller');
const request_param = multer();

namedRouter.all('/faq-feedback*', auth.authenticateAPI);




/**
* @swagger
* /faq-feedback/submit:
*   post:
*     summary: FAQ Feedback Submit
*     tags:
*       - FAQ Feedback
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: FAQ Feedback Submit
*           required: true
*           schema:
*             type: object
*             required:
*                 - faq_id
*                 - feedback_type
*             properties:
*                 faq_id:
*                     type: string    
*                 feedback_type:
*                     type: boolean     
*     responses:
*        200:
*          description: Feedback submitted successfully!
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/
namedRouter.post("api.faq-feedback.submit", '/faq-feedback/submit', request_param.any(), faqFeedbackController.submit);



module.exports = router;