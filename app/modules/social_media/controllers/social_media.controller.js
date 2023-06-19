const mongoose = require('mongoose');
const mediaRepo = require('social_media/repositories/social_media.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class MediaController {
    constructor() {}

    /*
    // @Method: list
    // @Description: Social Media list
    */
    async list(req, res) {
		try {
			const result = await mediaRepo.getAllByField({ isDeleted: false })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Social Media details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Social Media details is not present')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


    /* @Method: Social Media All List
    // @Description: To get all the Social Media List from DB
    */
    async getAllMedia(req, res) {
        try {
            let media = await mediaRepo.getAllMedias(req);
            let data = {
                "recordsTotal": media.total,
                "recordsLimit": media.limit,
                "pages": media.pages,
                "page": media.page,
                "data": media.docs
            };   
            return requestHandler.sendSuccess(res, 'Social Media List Fetched')(data);
        }catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: create
    // @Description: Social Media create
    */
    async create(req, res) {
        try {
            req.body.social_media = req.body.social_media.trim();
            let result = await mediaRepo.save(req.body);
            if(result) {
                requestHandler.sendSuccess(res, 'Social Media added successfully')(result);
            }else {
                requestHandler.throwError(400, 'bad request', 'Something Went Wrong')();
            }
    
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: details
    // @Description: Social Media details
    */
    async details(req, res) {
		try {
			const mediaId = req.params.id;
			const result = await mediaRepo.getById(mediaId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Social Media Full Details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Social Media not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


    /* @Method: update
    // @Description: Social Media edit and update
    */
    async update(req, res) {
        try {
            const mediaId = req.params.id;
            const social_media_exist = await mediaRepo.getByField({ social_media: req.body.social_media, _id: { $ne: mediaId } });
            if (_.isEmpty(social_media_exist)) {
                const findMedia = await mediaRepo.getById(mediaId);
                if (!_.isEmpty(findMedia)) {
                    const result = await mediaRepo.updateById(req.body, mediaId);
                    requestHandler.sendSuccess(res, 'Socail Media Tag is updated successfully')(result);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry Socail Media is not found')();
                }    
            } else {
                requestHandler.throwError(400, 'bad request', 'Socail Media Tag already exists with same name')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: statusChange
    // @Description: Social MediaStatus Change Active/Inactive
    */
    async statusChange(req, res) {
        try {
            const mediaId = req.params.id;
            const result = await mediaRepo.getById(mediaId)
            if (!_.isEmpty(result)) {
                let mediaStatus = (result.status === "Active" ) ? "Inactive" : "Active";
                let mediaUpdate = await mediaRepo.updateById({status: mediaStatus}, result._id)
                requestHandler.sendSuccess(res, 'Social Media status has changed successfully')(mediaUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Social Media not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /* @Method: delete
    // @Description: Social Media Tag delete
    */
    async delete(req, res) {
        try {
                const mediaId = mongoose.Types.ObjectId(req.params.id);
                const mediaDetails = await mediaRepo.getById(mediaId);
                if (!_.isEmpty(mediaDetails)) {
                    const updateMedia = await mediaRepo.updateById({ isDeleted: true }, mediaId);
                    if (updateMedia && updateMedia._id) {
                        requestHandler.sendSuccess(res, 'Social Media tag is deleted successfully')({ deleted: true });
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


}

module.exports = new MediaController();