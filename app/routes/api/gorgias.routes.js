const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const gorgiasController = require('webservice/blue_tees/gorgias.controller');

namedRouter.all('/gorgias*', auth.authenticateAPI);


//welcome message
namedRouter.get("api.gorgias.welcome", '/gorgias/welcome', gorgiasController.welcomeMessage);

//create customer
namedRouter.post("api.gorgias.create-customer", '/gorgias/create-customer', gorgiasController.createCustomer);

//list ticket
namedRouter.get("api.gorgias.list-ticket", '/gorgias/list-ticket', gorgiasController.listTicket);


module.exports = router;