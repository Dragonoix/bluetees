const sgMail = require('@sendgrid/mail');
const config = require(appRoot + '/config/index')
sgMail.setApiKey(config.sendgrid.api_key);
const Email = require('email-templates');
const path = require('path');
const Logger = require('./logger');
const logger = new Logger();
const axios = require('axios');
var FormData = require('form-data');

class Mailer {
    constructor() {
    }

    async createTemplate(name, html) {
        try {
            let apikey = (process.env.SEND_GRID_API_KEY).split("SG.").pop();
            var data = new FormData();
            data.append('name', name);
            data.append('html', html);

            var config = {
                method: 'post',
                url: 'https://a.klaviyo.com/api/v1/email-templates?api_key=' + apikey,
                headers: {
                    ...data.getHeaders()
                },
                data: data
            };
            let res = await axios(config);
            if (res.status == 200) {
                return (res.data);
            } else {
                return false;
            }


        } catch (error) {
            console.error(error);
            return false;
        }
    };



    async sendMail(from_email, from_name, subject, to, templateid) {
        try {
            let apikey = (process.env.SEND_GRID_API_KEY).split("SG.").pop();
            var data = new FormData();
            data.append('from_email', from_email);
            data.append('from_name', from_name);
            data.append('subject', subject);
            data.append('to', to);

            var config = {
                method: 'post',
                url: "https://a.klaviyo.com/api/v1/email-template/" + templateid + "/send?api_key=" + apikey,
                headers: {
                    ...data.getHeaders()
                },
                data: data
            };
            let res = await axios(config);
            if (res.status == 200) {
                return (res.data);
            } else {
                return false;
            }


        } catch (error) {
            console.error(error);
            return false;
        }
    };
}
module.exports = new Mailer();