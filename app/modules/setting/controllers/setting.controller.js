const settingRepo = require('setting/repositories/setting.repository');
const config = require(appRoot + '/config/index')
const _ = require('underscore');
const crypto = require("crypto");
const base64url = require("base64url");
const moment = require('moment');
const axios = require('axios');
const { default: mongoose } = require('mongoose');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class SettingController {

    /*
    // @Method: list
    // @Description: Setting list
    */
    async list(req, res) {

        try {
            let result = await settingRepo.getAll();

            if (_.isEmpty(result)) {
                requestHandler.throwError(400, 'bad request', 'Sorry data not found!')();
            } else {
                requestHandler.sendSuccess(res, 'Setting list fetched Successfully')(result);
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: details
    // @Description: Setting details
    */
    async details(req, res) {
		try {
			const settingId = req.params.id;
			const result = await settingRepo.getById(settingId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Setting details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry setting not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


    /* @Method: update
    // @Description: Setting update
    */
    async update(req, res) {
        try {
            const settingId = req.params.id;
            const setting_exist = await settingRepo.getByField({setting_name: req.body.setting_name, _id: { $ne: settingId } });
            if (_.isEmpty(setting_exist)) {
                const findCms = await settingRepo.getById(settingId);
                if (!_.isEmpty(findCms)) {
                    const result = await settingRepo.updateById(req.body, settingId);
                    requestHandler.sendSuccess(res, 'Setting updated successfully')(result);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry data not found')();
                }    
            } else {
                requestHandler.throwError(400, 'bad request', 'Setting already exists with same name')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: multipleUpdate
    // @Description: Setting Multiple Update
    */
    async multipleUpdate(req, res) {
        try {
            if (!_.has(req.body, 'settings') || !_.isArray(req.body.settings) || !req.body.settings.length) {
                requestHandler.throwError(400, 'bad request', 'Settings must be an array field!')();
            } else {
                let updatedSettings = [], unsuccessfulSettings = [];
                for (let doc of req.body.settings) {
                    let setting_exist = await settingRepo.getByField({setting_name: doc.setting_name, _id: { $ne: mongoose.Types.ObjectId(doc.setting_id) }, isDeleted: false });
                    if (setting_exist) {
                        doc.reason = "Already available";
                        unsuccessfulSettings.push(doc);
                    } else {
                        let result = await settingRepo.updateById({ setting_name: doc.setting_name, setting_value: doc.setting_value }, mongoose.Types.ObjectId(doc.setting_id));

                        if (result && result._id) {
                            updatedSettings.push(result);
                        } else {
                            doc.reason = "Something went wrong";
                            unsuccessfulSettings.push(doc);
                        }
                    }
                }

                if (unsuccessfulSettings.length && updatedSettings.length) {
                    requestHandler.throwError(400, 'bad request', 'Some of the settings were not updated!')(updatedSettings, { unsuccessfulSettings });
                } else if (updatedSettings.length) {
                    requestHandler.sendSuccess(res, 'All settings updated successfully')(updatedSettings);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Settings failed to update!')(unsuccessfulSettings);
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /*
    // @Method: courseList
    // @Description: Course list
    */
    async courseList(req, res) {
        try {
            
            //const currentTime = moment().format('YYMMDDHHmmss')+'+05:30' //For Local
            const currentTime = moment().format('YYMMDDHHmmss')+'+00:00' //For Live
            const key = 'cU6vi5sWrVng4wxOJmu18ZcclI2oHK'
            const message =  'CourseList/PRK9ptMjb9mHMsI/1.1/2.0/HmacSHA256/'+currentTime+'/JSON'

            var hash = crypto.createHmac('SHA256', Buffer.from(key, 'utf8'))
            .update(Buffer.from(message,'utf8'),'utf8')
            .digest();
            const finalUrl = 'https://api-connect.igolf.com/rest/action/CourseList/PRK9ptMjb9mHMsI/1.1/2.0/HmacSHA256/'+base64url(hash)+'/'+currentTime+'/JSON'
            let courseResult = await axios.post(
                finalUrl,{"active":"1","page":"1", "resultsPerPage":"99", "countryFormat":"4", "stateFormat":"4", "city":" Phoenix"},{
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!_.isEmpty(courseResult.data)) {
                requestHandler.sendSuccess(res, 'Course list fetched Successfully')(courseResult.data.courseList);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry data not found!')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

}

module.exports = new SettingController();