const mongoose = require('mongoose');
const imageRepo = require('screen_image/repositories/image.repository');
const config = require(appRoot + '/config/index');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const fs = require('fs');
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();


class ImageController {
    constructor() {}

    /*
    // @Method: list
    // @Description: Screen Image list
    */
    async list(req, res) {
		try {
			const result = await imageRepo.getAllScreenImages(req)
            let data = {
                "data": result.docs,
                "recordsTotal": result.total,
                "recordsLimit": result.limit,
                "pages": result.pages,
                "page": result.page
            };  
            if (!_.isEmpty(data)) {
                return requestHandler.sendSuccess(res, 'Screen Images details')(data);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Images are not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

    /* @Method: create
    // @Description: Image create
    */
    async create(req, res) {
        try {
            // For Image Upload//
            let uploadDcumentName = '';
            let uploadDocumentArr = [];
            if (req.files && req.files.length > 0) {
                uploadDocumentArr = req.files[0].key.split("/");
                uploadDcumentName = uploadDocumentArr[1];
                req.body.image = uploadDcumentName;
            }
            let result = await imageRepo.save(req.body);
            if(result) {
                requestHandler.sendSuccess(res, 'Images added successfully')(result);
            }else {
                requestHandler.throwError(400, 'bad request', 'Something Went Wrong')();
            }
    
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: details
    // @Description: Image details
    */
    // async details(req, res) {
	// 	try {
	// 		const skillId = req.params.id;
	// 		const result = await imageRepo.getById(skillId)
    //         if (!_.isEmpty(result)) {
    //             return requestHandler.sendSuccess(res, 'Skill details')(result);
    //         } else {
    //             requestHandler.throwError(400, 'bad request', 'Sorry skill not found')();
    //         }     
			
	// 	} catch (error) {
	// 		return requestHandler.sendError(req, res, error);
	// 	}
	// }


    /* @Method: update
    // @Description: Image edit and update
    */
    async update(req, res) {
        try {
            const imageId = req.params.id;
            const findImage = await imageRepo.getById(imageId);
            // For image update//
            let uploadDcumentName = '';
            let uploadDocumentArr = [];
            if (req.files && req.files.length > 0) {
                await s3.deleteObject({ Bucket: config.aws.bucket, Key: "bluetees-app/" + findImage.image }).promise();
                uploadDocumentArr = req.files[0].key.split("/");
                uploadDcumentName = uploadDocumentArr[1];
                req.body.image = uploadDcumentName;
            }
            if (!_.isEmpty(findImage)) {
                const result = await imageRepo.updateById(req.body, imageId);
                requestHandler.sendSuccess(res, 'Images updated successfully')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Images not found')();
            }    
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: delete
    // @Description: Images delete
    */
    async delete(req, res) {
        try {
                const imageId = mongoose.Types.ObjectId(req.params.id);
                const imageDetails = await imageRepo.getById(imageId);
                if (!_.isEmpty(imageDetails)) {
                    const updateImage = await imageRepo.updateById({ isDeleted: true }, imageId);
                    if (updateImage && updateImage._id) {
                        requestHandler.sendSuccess(res, 'Images deleted successfully')({ deleted: true });
                    } else {
                        requestHandler.throwError(400, 'bad request', 'Something went wrong!')();
                    }
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry data not found')();
                }    
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: statusChange
    // @Description: Screen Image Status Change Active/Inactive
    */
    async statusChange(req, res) {
        try {
            const imageId = req.params.id;
            const result = await imageRepo.getById(imageId)
            if (!_.isEmpty(result)) {
                let imageStatus = (result.status === "Active" ) ? "Inactive" : "Active";
                let imageUpdate = await imageRepo.updateById({status: imageStatus}, result._id)
                requestHandler.sendSuccess(res, 'Screen image status has been changed successfully')(imageUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Screen image not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


}

module.exports = new ImageController();