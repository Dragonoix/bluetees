const express = require('express');

const router = express.Router();

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const config = require(appRoot + '/config/index')
const { NONAME } = require('dns');

/* This is for Admin end swiagger API doc */
const optionsAdmin = {
	swaggerDefinition: {
		info: {
			title: 'Blue Tees',
			version: '1.0.0',
			description: 'Blue Tees Admin API Doc',
			contact: {
				email: '',
			},
		},
		tags: [
			{
				name: 'Basic',
				description: 'Admin Basic API',
			},
			{
				name: 'Auth',
				description: 'Authentication apis',
			},
			{
				name: 'Tutorials',
				description: 'Tutorials API',
			},
		],
		schemes: ['https', 'http'],
		// host: `bluetees.dedicateddevelopers.us`,
		// host: `bluetees-v2.dedicateddevelopers.us`,
		host: `127.0.0.1:1608`,
		basePath: '/admin',
		securityDefinitions: {
			Token: {
				type: 'apiKey',
				description: 'JWT authorization of an API',
				name: 'x-access-token',
				in: 'header',
			},
		},
	},

	apis: [path.join(__dirname, `../routes/admin/*.js`)],
};
const swaggerSpec = swaggerJSDoc(optionsAdmin);
require('swagger-model-validator')(swaggerSpec);

router.get('/admin-docs-json', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(swaggerSpec);
});
router.use('/admin-docs', swaggerUi.serveFiles(swaggerSpec), swaggerUi.setup(swaggerSpec));


/* This is for Blue Tees APP end swiagger API doc */
const optionsblueteesAPP = {
	swaggerDefinition: {
		info: {
			title: 'Blue Tees',
			version: '1.0.0',
			description: 'Blue Tees API Doc',
			contact: {
				email: '',
			},
		},
		tags: [
			{
				name: 'Basic',
				description: 'User Basic API',
			},
			{
				name: 'Tutorials',
				description: 'Tutorials API',
			},
		],
		schemes: ['https', 'http'],
		// host: `bluetees.dedicateddevelopers.us`,
		// host: `bluetees-v2.dedicateddevelopers.us`,
		host: `127.0.0.1:1608`,
		basePath: '/api',
		securityDefinitions: {
			Token: {
				type: 'apiKey',
				description: 'JWT authorization of an API',
				name: 'x-access-token',
				in: 'header',
			},
		},
	},
	apis: [path.join(__dirname, `../routes/api/*.js`)],
};
const swaggerblueteesAPPSpec = swaggerJSDoc(optionsblueteesAPP);
require('swagger-model-validator')(swaggerblueteesAPPSpec);
router.get('/bluetees-doc-json', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(swaggerblueteesAPPSpec);
});

router.use('/bluetees-doc', swaggerUi.serveFiles(swaggerblueteesAPPSpec), swaggerUi.setup(swaggerblueteesAPPSpec));



function validateModel(name, model) {
	const responseValidation = swaggerSpec.validateModel(name, model, false, true);
	if (!responseValidation.valid) {
		throw new Error('Model doesn\'t match Swagger contract');
	}
}

module.exports = {
	router,
	validateModel,
};
