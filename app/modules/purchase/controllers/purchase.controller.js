const mongoose = require('mongoose');
const purchaseRepo = require('purchase/repositories/purchase.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class SkillController {
    constructor() {}

    /*
    // @Method: list
    // @Description: Skill list
    */
    async list(req, res) {
		try {
			const result = await purchaseRepo.getAllByField({ isDeleted: false })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Website details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry website is not present')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

    /* @Method: Purchase All List
    // @Description: To get all the Purchase List from DB
    */
    async getAllPurchase(req, res) {
        try {
            let purchase = await purchaseRepo.getAllPurchases(req);
            let data = {
                "recordsTotal": purchase.total,
                "recordsLimit": purchase.limit,
                "pages": purchase.pages,
                "page": purchase.page,
                "data": purchase.docs
            };   
            return requestHandler.sendSuccess(res, 'Purchase List Fetched')(data);
        }catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: create
    // @Description: Purchase create
    */
    async create(req, res) {
        try {
            req.body.purchase_from = req.body.purchase_from.trim();
            req.body.location = req.body.location.trim().toUpperCase();
            let result = await purchaseRepo.save(req.body);
            if(result) {
                requestHandler.sendSuccess(res, 'Purchase added successfully')(result);
            }else {
                requestHandler.throwError(400, 'bad request', 'Something Went Wrong')();
            }
    
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: details
    // @Description: Skill details
    */
    async details(req, res) {
		try {
			const purchaseId = req.params.id;
			const result = await purchaseRepo.getById(purchaseId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Website details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Website not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


    /* @Method: update
    // @Description: Skill edit and update
    */
    async update(req, res) {
        try {
            const purchaseId = req.params.id;
            const purchase_exist = await purchaseRepo.getByField({ purchase_from: req.body.purchase_from, _id: { $ne: purchaseId } });
            if (_.isEmpty(purchase_exist)) {
                const findweb = await purchaseRepo.getById(purchaseId);
                if (!_.isEmpty(findweb)) {
                    const result = await purchaseRepo.updateById(req.body, purchaseId);
                    requestHandler.sendSuccess(res, 'Website updated successfully')(result);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry Website not found')();
                }    
            } else {
                requestHandler.throwError(400, 'bad request', 'Website already exists with same name')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: statusChange
    // @Description: Purchase From Status Change Active/Inactive
    */
    async statusChange(req, res) {
        try {
            const purchaseId = req.params.id;
            const result = await purchaseRepo.getById(purchaseId)
            if (!_.isEmpty(result)) {
                let purchaseStatus = (result.status === "Active" ) ? "Inactive" : "Active";
                let purchaseUpdate = await purchaseRepo.updateById({status: purchaseStatus}, result._id)
                requestHandler.sendSuccess(res, 'Purchase status has changed successfully')(purchaseUpdate);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Purchase not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };



    /* @Method: delete
    // @Description: Purchase Delete
    */
    async delete(req, res) {
        try {
            const purchaseId = req.params.id;
            const result = await purchaseRepo.getById(purchaseId)
            const isPurchase = await purchaseRepo.getByField({ purchase_from: mongoose.Types.ObjectId(purchaseId), isDeleted: false, status: 'Active'});
            if (!_.isEmpty(isPurchase)) {
                requestHandler.throwError(400, 'bad request', 'Sorry this Purchase name has already assigned for user')();
            }    
            else if (!_.isEmpty(result) && _.isEmpty(isPurchase)) {
                let resultDelete = await purchaseRepo.updateById({isDeleted: true}, result._id)
                requestHandler.sendSuccess(res, 'Purchase source deleted successfully')(resultDelete);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Purchase source not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


}

module.exports = new SkillController();