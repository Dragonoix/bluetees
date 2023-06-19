const mongoose = require('mongoose');
const purchaseRepo = require('purchase/repositories/purchase.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class PurchaseController {
    constructor() {}

    /* @Method: details
    // @Description: Purchase details
    */
    async list(req, res) {
		try {
			const result = await purchaseRepo.getAllByField({ 
                isDeleted: false, 
                status: 'Active',
                location: req.params.location.trim().toUpperCase()
            })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Purchase list fetched.')(result);
            } else {
                const InternationResult = await purchaseRepo.getAllByField({ 
                    isDeleted: false, 
                    status: 'Active',
                    location: "INTERNATIONAL"
                })
                return requestHandler.sendSuccess(res, 'Purchase list fetched.')(InternationResult);
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

     /* @Method: details
    // @Description: Purchase details
    */
    async details(req, res) {
		try {
			const PurchaseId = req.params.id;
			const result = await purchaseRepo.getById(PurchaseId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Purchase details fetched.')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry purchase list not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


}

module.exports = new PurchaseController();