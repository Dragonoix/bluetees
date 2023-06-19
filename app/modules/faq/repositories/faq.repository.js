const mongoose = require('mongoose');
const faq = require('faq/models/faq.model');
const _ = require('underscore');

class faqRepository {
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
                    and_clauses.push({ "faq_website": { $regex: search_string, $options: 'i' } });
                }
            }
            conditions['$and'] = and_clauses;

            const aggregateData = faq.aggregate([
                { $match: conditions },
                { $sort: { _id: -1 } }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await faq.aggregatePaginate(aggregateData, options);
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
            let result = await faq.findById(id).exec();
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
            let user = await faq.findOne(params).exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            throw e;
        }
    }
    async getAllByField(params) {
        try {
            return await faq.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async delete(id) {
        try {
            await faq.findById(id).lean().exec();
            return await faq.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await faq.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async save(data) {
        try {
            let result = await faq.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async getAllFaqs(req) {
        try {
            let conditions = {};
            let and_clauses = [];
            const currentPage = parseInt(req.body.page) || 1;
            and_clauses.push({ "isDeleted": false });

            if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {
                and_clauses.push({
                    $or: [
                        { 'question': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'answer': { $regex: req.body.search.value.trim(), $options: 'i' } },
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

            let aggregate = faq.aggregate([
                { $match: conditions },
                {
                    $lookup: {
                        from: 'faq_feedbacks',
                        let: {
                            faq_id: '$_id'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$faq_id', '$$faq_id']
                                            },
                                            {
                                                $eq: ['$isDeleted', false]
                                            },
                                            {
                                                $eq: ['$status', 'Active']
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'faq_feedbacks'
                    }
                },
/*                 {
                    $project: {
                        "faq_feedbacks": 1,
                        "total_smily": 1,
                        "total_sad": 1,
                        "shortcode": 1,
                        "question": 1,
                        "answer": 1,
                        "videoLink": 1,
                        "status": 1,
                        "translate": 1,
                        "image": 1
                    }
                }, */
                {
                    $unwind:
                    {
                        path: "$faq_feedbacks",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        "_id": "$_id",
                        "smiley": {
                            "$sum": {
                                "$cond": [
                                    { "$eq": ["$faq_feedbacks.feedback_type", true] },
                                    1,
                                    0
                                ]
                            }
                        },
                        "sad": {
                            "$sum": {
                                "$cond": [
                                    { "$eq": ["$faq_feedbacks.feedback_type", false] },
                                    1,
                                    0
                                ]
                            }
                        },
                        "shortcode": { $first: '$shortcode' },
                        "question": { $first: '$question' },
                        "answer": { $first: '$answer' },
                        "videoLink": { $first: '$videoLink' },
                        "status": { $first: '$status' },
                        "translate": { $first: '$translate' },
                        "image": { $first: '$image' },
                    }
                },
                sortOperator
            ], { collation: { locale: "en", caseFirst: "upper" } });

            let options = {
                page: currentPage,
                limit: this.limit
            };
            let allUsers = await faq.aggregatePaginate(aggregate, options);
            return allUsers;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    }

    async getAllByFieldLanguage(params, lang) {
        try {
            let aggregate = await faq.aggregate([
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
                    $addFields: {
                        trans_question: "$filteredData.question",
                        trans_answer: "$filteredData.answer",
                    }
                },
                {
                    $project: {
                        shortcode: "$filteredData.shortcode",
                        question: { $cond: {if: {$eq: ["$trans_question", ""]}, then: "$question", else: "$trans_question"}},
                        answer: { $cond: {if: {$eq: ["$trans_answer", ""]}, then: "$answer", else: "$trans_answer"}},
                        image: "$image",
                        videoLink: "$videoLink",
                        eng_question: "$question",
                        eng_answer: "$answer"
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

    /* async getAllByFieldCustom(params) {
        try {
            return await faq.find(params).select(['shortcode', 'question,', 'answer']).lean().exec();
        } catch (error) {
            return error;
        }
    }
 */
    async getAllByFieldCustom(params) {
        try {
            let aggregate = await faq.aggregate([
                { $match: { isDeleted: false, status: "Active", "shortcode": "enUS", } },
                {
                    $project: {
                        shortcode: 1,
                        question: 1,
                        answer: 1,
                        image: 1,
                        videoLink: 1
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

module.exports = new faqRepository;