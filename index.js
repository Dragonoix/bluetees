// custom modules will goes here
const { join, resolve } = require('path');
const http = require('http');
const config = require(resolve(join(__dirname, 'app/config', 'index')));
const getPort = config.app.port;
const app = require("./bluetees");
const server = http.createServer(app);
server.listen(getPort);

console.log(`Project is running on ${(global.BASE_URL && global.BASE_URL !== '') ? global.BASE_URL : `http://${process.env.HOST}:${getPort}`}`);