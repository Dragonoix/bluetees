const mongoose = require('mongoose');
const Product = require('product/models/product.model');
const _ = require('underscore');

class ProductRepository {
    constructor() {
        this.limit = 32;
    }
    async getAll(req) {
        try {

            let conditions = {};
            let and_clauses = [{ "isDeleted": false }];
            const currentPage = req.body.currentPage || 1;
            if (_.isObject(req.body) && _.has(req.body, 'keyword')) {
                if (!_.isEmpty(req.body.keyword)) {
                    const search_string = req.body.keyword.trim();
                    and_clauses.push({ "title": { $regex: search_string, $options: 'i' } });
                }
            }

            conditions['$and'] = and_clauses;

            const aggregateData = Product.aggregate([
                { $match: conditions },
                { $sort: { orderRank: 1 } }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await Product.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getAllProducts(req) {
        try {
            let conditions = {};
            let and_clauses = [];
            const currentPage = parseInt(req.body.page) || 1;
            and_clauses.push({ "isDeleted": false });

            if (_.isObject(req.body) && _.has(req.body, 'keyword')) {
                if (!_.isEmpty(req.body.keyword)) {
                    const search_string = req.body.keyword.trim();
                    and_clauses.push({ "title": { $regex: search_string, $options: 'i' } });
                }
            }
            conditions['$and'] = and_clauses;
            let sortOperator = { "$sort": {} };
            if (_.has(req.body, 'order') && req.body.order.length) {
                for (let order of req.body.order) {
                    let sortField = req.body.columns[+order.column].data;
                    if (order.dir == 'desc') {
                        var sortOrder = -1;
                    } else if (order.dir == 'asc') {
                        var sortOrder = 1;
                    }
                    sortOperator["$sort"][sortField] = sortOrder;
                }
            } else {
                sortOperator["$sort"]['_id'] = -1;
            }

            let aggregate = Product.aggregate([
                { $match: conditions },
                sortOperator
            ]);

            let options = {
                page: currentPage,
                limit: this.limit
            };
            let allProducts = await Product.aggregatePaginate(aggregate, options);
            return allProducts;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    }


    async getAllCustomerProduct(req) {
        try {

            let conditions = {};
            let and_clauses = [{ "isDeleted": false }];
            let userId = mongoose.Types.ObjectId(req.user._id);
            const currentPage = req.body.currentPage || 1;
            if (_.isObject(req.body) && _.has(req.body, 'keyword')) {
                if (!_.isEmpty(req.body.keyword)) {
                    const search_string = req.body.keyword.trim();
                    and_clauses.push({ "title": { $regex: search_string, $options: 'i' } });
                }
            }

            conditions['$and'] = and_clauses;

            const aggregateData = Product.aggregate([
                {
                    $lookup: {
                        from: "customer_devices",
                        let: {
                            product_id: "$_id"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$productId",
                                                    "$$product_id"
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    "$userId",
                                                    userId
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "customer_device_register"
                    }
                },
                {
                    $addFields: {
                        count_customer_device_register: { $size: "$customer_device_register" }
                    }
                },
                { $match: conditions },
                { $sort: { count_customer_device_register: -1, orderRank: 1 } }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await Product.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }


    async getAllCustomerProductForShare(param) {
        try {

            let conditions = {};
            let and_clauses = [{ "isDeleted": false }];
            let userId = mongoose.Types.ObjectId(param.userId);
            conditions['$and'] = and_clauses;

            const result = await Product.aggregate([
                {
                    $lookup: {
                        from: "customer_devices",
                        let: {
                            product_id: "$_id"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$productId",
                                                    "$$product_id"
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    "$userId",
                                                    userId
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "customer_device_register"
                    }
                },
                {
                    $addFields: {
                        count_customer_device_register: { $size: "$customer_device_register" }
                    }
                },
                { $match: conditions },
                { $sort: { count_customer_device_register: -1, orderRank: 1 } }
            ])

            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getById(id) {
        try {
            let result = await Product.findById(id).exec();
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }

    async getByField(params) {
        try {
            return await Product.findOne(params).exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByField(params) {
        try {
            return await Product.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await Product.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async save(data) {
        try {
            let result = await Product.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async delete(id) {
        try {
            await Product.findById(id).lean().exec();
            return await Product.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async getDifferentDeviceCount(ActiveUsers) {
        try {

            let aggregate = await Product.aggregate([
                {
                    $match: {
                        isDeleted: false,
                        status: "Active"
                    }
                },
                {
                    $lookup: {
                        from: "user_devices",
                        let: { productId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$productId", "$$productId"] },
                                            { $eq: ["$isRegisterComplete", true] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$status", "Active"] },

                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    let: { userID: "$userId" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$_id", "$$userID"] },
                                                        { $eq: ["$isDeleted", false] }
                                                    ]
                                                }
                                            }
                                        },
                                    ],
                                    as: "userData"
                                }
                            },
                            { $unwind: { path: '$userData', preserveNullAndEmptyArrays: false } },
                            {
                                $group: {
                                    _id: "$productId",
                                    count: { $sum: 1 }
                                }
                            },
                        ],
                        as: "user_device"
                    }
                },
                { $unwind: { path: '$user_device', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        productId: 1,
                        title: 1,
                        sub_title: 1,
                        image: 1,
                        active_device_count: { $cond: { if: "$user_device", then: "$user_device.count", else: 0 } },
                        active_device_percent: {
                            $cond: {
                                if: "$user_device", then:
                                {
                                    $divide: [
                                        {
                                            $multiply: [ActiveUsers, "$user_device.count"]
                                        },
                                        100
                                    ]
                                },
                                else: 0
                            }
                        },
                    }
                }
            ]);
            // console.log(aggregate, "USER DEVICE");
            return aggregate;
        } catch (error) {
            return error;
        }
    }


}

module.exports = new ProductRepository;