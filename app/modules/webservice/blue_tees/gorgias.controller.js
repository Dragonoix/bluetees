const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const axios = require('axios');
const { identity } = require('underscore');
const sdk = require('api')('@gorgias-developers/v1.0#5mc13lee50cvi');
sdk.auth('dev@blueteesgolf.com', 'e1150fb98e1c853e85e566f3430e2d3f12222ef28b3f1ce5edad2f45001e01d7');


class GorgiasController {
    /**
     * @Method welcomeMessage
     * @Description To See The Welcome Message
    */

    async welcomeMessage(req, res) {
        try {
            return requestHandler.sendSuccess(res)("Welcome To Gorgias!!!");
        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    /**
     * @Method Create Customer
     * @Description Create A Customer In Gorgias
    */
    async createCustomer(req) {
        try {

            sdk.server('https://blueteesgolf.gorgias.com/api/customers');

            let email = req.user.email.trim().toLowerCase();
            let name = req.user.first_name.trim() + " " + req.user.last_name.trim();
            let response = sdk.postApiCustomers({
                timezone: 'GMT',
                email,
                language: 'en',
                name
            })
            return response;
        } catch (err) {
            // return requestHandler.sendError(req, res, err);
            return err;
        }
    }

    async updateCustomer(id ,data) {
        try {

            sdk.server('https://blueteesgolf.gorgias.com/api/customers/'+id);

            let email = data.email.trim().toLowerCase();
            let name = data.first_name.trim() + " " + data.last_name.trim();
            let response = sdk.putApiCustomers({
                timezone: 'GMT',
                email,
                language: 'en',
                name
            })
            return response;
        } catch (err) {
            // return requestHandler.sendError(req, res, err);
            return err;
        }
    }

    async deleteCustomer(id) {
        try {

            sdk.server('https://blueteesgolf.gorgias.com/api/customers');

            let response = sdk.deleteApiCustomers({ids: [id]})
            return response;
        } catch (err) {
            // return requestHandler.sendError(req, res, err);
            return err;
        }
    }

    /**
     * @Method Create Ticket
     * @Description Create A Ticket In Gorgias
    */
    async createTicket(data) {
        try {

            sdk.server('https://blueteesgolf.gorgias.com/api/tickets');

            let response = await sdk.postApiTickets(data)
            // console.log(response.data);

            return response;
        } catch (err) {
            console.log(err.data.error.data.messages);
            // return requestHandler.sendError(req, res, err);
            return err;
        }
    }

    /**
    * @Method Ticket List
    * @Description Show All List Of Tickets From Gorgias
   */
    async listTicket() {
        try {
            sdk.server('https://blueteesgolf.gorgias.com/api/tickets');
            let limit = 100
            let getApiTickets = await sdk.getApiTickets({
                limit: limit,
                order_by: 'created_datetime%3Adesc',
            })
            let datas = getApiTickets.data.data;
            // Get closed Ticket Data //
            var closed = datas.filter(function (el) {
                return el.status == 'closed'
            });
            // Get opened Ticket Data //
            var opened = datas.filter(function (el) {
                return el.status == 'open'
            });

            // Get resolution time ticket Data //
            let latest_closed_dt = new Date(Math.max(...datas.map(e => new Date(e.closed_datetime))));
            let last_msg_dt = new Date(Math.max(...datas.map(e => new Date(e.last_message_datetime))));
            let time_difference = Math.abs(last_msg_dt - latest_closed_dt)

            let time_difference_sl = (convertMsToHM(time_difference)).split(':');
            let difference = time_difference_sl[0] + "h " + time_difference_sl[1] + "m";

            // Get first response time ticket Data //
            let latest_created_dt = new Date(Math.max(...datas.map(e => new Date(e.created_datetime))));
            let latest_update_dt = new Date(Math.max(...datas.map(e => new Date(e.updated_datetime))));
            let latest_time_difference = Math.abs(latest_update_dt - latest_created_dt)

            let time_difference_dt = (convertMToS(latest_time_difference)).split(':');
            let difference_response = time_difference_dt[0] + "m " + time_difference_dt[1] + "s";

            // Get Unassigned Ticket Data //
             var unassigned_ticket = datas.filter(function (el) {
                return el.assignee_user == null
            }).length;

            let percentage_open_ticket = parseInt(opened.length * limit / 100);
            let percentage_close_ticket = parseInt(closed.length * limit / 100);

            // Return all the ticket related Datas //
            return { opened_tickets: opened.length, closed_tickets: closed.length, tickets_created: datas.length, first_response_time: difference_response, unassigned_tickets: unassigned_ticket, resolution_time: difference, percentage_open_ticket, percentage_close_ticket };
        } catch (err) {
            return err;
        }
    }

    /**
    * @Method Find by User
    * @Description Show User for Gorgias exists
   */
    async userExistsForGorgias(email) {
        try {
            sdk.server('https://blueteesgolf.gorgias.com/api/customers');

            let getUser = await sdk.getApiCustomers({
                email: email,
                limit: '30',
                order_by: 'created_datetime%3Adesc',
            })

            return getUser.data.data;
        } catch (err) {
            return err;
        }
    }



}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function convertMsToHM(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = seconds >= 30 ? minutes + 1 : minutes;

    minutes = minutes % 60;

    hours = hours % 24;

    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
}

function padTo3Digits(num) {
    return num.toString().padStart(2, '0');
}

function convertMToS(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = seconds >= 30 ? minutes + 1 : minutes;

    minutes = minutes % 60;

    hours = hours % 24;

    return `${padTo3Digits(minutes)}:${padTo3Digits(seconds)}`;
}



module.exports = new GorgiasController();