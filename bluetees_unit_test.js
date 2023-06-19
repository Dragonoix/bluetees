// core modules
const {join, resolve } = require('path');
const express = require('express');
require('app-module-path').addPath(__dirname + '/app/modules');
require('dotenv').config();
const fs = require('fs');
const app = express();
const namedRouter = require('route-label')(app);
global.auth = require(resolve(join(__dirname, 'app/middlewares', 'auth')))();
global.appRoot = join(__dirname, '/app');

//APP Route List //
const masteblueteesRoutes = require(resolve(join(__dirname, '/app/routes/api/blue_tees', '/master.routes')));
const customerblueteesRoutes = require(resolve(join(__dirname, '/app/routes/api/blue_tees', '/customer.routes')));
app.use("/api/bluetees", masteblueteesRoutes);



//Admin Route List //
const userRoutes = require(resolve(join(__dirname, '/app/routes/admin', '/user.routes')));
const adminUserRoutes = require(resolve(join(__dirname, '/app/routes/admin', '/admin_user.routes')));
const roleRoutes = require(resolve(join(__dirname, '/app/routes/admin', '/role.routes')));
const settingRoutes = require(resolve(join(__dirname, '/app/routes/admin', '/setting.routes')));
const golfBallBrandRoutes = require(resolve(join(__dirname, '/app/routes/admin', '/golf_ball_brand.routes')));
const golfClubBrandRoutes = require(resolve(join(__dirname, '/app/routes/admin', '/golf_club_brand.routes')));
const customerRoutes = require(resolve(join(__dirname, '/app/routes/admin', '/customer.routes')));
app.use("/admin", userRoutes,adminUserRoutes,roleRoutes,settingRoutes,golfBallBrandRoutes,golfClubBrandRoutes,customerRoutes);

module.exports = app;