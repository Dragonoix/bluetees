const mongoose = require('mongoose');
const Tutorials = require('tutorials/models/tutorials.model');
const _ = require('underscore');

class TutorialsRepository {
    constructor() {
        this.limit = 10;
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

            if (_.isObject(req.body) && _.has(req.body, 'productId')) {
                if (!_.isEmpty(req.body.productId)) {
                    and_clauses.push({ "productId": mongoose.Types.ObjectId(req.body.productId) });
                }
            }

            conditions['$and'] = and_clauses;

            const aggregateData = Tutorials.aggregate([
                {
                    $lookup: {
                        from: "products",
                        let: { productId: "$productId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$productId"] },
                                            { $eq: ["$status", "Active"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    status: 0,
                                    isDeleted: 0
                                }
                            }
                        ],
                        as: "productData"
                    }
                },
                { $unwind: { path: "$productData", preserveNullAndEmptyArrays: false } },
                { $match: conditions },
                {
                    $project: {
                        status: 0,
                        isDeleted: 0,
                        productId: 0
                    }
                },
                { $sort: { orderRank: 1 } }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await Tutorials.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getAllTutorials(req) {
        try {
            let conditions = {};
            let and_clauses = [];
            const currentPage = parseInt(req.body.page) || 1;
            and_clauses.push({ "isDeleted": false });

            if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {
                and_clauses.push({
                    $or: [
                        { 'title': { $regex: req.body.search.value.trim(), $options: 'i' } }
                    ]
                });
            }

            if (req.body.columns && req.body.columns.length) {
                let statusFilter = _.findWhere(req.body.columns, { data: 'status' });

                if (statusFilter && statusFilter.search && statusFilter.search.value) {
                    and_clauses.push({
                        "status": statusFilter.search.value
                    });
                }
            }


            conditions['$and'] = and_clauses;

            console.log(conditions);

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

            let aggregate = Tutorials.aggregate([
                {
                    $lookup: {
                        "from": "products",
                        "let": { productId: "$productId" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$productId"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },

                        ],
                        "as": "user_product"
                    }
                },
                {
                    "$unwind": { path: "$user_product", preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        _id: "$_id",
                        Device_type: "$user_product.title",
                        createdAt: "$createdAt",
                        status: "$status",
                        title: "$title",
                        youtubeVideoLink: "$youtubeVideoLink",
                        isDeleted: "$isDeleted"
                    },
                },
                { $match: conditions },
                sortOperator
            ], { collation: { locale: "en", caseFirst: "upper" } });

            let options = {
                page: currentPage,
                limit: this.limit
            };
            let allUsers = await Tutorials.aggregatePaginate(aggregate, options);
            return allUsers;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    }

    async getById(id) {
        try {
            let result = await Tutorials.findById(id).exec();
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
            return await Tutorials.findOne(params).exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByField(params) {
        try {
            return await Tutorials.find(params).sort({ createdAt: -1 }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await Tutorials.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async save(data) {
        try {
            let result = await Tutorials.create(data);
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
            await Tutorials.findById(id).lean().exec();
            return await Tutorials.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }


    async allTutorialList(params) {
        try {
            let aggregate = await Tutorials.aggregate([
                { $match: params },
                {
                    $lookup: {
                        from: "products",
                        let: { productId: "$productId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$productId"] },
                                            { $eq: ["$status", "Active"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    status: 0,
                                    isDeleted: 0
                                }
                            }
                        ],
                        as: "productData"
                    }
                },
                { $unwind: { path: "$productData", preserveNullAndEmptyArrays: false } },
                {
                    $project: {
                        status: 0,
                        isDeleted: 0,
                        productId: 0
                    }
                },
                { $sort: { orderRank: 1 } }
            ]);

            if (aggregate && aggregate.length) {
                return aggregate;
            } else {
                return null;
            }
        } catch (e) {
            throw e;
        }
    }


    async getAllByFieldLanguage(params, lang) {
        try {
            let aggregate = await Tutorials.aggregate([
                { $match: params },
                {
                    $addFields: {
                        filteredData: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$translate",
                                        as: "trans",
                                        cond: { $eq: ["$$trans.shortcode", lang] }
                                    }
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $project: {
                        shortcode: "$filteredData.shortcode",
                        title: "$filteredData.title",
                        youtubeVideoLink: "$youtubeVideoLink",
                        productId: "$productId",

                    }
                }
            ]);
            if (aggregate.length > 0 && aggregate[0].shortcode) {
                return aggregate;
            } else {
                return [];
            }

        } catch (error) {
            return error;
        }
    }

    async getAllByFieldCustom(params) {
        try {
            let aggregate = await Tutorials.aggregate([
                { $match: params },
                {
                    $project: {
                        "isDeleted": 0,
                        "status": 0,
                        "createdAt": 0,
                        "updatedAt": 0,
                        "translate": 0
                    }
                }
            ]);
            if (aggregate.length > 0 && aggregate[0].shortcode) {
                return aggregate;
            } else {
                return [];
            }
        } catch (error) {
            return error;
        }
    }

}

module.exports = new TutorialsRepository;