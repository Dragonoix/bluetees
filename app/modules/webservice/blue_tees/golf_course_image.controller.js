const golfCourseImageRepo = require('golf_course_image/repositories/golf_course_image.repository');
const _ = require('underscore');
const { default: mongoose } = require('mongoose');
const config = require(appRoot +'/config/index');
const utils = require(appRoot +'/helper/utils');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
// aws bucket //
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();

class GolfCourseImage {
    constructor() {}

    /*
    // @Method: create
    // @Description: Golf Round Image Create
    */
    async create(req, res) {
		try {

            if (req.files && req.files.length > 0) {
                const imageData = await golfCourseImageRepo.getByField({
                    'courseId' : req.body.courseId,
                    'courseName' : req.body.courseName,
                });

                if(_.isNull(imageData)){
                    var uploadDocumentArr = req.files[0].key.split("/");
                    var uploadDcumentName = uploadDocumentArr[1];
                    req.body.image = uploadDcumentName;
                    const result = await golfCourseImageRepo.save(req.body);
                    return requestHandler.sendSuccess(res, 'Image saved successfully.')(result);
                } else {
                    return requestHandler.sendSuccess(res, 'record already present.')(imageData);
                }

            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry, Please try again.')();
            }  
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


    /*
    // @Method: details
    // @Description: Golf Course details
    */
    async getDetailsById(req, res) {
		try {
			const imageData = await golfCourseImageRepo.getByField({
                'courseId' : req.params.courseId
            });
            if (!_.isEmpty(imageData)) {
                return requestHandler.sendSuccess(res, 'Course Image details')(imageData);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry image not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

}

module.exports = new GolfCourseImage();