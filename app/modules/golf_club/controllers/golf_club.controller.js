const golfClubRepo = require('golf_club/repositories/golf_club.repository');
const mongoose = require('mongoose');
const _ = require('underscore');
const slug = require('slug');
const config = require(appRoot + '/config/index')
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
// aws bucket //
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();


class GolfClubBrandController {
    constructor() { }

    /*
    // @Method: list
    // @Description: Golf club list
    */
    async list(req, res) {
        try {
            let result = await golfClubRepo.getAllByField({ isDeleted: false });
            if (_.isEmpty(result)) {
                requestHandler.throwError(400, 'bad request', 'Sorry golf club name is not found!')();
            } else {
                requestHandler.sendSuccess(res, 'Golf club list fetched Successfully')(result);
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: create
    // @Description: Golf club create
    */
    async create(req, res) {
        try {
            const resultExist = await golfClubRepo.getByField({ 'title': { '$regex': req.body.title, '$options': 'i' }, isDeleted: false });
            if (_.isEmpty(resultExist)) {
                // For Image Upload//
                let uploadDcumentName = '';
                let uploadDocumentArr = [];
                if (req.files && req.files.length > 0) {
                    uploadDocumentArr = req.files[0].key.split("/");
                    uploadDcumentName = uploadDocumentArr[1];
                    req.body.short_image = uploadDcumentName;
                }
                let allClubCount = await golfClubRepo.getAllCount({});
                req.body.short_number = allClubCount + 1;
                let result = await golfClubRepo.save(req.body);
                requestHandler.sendSuccess(res, 'Golf club added successfully')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Golf club already exists with same name')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: details
    // @Description: Golf club details
    */
    async details(req, res) {
        try {
            const clubBrandId = req.params.id;
            const result = await golfClubRepo.getById(clubBrandId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Golf Club Full detail')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Golf club not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: Get All List
    // @Description: To get all the Club List from DB
    */
    async getAllClub(req, res) {
        try {
            let clubData = await golfClubRepo.getAllClubs(req);
            let data = {
                "recordsTotal": clubData.total,
                "recordsLimit": clubData.limit,
                "pages": clubData.pages,
                "page": clubData.page,
                "data": clubData.docs
            };
            return requestHandler.sendSuccess(res, 'Golf Club List Fetched')(data);
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: update
    // @Description: Golf club edit
    */
    async update(req, res) {
        try {
            const clubBrandId = req.params.id;
            const resultExist = await golfClubRepo.getByField({ title: req.body.title, _id: { $ne: clubBrandId }, isDeleted: false });
            if (_.isEmpty(resultExist)) {
                const findData = await golfClubRepo.getById(clubBrandId);
                if (!_.isEmpty(findData)) {

                    const userdata = await golfClubRepo.getById(clubBrandId);
                    // For image update//
                    let uploadDcumentName = '';
                    let uploadDocumentArr = [];
                    if (req.files && req.files.length > 0) {
                        await s3.deleteObject({ Bucket: config.aws.bucket, Key: "bluetees-app/" + userdata.short_image }).promise();
                        uploadDocumentArr = req.files[0].key.split("/");
                        uploadDcumentName = uploadDocumentArr[1];
                        req.body.short_image = uploadDcumentName;
                    }
                    const result = await golfClubRepo.updateById(req.body, clubBrandId);
                    requestHandler.sendSuccess(res, 'Golf club updated successfully')(result);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry Golf club not found')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'Golf club already exists with same name')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: statusChange
    // @Description: Golf Club Status Change Active/Inactive
    */
    async statusChange(req, res) {
        try {
            const clubId = req.params.id;
            const result = await golfClubRepo.getById(clubId)
            if (!_.isEmpty(result)) {
                let clubStatus = (result.status === "Active") ? "Inactive" : "Active";
                let clubUpdate = await golfClubRepo.updateById({ status: clubStatus }, result._id)
                requestHandler.sendSuccess(res, 'Golf Club status has changed successfully')(clubUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Golf Club Level not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /* @Method: delete
    // @Description: Golf club Delete
    */
    async delete(req, res) {
        try {
            const clubBrandId = req.params.id;
            const result = await golfClubRepo.getById(clubBrandId)
            if (!_.isEmpty(result)) {
                let resultDelete = await golfClubRepo.updateById({ isDeleted: true }, result._id)
                requestHandler.sendSuccess(res, 'Golf club deleted successfully')(resultDelete);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Golf club not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


}

module.exports = new GolfClubBrandController();