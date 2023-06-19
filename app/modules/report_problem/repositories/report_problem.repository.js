const { default: mongoose } = require('mongoose');
const problem = require('report_problem/models/problem.model');
const reportProblem = require('report_problem/models/report_problem.model');

const _ = require('underscore');

class reportProblemRepository {
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
                    and_clauses.push({ "skill_level": { $regex: search_string, $options: 'i' } });
                }
            }
            conditions['$and'] = and_clauses;

            const aggregateData = problem.aggregate([
                { $match: conditions },
                { $sort: { _id: -1 } }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await problem.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getBugCountByParam(params) {
        let problem = await reportProblem.countDocuments(params);
        try {
            if (!problem) {
                return 0;
            }
            return problem;

        } catch (e) {
            return e;
        }
    }

    async getById(id) {
        try {
            let result = await problem.findById(id).populate('parent_problemId').exec();
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }
    async getByIdUserProblem(id) {
        try {
            let result = await reportProblem.findById(id).exec();
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
            let user = await problem.findOne(params).exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    }
    async getAllByField(params) {
        try {
            return await problem.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByFieldCustomQuery(req) {

        try {
            let data = await problem.aggregate([
                {
                    $match: {
                        isDeleted: false,
                        status: 'Active',
                    }
                },
                {
                    $addFields: {
                        filteredTrans: {
                            $filter: {
                                input: '$translate',
                                as: 'item',
                                cond: { $eq: ['$$item.shortcode', req.query.lang] }
                            }
                        }
                    }
                },
                {
                    "$unwind": { path: "$filteredTrans", preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        _id: 1,
                        parent_problemId: 1,
                        problem_name: { $cond: { if: '$filteredTrans', then: '$filteredTrans.problem_name', else: '$problem_name' } },
                        shortcode: { $cond: { if: '$filteredTrans', then: '$filteredTrans.shortcode', else: '$shortcode' } },
                        slug: 1,
                        has_child: 1,
                        translate: 1,
                        isDeleted: 1,
                        status: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]);
            // console.log(data, "HEREEEEEEE");
            return data;
        } catch (error) {
            return error;
        }
    }

    async getAllByFieldReport(params) {
        try {
            return await reportProblem.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByFieldReportWithDetails(params) {
        try {
            return await reportProblem.find(params).populate("problemId");
        } catch (error) {
            return error;
        }
    }


    async getAllByFieldPagination(req) {
        try {
            const currentPage = parseInt(req.body.page) || 1;

            let aggregate = problem.aggregate([
                {
                    $match: {
                        parent_problemId: mongoose.Types.ObjectId(req.params.id),
                        isDeleted: false
                    }
                },
                {
                    $lookup: {
                        from: "problems",
                        let: { problemId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$parent_problemId", "$$problemId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "childData"
                    }
                },
                {
                    $project: {
                        parent_problemId: "$parent_problemId",
                        problem_name: "$problem_name",
                        send_to_gorgias: "$send_to_gorgias",
                        isDeleted: "$isDeleted",
                        status: "$status",
                        createdAt: "$createdAt",
                        shortcode: "$shortcode",
                        has_child: { $cond: { if: { $gt: [{ $size: '$childData' }, 0] }, then: true, else: false } }
                    }
                },
                { $sort: { createdAt: -1 } }

            ]);
            let options = {
                page: currentPage,
                limit: this.limit
            };
            let allProblems = await problem.aggregatePaginate(aggregate, options);
            return allProblems;
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async getAllByFieldPaginationParent(req) {
        try {
            const currentPage = parseInt(req.body.page) || 1;

            let aggregate = problem.aggregate([
                {
                    $match: {
                        parent_problemId: null,
                        isDeleted: false
                    }
                },
                {
                    $lookup: {
                        from: "problems",
                        let: { problemId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$parent_problemId", "$$problemId"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "problems",
                                    let: { problemId: "$_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$parent_problemId", "$$problemId"] }
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    as: "subChildData"
                                }
                            },
                        ],
                        as: "childData"
                    }
                },
                {
                    $project: {
                        parent_problemId: "$parent_problemId",
                        problem_name: "$problem_name",
                        translate: "$translate",
                        send_to_gorgias: "$send_to_gorgias",
                        isDeleted: "$isDeleted",
                        status: "$status",
                        createdAt: "$createdAt",
                        shortcode: "$shortcode",
                        has_child: { $cond: { if: { $gt: [{ $size: '$childData' }, 0] }, then: true, else: false } }
                    }
                }
            ]);
            let options = {
                page: currentPage,
                limit: this.limit
            };
            let allProblems = await problem.aggregatePaginate(aggregate, options);
            return allProblems;
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async getAllByFieldLanguage(params, lang) {
        try {
            let aggregate = await problem.aggregate([
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
                        problem_name: "$filteredData.problem_name"
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

    async delete(id) {
        try {
            await problem.findById(id).lean().exec();
            return await problem.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await problem.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateByIdUser(data, id) {
        try {
            return await reportProblem.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async save(data) {
        try {
            let result = await problem.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async ReportProblemsave(data) {
        try {
            let result = await reportProblem.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }


    async getAllByFieldCustom(params) {
        try {
            return await problem.find(params).select(['skill_level', 'shortcode']).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async getAllReports(req) {
        try {
            const currentPage = req.body.currentPage || 1;

            const aggregateData = reportProblem.aggregate([
                {
                    $match: {
                        "isDeleted": false,
                        "status": "Active"
                    }
                },
                {
                    $lookup: {
                        from: "problems",
                        let: { problemId: "$problemId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$problemId"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "problems",
                                    let: { problemId: "$parent_problemId" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$_id", "$$problemId"] }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: "problems",
                                                let: { problemId: "$parent_problemId" },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ["$_id", "$$problemId"] }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ],
                                                as: "ParentProblemData"
                                            }
                                        },
                                        { $unwind: { path: "$ParentProblemData", preserveNullAndEmptyArrays: true } },
                                    ],
                                    as: "ChildProblemData"
                                }
                            },
                            { $unwind: { path: "$ChildProblemData", preserveNullAndEmptyArrays: true } },
                        ],
                        as: "problemData"
                    }
                },
                { $unwind: { path: "$problemData", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        userId: "$userId",
                        problemId: "$problemId",
                        problem: "$problem",
                        problem_category: {
                            $switch: {
                                branches: [
                                    { case: '$problemData.ChildProblemData.ParentProblemData', then: { $concat: ['$problemData.ChildProblemData.ParentProblemData.problem_name', ' -> ', '$problemData.ChildProblemData.problem_name', ' -> ', '$problemData.problem_name'] } },
                                    { case: '$problemData.ChildProblemData', then: { $concat: ['$problemData.ChildProblemData.problem_name', ' -> ', '$problemData.problem_name'] } },
                                    { case: '$problemData', then: '$problemData.problem_name' }
                                ]
                            }
                        }
                    }
                }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await reportProblem.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async userReportProblem(req) {
        try {
            const aggregateData = reportProblem.aggregate([
                {
                    $match: {
                        "_id": mongoose.Types.ObjectId(req.params.id),
                        "isDeleted": false,
                        "status": "Active"
                    }
                },
                {
                    $lookup: {
                        from: "problems",
                        let: { problemId: "$problemId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$problemId"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "problems",
                                    let: { problemId: "$parent_problemId" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$_id", "$$problemId"] }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: "problems",
                                                let: { problemId: "$parent_problemId" },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ["$_id", "$$problemId"] }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ],
                                                as: "ParentProblemData"
                                            }
                                        },
                                        { $unwind: { path: "$ParentProblemData", preserveNullAndEmptyArrays: true } },
                                    ],
                                    as: "ChildProblemData"
                                }
                            },
                            { $unwind: { path: "$ChildProblemData", preserveNullAndEmptyArrays: true } },
                        ],
                        as: "problemData"
                    }
                },
                { $unwind: { path: "$problemData", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        let: { userId: "$userId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$userId"] }
                                        ]
                                    }
                                }
                            },
                        ],
                        as: "userData"
                    }
                },
                { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
                // {
                //     $project: {
                //         firstname: "$userData.problemData.first_name",
                //         lastname: "$userData.problemData.last_name",
                //         problemName: "$problemData.problem_name",
                //         problem: "$problem",
                //     }
                // }
            ])
            const result = await reportProblem.aggregatePaginate(aggregateData);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getAllProblems(req) {
        try {
            let conditions = {};
            let and_clauses = [];
            const currentPage = parseInt(req.body.page) || 1;
            and_clauses.push({ "isDeleted": false });

            if (req.body.columns && req.body.columns.length) {
                let statusFilter = _.findWhere(req.body.columns, { data: 'status' });
                let problemFilter = _.findWhere(req.body.columns, { data: 'problem' });
                let dateFilter = _.findWhere(req.body.columns, { data: 'date' });
                let typeFilter = _.findWhere(req.body.columns, { data: 'type' });


                if (statusFilter && statusFilter.search && statusFilter.search.value) {
                    and_clauses.push({
                        "status": statusFilter.search.value
                    });
                }

                if (problemFilter && problemFilter.search && problemFilter.search.value) {
                    and_clauses.push({
                        "type_of_issue": problemFilter.search.value
                    });
                }

                if (dateFilter && dateFilter.search && dateFilter.search.value) {
                    let dateOnly = ((dateFilter.search.value).split("T"))[0]
                    console.log(dateOnly);

                    and_clauses.push({
                        "createdAtString": dateOnly
                    });
                }

                if (typeFilter && typeFilter.search && typeFilter.search.value) {
                    if (typeFilter.search.value == "gorgias") {
                        and_clauses.push({
                            "send_to_gorgias": true
                        });
                    }

                    if (typeFilter.search.value == "igolf") {
                        and_clauses.push({
                            "send_to_igolf": true
                        });
                    }

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
            let aggregate = reportProblem.aggregate([
                {
                    $lookup: {
                        "from": "users",
                        "let": { userId: "$userId" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$userId"] }
                                        ]
                                    }
                                }
                            },

                        ],
                        "as": "user"
                    }
                },
                {
                    "$unwind": { path: "$user", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        "from": "problems",
                        "let": { problemId: "$problemId" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$problemId"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    "from": "problems",
                                    "let": { problemId: "$parent_problemId" },
                                    "pipeline": [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$_id", "$$problemId"] },
                                                        { $eq: ["$isDeleted", false] }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            $lookup: {
                                                "from": "problems",
                                                "let": { problemId: "$parent_problemId" },
                                                "pipeline": [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ["$_id", "$$problemId"] },
                                                                    { $eq: ["$isDeleted", false] }
                                                                ]
                                                            }
                                                        }
                                                    },

                                                ],
                                                "as": "problem_level3"
                                            }
                                        },
                                        {
                                            "$unwind": { path: "$problem_level3", preserveNullAndEmptyArrays: true }
                                        },

                                    ],
                                    "as": "problem_level2"
                                }
                            },
                            {
                                "$unwind": { path: "$problem_level2", preserveNullAndEmptyArrays: true }
                            },

                        ],
                        "as": "problem_level1"
                    }
                },
                {
                    "$unwind": { path: "$problem_level1", preserveNullAndEmptyArrays: true }
                },
                {
                    $addFields:
                    {
                        createdAtString: {
                            $dateToString: {
                                date: '$createdAt',
                                format: "%Y-%m-%d",
                            }
                        }
                    },
                },
                {
                    $project: {
                        first_name: '$user.first_name',
                        last_name: '$user.last_name',
                        country_code: '$user.country_code',
                        phone: '$user.phone',
                        type_of_issue: {
                            $switch: {
                                branches: [
                                    { case: '$problem_level1.problem_level2.problem_level3', then: '$problem_level1.problem_level2.problem_level3.problem_name' },
                                    { case: '$problem_level1.problem_level2', then: '$problem_level1.problem_level2.problem_name' },
                                    { case: '$problem_level1', then: '$problem_level1.problem_name' }
                                    
                                ],
                                default: ""
                            }
                        },
                        support_text: '$problem',
                        createdAtString: '$createdAtString',
                        send_to_gorgias: "$send_to_gorgias",
                        send_to_igolf: "$send_to_igolf",
                        status: '$status',
                        isDeleted: '$isDeleted'

                    }
                },
                { $match: conditions },
                sortOperator
            ]);

            let options = {
                page: currentPage,
                limit: this.limit
            };
            let allUsers = await reportProblem.aggregatePaginate(aggregate, options);
            return allUsers;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    }


    async getAllProblemsByLevel(req) {
        try {

            let aggregate = await problem.aggregate([
                {
                    $match: {
                        parent_problemId: null,
                        isDeleted: false,
                        status: 'Active'
                    }
                },
                {
                    $addFields: {
                        filteredTrans: {
                            $filter: {
                                input: '$translate',
                                as: 'item',
                                cond: { $eq: ['$$item.shortcode', req.query.lang] }
                            }
                        }
                    }
                },
                {
                    "$unwind": { path: "$filteredTrans", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        "from": "problems",
                        "let": { problemId: "$_id" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$parent_problemId", "$$problemId"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $addFields: {
                                    filteredTrans: {
                                        $filter: {
                                            input: '$translate',
                                            as: 'item',
                                            cond: { $eq: ['$$item.shortcode', req.query.lang] }
                                        }
                                    }
                                }
                            },
                            {
                                "$unwind": { path: "$filteredTrans", preserveNullAndEmptyArrays: true }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    parent_problemId: 1,
                                    problem_name: { $cond: { if: '$filteredTrans', then: '$filteredTrans.problem_name', else: '$problem_name' } },
                                    shortcode: { $cond: { if: '$filteredTrans', then: '$filteredTrans.shortcode', else: '$shortcode' } },
                                    slug: 1,
                                    has_child: 1,
                                    translate: 1,
                                    isDeleted: 1,
                                    status: 1,
                                    createdAt: 1,
                                    updatedAt: 1
                                }
                            },
                            {
                                $lookup: {
                                    "from": "problems",
                                    "let": { problemId2: "$_id" },
                                    "pipeline": [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$parent_problemId", "$$problemId2"] },
                                                        { $eq: ["$isDeleted", false] }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            $addFields: {
                                                filteredTrans: {
                                                    $filter: {
                                                        input: '$translate',
                                                        as: 'item',
                                                        cond: { $eq: ['$$item.shortcode', req.query.lang] }
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            "$unwind": { path: "$filteredTrans", preserveNullAndEmptyArrays: true }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                parent_problemId: 1,
                                                problem_name: { $cond: { if: '$filteredTrans', then: '$filteredTrans.problem_name', else: '$problem_name' } },
                                                shortcode: { $cond: { if: '$filteredTrans', then: '$filteredTrans.shortcode', else: '$shortcode' } },
                                                slug: 1,
                                                has_child: 1,
                                                translate: 1,
                                                isDeleted: 1,
                                                status: 1,
                                                createdAt: 1,
                                                updatedAt: 1
                                            }
                                        }

                                    ],
                                    "as": "child_level1"
                                }
                            },


                        ],
                        "as": "child"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        parent_problemId: 1,
                        problem_name: { $cond: { if: '$filteredTrans', then: '$filteredTrans.problem_name', else: '$problem_name' } },
                        shortcode: { $cond: { if: '$filteredTrans', then: '$filteredTrans.shortcode', else: '$shortcode' } },
                        slug: 1,
                        has_child: 1,
                        translate: 1,
                        isDeleted: 1,
                        status: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        child: 1
                    }
                }

            ]);

            return aggregate;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    }

    async getAllByFieldCustom(params) {
        try {
            let aggregate = await problem.aggregate([
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

    async getProblemTree(id) {
        try {
            let aggregate = await problem.aggregate([
                {
                    $match: {
                        isDeleted: false,
                        _id: mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: "problems",
                        let: { problemId: "$parent_problemId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$problemId"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "problems",
                                    let: { problemId: "$parent_problemId" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ["$_id", "$$problemId"] }
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    as: "ParentProblemData"
                                }
                            },
                            { $unwind: { path: "$ParentProblemData", preserveNullAndEmptyArrays: true } },
                        ],
                        as: "ChildProblemData"
                    }
                },
                { $unwind: { path: "$ChildProblemData", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        tree: {
                            $switch: {
                                branches: [
                                    { case: '$ChildProblemData.ParentProblemData', then: { $concat: ['$ChildProblemData.ParentProblemData.problem_name', ' - ', '$ChildProblemData.problem_name', ' - ', '$problem_name'] } },
                                    { case: '$ChildProblemData', then: { $concat: ['$ChildProblemData.problem_name', ' - ', '$problem_name'] } },
                                    { case: '$problem_name', then: '$problem_name' }
                                ]
                            }
                        }
                    }
                }
            ]);
            if (aggregate && aggregate.length > 0) {
                return aggregate[0];
            } else {
                return {};
            }
        } catch (error) {
            return error;
        }
    }

    async getDetails(id) {
        try {
            let result = await problem.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: "problems",
                        let: { problemId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$parent_problemId", "$$problemId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "childData"
                    }
                },
                {
                    $project: {
                        parent_problemId: "$parent_problemId",
                        problem_name: "$problem_name",
                        translate: "$translate",
                        send_to_gorgias: "$send_to_gorgias",
                        send_to_igolf: '$send_to_igolf',
                        isDeleted: "$isDeleted",
                        status: "$status",
                        createdAt: "$createdAt",
                        shortcode: "$shortcode",
                        has_child: { $cond: { if: { $gt: [{ $size: '$childData' }, 0] }, then: true, else: false } }
                    }
                }
            ]);


            if (result && result.length > 0) {
                return result[0];
            } else {
                return null;
            }

        } catch (e) {
            return e;
        }
    }

}

module.exports = new reportProblemRepository;