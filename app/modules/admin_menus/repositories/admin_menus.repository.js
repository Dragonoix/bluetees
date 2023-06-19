const adminMenus = require('admin_menus/models/admin_menus.model');
const mongoose = require('mongoose');
const _ = require('underscore');

class adminMenusRepository {
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

            const aggregateData = adminMenus.aggregate([
                { $match: conditions },
                { $sort: { _id: -1 } }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await adminMenus.aggregatePaginate(aggregateData, options);
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
            let result = await adminMenus.findById(id).exec();
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }

    async getAlladminMenuss(req) {
        try {
            let conditions = {};
            let and_clauses = [];
            const currentPage = parseInt(req.body.page) || 1;
            and_clauses.push({ "isDeleted": false });

            if (req.body.columns && req.body.columns.length) {
                let statusFilter = _.findWhere(req.body.columns, { data: 'status' });
                let adminMenusFilter = _.findWhere(req.body.columns, { data: 'adminMenus_level' });

                if (statusFilter && statusFilter.search && statusFilter.search.value) {
                    and_clauses.push({
                        "status": statusFilter.search.value
                    });
                }

                if (adminMenusFilter && adminMenusFilter.search && adminMenusFilter.search.value) {
                    and_clauses.push({
                        "adminMenus_level": adminMenusFilter.search.value
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

            let my_aggregate = adminMenus.aggregate([
                {
                    $lookup: {
                        "from": "users",
                        "let": { adminMenus_level: "$_id" },
                        "pipeline": [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$adminMenus_level", "$$adminMenus_level"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    user: '$first_name'
                                },
                            },

                        ],
                        "as": "user_details"
                    }
                },
                {
                    "$unwind": { path: "$user_details", preserveNullAndEmptyArrays: true }
                },
                {
                    $group: {
                        _id: '$_id',
                        userId: { $first: '$user_details._id' },
                        adminMenus_level: { $first: '$adminMenus_level' },
                        status: { $first: "$status" },
                        count: { $sum: 1 },
                        isDeleted: { $first: "$isDeleted" },
                    }
                },
                {
                    $project: {
                        _id: '$_id',
                        userId: '$userId',
                        adminMenus_level: '$adminMenus_level',
                        status: "$status",
                        count: { $cond: { if: '$userId', then: '$count', else: 0 } },
                        isDeleted: "$isDeleted",
                    }
                },
                { $match: conditions },
                sortOperator
            ])
            let options = {
                page: currentPage,
                limit: this.limit
            };
            let allData = await adminMenus.aggregatePaginate(my_aggregate, options);
            return allData;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    }

    async getByField(params) {

        try {
            let user = await adminMenus.findOne(params).exec();
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
            return await adminMenus.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByFieldLanguage(lang) {
        try {
            let aggregate = await adminMenus.aggregate([
                { $match: { isDeleted: false, status: "Active" } },
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
                        adminMenus_level: "$filteredData.adminMenus_level"
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
            await adminMenus.findById(id).lean().exec();
            return await adminMenus.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await adminMenus.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async save(data) {
        try {
            let result = await adminMenus.create(data);
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
            return await adminMenus.find(params).select(['adminMenus_level', 'shortcode']).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async getPermissionByRole(role){
        try {
            let permissionResult = await adminMenus.aggregate([
                {
                    $lookup: {
                        from: "rolepermissions",
                        let: { permissionId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ["$$permissionId" ,"$permission_id"] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$role_id", mongoose.Types.ObjectId(role)]}
                                        ]
                                    }
                                }
                            },
                        ],
                        as: "permission_data"
                    }
                },
                { $unwind: { path: '$permission_data', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        menu_name: "$menu_name",
                        slug: "$slug",
                        has_access: { $cond: { if: "$permission_data", then: true, else: false } }

                    }
                }

            ]);
            return permissionResult;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new adminMenusRepository;


