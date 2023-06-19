const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const gorgiasController = require('webservice/blue_tees/postscript.controller');




//webhook log
namedRouter.post("api.postscript.webhook", '/postscript/webhook', gorgiasController.subscribersWebhook);




module.exports = router;