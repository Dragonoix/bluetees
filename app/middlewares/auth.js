const passport = require("passport");
const passportJWT = require("passport-jwt");
const users = require('user/models/user.model');
const config = require('../config/index');
const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const params = {
    secretOrKey: config.auth.jwtSecret,
    jwtFromRequest: ExtractJwt.fromHeader('token')
};


const RequestHandler = require('../helper/RequestHandler');
const Logger = require('../helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

module.exports = () => {
    
    const strategy = new Strategy(params, (payload, done) => {
       users.findById(payload.id).populate({
            'path': 'role',
            'select': 'role title'
        }).exec((err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
               
                done(null, user);
            } else {
                done(null, false);
            }
        });
    });
    passport.use(strategy);
    return {
        initialize: () => {
            return passport.initialize();
        },
         // This is for webservice jwt token check //
         authenticateAPI: (req, res, next) => {
            // check for nonsecure path like login //
             passport.authenticate("jwt", config.auth.jwtSession, (err, user) => {
                 if (err) {
                    requestHandler.throwError(400, 'bad request', 'Please provide a vaid token ,your token might be expired')({token_expire:true,auth: false});
                    //  res.send({
                    //      status: 500,
                    //      auth: false,
                    //      message: 'Please provide a vaid token ,your token might be expired'
                    //  });
                    //return requestHandler.sendError(req, res, {status:401,auth: false,message:'Sorry user not found!'});
                 }
                 if (!user) {
                    return requestHandler.sendError(req, res, {status:401,token_expire:true,auth: false,message:'Sorry user not found!'});
                   
                } else {
                    if (user.isDeleted != true && user.isActive != false) {
                        req.user = user;
                    } else {
                        return requestHandler.sendError(req, res, {status:401, token_invalid:true,auth: false,message:'Sorry user has been deleted!'});
                    }
                    
                }
                // req.user = user;
                // console.log(">>>>>>>>>>>>>>>>>>>>>",req.user,"<<<<<<<<<<<<<<<<<<<<<<<<");

                return next();
                
             })(req, res, next);
         }
    };
};