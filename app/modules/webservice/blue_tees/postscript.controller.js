const sendSubscribers = require(appRoot + '/helper/postscript');
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const userRepo = require('user/repositories/user.repository');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const errorLogRepo = require("error_log/repositories/error_log.repository");


class postscriptController {
    constructor() { }

    /* @Method: Send subscribers
    // @Description: Send subscribers to postscipt
    */
    async sendData(req, res) {
        try {
            let payload = {
                phone_number: req.body.phone_number,
                email: req.body.email,
                keyword_id: req.body.keyword_id,
                properties: {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name
                }
            }
            let sendSubscriber = await sendSubscribers.subscribers(payload);
            if (!_.isEmpty(sendSubscriber) && _.has(sendSubscriber, "id")) {
                requestHandler.sendSuccess(res, 'Data Sent to Postscript')(sendSubscriber);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry subscriber with this phone number already exits')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    async subscribersWebhook(req, res) {
        try {
            let resPhone = req.body.event_data.phone_number.substr(req.body.event_data.phone_number.length - 10);

            if (resPhone.length == 10) {
                let userData = await userRepo.getByField({ phone: resPhone });
                // console.log(userData);
                if (!_.isEmpty(userData)) {
                    await userRepo.updateById({ postscript_id: req.body.event_data.id }, userData._id);
                }
            }

            requestHandler.sendSuccess(res, 'Data Saved')({});

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

};


module.exports = new postscriptController();
