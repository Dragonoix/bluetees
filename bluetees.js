// core modules
const {join, resolve } = require('path');
const http = require('http');
// 3rd party modules
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// Import module in global scope
require('app-module-path').addPath(__dirname + '/app/modules');
require('mongoose-pagination');
require('dotenv').config();
_ = require("underscore");
// custom modules will goes here
global.appRoot = join(__dirname, '/app');
global.projectRoot = __dirname;
const config = require(resolve(join(__dirname, 'app/config', 'index')));
const utils = require(resolve(join(__dirname, 'app/helper', 'utils')));
global.auth = require(resolve(join(__dirname, 'app/middlewares', 'auth')))();


// For track log //
const Logger = require(resolve(join(__dirname, 'app/helper', 'logger')));
const logger = new Logger();

const app = express();
const namedRouter = require('route-label')(app);
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);


/*****************************************************/
/********* Functions + variable declaration *********/
/***************************************************/

const isProd = config.app.isProd;
const getPort = config.app.port;
const getApiFolderName = config.app.getApiFolderName;
const getAdminApiFolderName = config.app.getAdminApiFolderName;

/***************  Swagger API DOC ***************/
const swaggerAdmin = require(resolve(join(__dirname, 'app/helper', 'swagger')));
app.use('/', swaggerAdmin.router);
/************************************************/

/******************** Middleware registrations *******************/
app.use(cors());
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
})); // get information from html forms
app.use(bodyParser.json({
    limit: "50mb"
}));

app.use(express.static('./public'));

app.use((req, res, next) => {
    auth = require(resolve(join(__dirname, 'app/middlewares', "auth")))(req, res, next);
    app.use(auth.initialize());
    // This is for webservice end
    if (req.headers['x-access-token'] != null) {
        req.headers['token'] = req.headers['x-access-token'];
    }
    // add this line to include winston logging
    next();
});

// For Error log 
app.use(function(err, req, res, next) {
   logger.log(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,'error');
});


/**
 * Event listener for HTTP server "error" event.
 */
const onError = (error) => {
    const port = getPort;
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(0);
            break;
        default:
            throw error;
    }
}

(async () => {
    try {
        // Database connection//
        await require(resolve(join(__dirname, 'app/config', 'database')))();
        
        /******************* Routes Api ************/
        const apiFiles = await utils._readdir(`./app/routes/${getApiFolderName}`);
        apiFiles.forEach(file => {

            if (!file && file[0] == '.') return;
            namedRouter.use('', `/${getApiFolderName}`, require(join(__dirname, file)));
        });
        /******************* Blue Tees Routes Api ************/
        // const apiblueteesFiles = await utils._readdir(`./app/routes/${getApiFolderName}/bluetees`);
        // apiblueteesFiles.forEach(file => {

        //     if (!file && file[0] == '.') return;
        //     namedRouter.use('', `/${getApiFolderName}/bluetees`, require(join(__dirname, file)));
        // });
        /*********************** Routes Admin **********************/
        const adminApiFiles = await utils._readdir(`./app/routes/${getAdminApiFolderName}`);
        adminApiFiles.forEach(file => {
            if (!file && file[0] == '.') return;
            namedRouter.use('', `/${getAdminApiFolderName}`, require(join(__dirname, file)));
        });
        
        namedRouter.buildRouteTable();
        if (!isProd && process.env.SHOW_NAMED_ROUTES === 'true') {
            routeList = namedRouter.getRouteTable();
            console.log(routeList);
        }
        /******************* Service Launch *****************/
        const server = http.createServer(app);
        server.listen(getPort);
        server.on('error', onError);
        console.log(`Project is running on ${(global.BASE_URL && global.BASE_URL !== '') ? global.BASE_URL : `http://${process.env.HOST}:${getPort}`}`);
    } catch (error) {
        console.error(error);
    }
})();

module.exports = app;