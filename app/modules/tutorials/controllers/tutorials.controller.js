const tutorialsRepo = require('tutorials/repositories/tutorials.repository');
const productRepo = require('product/repositories/product.repository');
const _ = require('underscore');
const { default: mongoose } = require('mongoose');
const config = require(appRoot +'/config/index');
const utils = require(appRoot +'/helper/utils');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class TutorialsController {
    constructor () {}


    /*
    // @Method: list
    // @Description: Tutorial list
    */
    async list(req, res) {
		try {
			const result = await tutorialsRepo.getAllByField({ 
                isDeleted: false,
                productId: req.params.productId
            })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Tutorial list fetched.')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Tutorial not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


    /* @Method: details
    // @Description: Tutorial details
    */
    async details(req, res) {
		try {
			const tutorialId = req.params.id;
			const result = await tutorialsRepo.getById(tutorialId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Tutorial details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Tutorial not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

    /* @Method: Tutorial All List
    // @Description: To get all the Tutorial List from DB
    */
    async getAllTutorial(req, res) {
        try {
            let tutorial = await tutorialsRepo.getAllTutorials(req);
            let data = {
                "recordsTotal": tutorial.total,
                "recordsLimit": tutorial.limit,
                "pages": tutorial.pages,
                "page": tutorial.page,
                "data": tutorial.docs
            };   
            return requestHandler.sendSuccess(res, 'Tutorial List Fetched')(data);
        }catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: create
    // @Description: Tutorial create
    */
    async create(req, res) {
        try {
            if (!req.body.title) {
                requestHandler.throwError(400, 'bad request', 'Title is required')();
            } else if (!req.body.productId) {
                requestHandler.throwError(400, 'bad request', 'Product Id is required')();
            } else {
                req.body.title = req.body.title.trim();
                req.body.productId = mongoose.Types.ObjectId(req.body.productId);
                const tutorialExist = await tutorialsRepo.getByField({title: req.body.title, productId: req.body.productId, isDeleted: false });
                if (_.isEmpty(tutorialExist)) {
                    const productExist = await productRepo.getById(req.body.productId);
                    if (!productExist) {
                        requestHandler.throwError(400, 'bad request', 'No product found with your provided Id')();
                    } else {
                        const saveTutorial = await tutorialsRepo.save(req.body);
                        if (saveTutorial && saveTutorial._id) {
                            const result = await tutorialsRepo.allTutorialList({_id: saveTutorial._id});
                            requestHandler.sendSuccess(res, 'Tutorial created successfully')(result[0]);
                        } else {
                            requestHandler.throwError(400, 'bad request', 'Something went wrong!')();
                        }
                    }
                } else {
                    requestHandler.throwError(400, 'bad request', 'Tutorial already exists with same title')();
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: update
    // @Description: Tutorial update
    */
    async update(req, res) {
        try {
            if (!req.body.title) {
                requestHandler.throwError(400, 'bad request', 'Title is required')();
            } else 
            if (!req.body.productId) {
                requestHandler.throwError(400, 'bad request', 'Product Id is required')();
            } else {
                req.body.title = req.body.title.trim();
                req.body.productId = mongoose.Types.ObjectId(req.body.productId);
                const tutorialId = mongoose.Types.ObjectId(req.params.id);
                const tutorialExist = await tutorialsRepo.getByField({title: req.body.title, productId: req.body.productId, _id: { $ne: tutorialId }, isDeleted: false });
                if (_.isEmpty(tutorialExist)) {
                    const tutorialDetails = await tutorialsRepo.getById(tutorialId);
                    if (!_.isEmpty(tutorialDetails)) {
                        const productExist = await productRepo.getById(req.body.productId);
                        if (!productExist) {
                            requestHandler.throwError(400, 'bad request', 'No product found with your provided Id')();
                        } else {
                            const updateTutorial = await tutorialsRepo.updateById(req.body, tutorialId);
                            if (updateTutorial && updateTutorial._id) {
			                    const result = await tutorialsRepo.allTutorialList({_id: updateTutorial._id});
                                requestHandler.sendSuccess(res, 'Tutorial updated successfully')(result[0]);
                            } else {
                                requestHandler.throwError(400, 'bad request', 'Something went wrong!')();
                            }
                        }
                    } else {
                        requestHandler.throwError(400, 'bad request', 'Sorry data not found')();
                    }    
                } else {
                    requestHandler.throwError(400, 'bad request', 'Tutorial already exists with same title')();
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /* @Method: statusChange
    // @Description: Tutorial Status Change Active/Inactive
    */
    async statusChange(req, res) {
        try {
            const tutorialId = req.params.id;
            const result = await tutorialsRepo.getById(tutorialId)
            if (!_.isEmpty(result)) {
                let tutorialStatus = (result.status === "Active" ) ? "Inactive" : "Active";
                let tutorialUpdate = await tutorialsRepo.updateById({status: tutorialStatus}, result._id)
                requestHandler.sendSuccess(res, 'Faq status has changed successfully')(tutorialUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry FAQ not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

 
    /* @Method: delete
    // @Description: Tutorial delete
    */
    async delete(req, res) {
        try {
                const tutorialId = mongoose.Types.ObjectId(req.params.id);
                const tutorialDetails = await tutorialsRepo.getById(tutorialId);
                if (!_.isEmpty(tutorialDetails)) {
                    const updateTutorial = await tutorialsRepo.updateById({ isDeleted: true }, tutorialId);
                    if (updateTutorial && updateTutorial._id) {
                        requestHandler.sendSuccess(res, 'Tutorial deleted successfully')({ deleted: true });
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


module.exports = new TutorialsController();