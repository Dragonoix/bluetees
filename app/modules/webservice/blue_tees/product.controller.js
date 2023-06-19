const mongoose = require('mongoose');
const productRepo = require('product/repositories/product.repository');
const _ = require('underscore');
const slug = require('slug');
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class productController {
    constructor() {}

    /* @Method: List 
    // @Description: Product list
    */
    async list(req, res) {
		try {
			const result = await productRepo.getAllByField({ isDeleted: false, status: 'Active' })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Product details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry Product is not present')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}


}

module.exports = new productController();