const productRepo = require('product/repositories/product.repository');
const _ = require('underscore');
const mongoose = require('mongoose');
const config = require(appRoot +'/config/index')
const utils = require(appRoot +'/helper/utils')
const RequestHandler = require(appRoot+'/helper/RequestHandler');
const Logger = require(appRoot+'/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
// aws bucket //
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();


class ProductController {
    constructor() {}

    /*
    // @Method: list
    // @Description: Product list
    */
    async getAllProduct(req, res) {
        try {
            let product = await productRepo.getAllProducts(req);
            let data = {
                "recordsTotal": product.total,
                "recordsLimit": product.limit,
                "pages": product.pages,
                "page": product.page,
                "data": product.docs
            };
            return requestHandler.sendSuccess(res, 'Product List Fetched')(data);
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: store
    // @Description: Product store
    */
    async store(req, res) {
        try {
            req.body.title = req.body.title.trim()
            req.body.sub_title = req.body.sub_title.trim()
            req.body.productId = req.body.productId.trim();

            let chk = { isDeleted: false, title: req.body.title };
            let checkTitle = await productRepo.getByField(chk);
            if (!_.isEmpty(checkTitle)) {
                requestHandler.throwError(400, 'bad request', 'Sorry the product is already registered with same name!')();
            } else {
                let check = { isDeleted: false, productId: req.body.productId };
                let productIdCheck = await productRepo.getByField(check);
                if(!_.isEmpty(productIdCheck)) {
                    requestHandler.throwError(400, 'bad request', 'Sorry the product is already registered with same ID!')();
                }

                let uploadDcumentName = '';
                let uploadDocumentArr = [];
                if (req.files && req.files.length > 0) {
                    for(let i = 0; i < req.files.length; i++){
                        var fullPathArr = req.files[i].key.split("/");
                        uploadDcumentName = fullPathArr.pop();
                        uploadDocumentArr.push(uploadDcumentName)
                    }
                     req.body.image = uploadDocumentArr; 
                } 

                let saveProduct = await productRepo.save(req.body);
                if(saveProduct) {
                    requestHandler.sendSuccess(res, 'Product has added successfully')(saveProduct);
                }else {
                    requestHandler.throwError(400, 'bad request', 'Something Went Wrong')();
                }
            }
        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: details
    // @Description: Product details
    */
    async details(req, res) {
		try {
			const productId = req.params.id;
			const result = await productRepo.getById(productId)
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Product details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry product not found')();
            }     
			
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

    /* @Method: update
    // @Description: Product edit
    */
    async update(req, res) {
        try {
            const productId = req.params.id;
            req.body.title = req.body.title;
            let chkTitle = {
                isDeleted: false,
                title: { $regex: '^' + req.body.title + '$', $options: 'i' },
                _id: { $ne: mongoose.Types.ObjectId(req.body.id) }
            };
            let checkProductName = await productRepo.getByField(chkTitle);
            if (!_.isEmpty(checkProductName)) {
                requestHandler.throwError(400, 'bad request', 'Sorry this name is already present for another Product')();
            } else {
                req.body.productId = req.body.productId;
                let chkId = {
                    isDeleted: false,
                    productId: req.body.productId,
                    _id: { $ne: mongoose.Types.ObjectId(req.body.id) }
                };
                let checkProductId = await productRepo.getByField(chkId);
                if (!_.isEmpty(checkProductId)) {
                    requestHandler.throwError(400, 'bad request', 'Sorry this ID is already present for another Product')();
                }
                else {    
                const findProduct = await productRepo.getById(productId);
                  // For image update//
                    let uploadDcumentName = '';
                    let uploadDocumentArr = [];
                    if (req.files && req.files.length > 0) {
                        for(let i = 0; i < req.files.length; i++) {
                            await s3.deleteObject({ Bucket: config.aws.bucket, Key: "bluetees-app/" + findProduct.image }).promise();
                            var fullPathArr = req.files[i].key.split("/");
                            uploadDcumentName = fullPathArr.pop();
                            uploadDocumentArr.push(uploadDcumentName)
                        }
                        req.body.image = uploadDocumentArr; 
                    }
                if (!_.isEmpty(findProduct)) {
                    const result = await productRepo.updateById(req.body, productId);
                    requestHandler.sendSuccess(res, 'Product details has been updated successfully')(result);
                } else {
                    requestHandler.throwError(400, 'bad request', 'Sorry product not found')();
                } 
            }
        }  
           
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: delete
    // @Description: Product Delete
    */
    async delete(req, res) {
        try {
            const productId = req.params.id;
            const result = await productRepo.getById(productId)
            if (!_.isEmpty(result)) {
                let resultDelete = await productRepo.updateById({isDeleted: true}, result._id)
                requestHandler.sendSuccess(res, 'Product deleted successfully')(resultDelete);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry product not found')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

}

module.exports = new ProductController();