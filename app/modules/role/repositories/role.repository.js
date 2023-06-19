const Role = require('role/models/role.model');
const _ = require('underscore');

class RoleRepository {
    constructor() {
        this.limit = 10;
    }
    async getAll(req) {
        try {

            let conditions = {};
            let and_clauses = [{ "isDeleted": false, "rolegroup" : "backend" }];
            const currentPage = parseInt(req.body.page_no) ? (req.body.page_no) : 1;
            if (_.isObject(req.body) && _.has(req.body, 'searchString')) {
                if (!_.isEmpty(req.body.searchString)) {
                    const search_string = req.body.searchString.trim();
                    and_clauses.push({ "roleDisplayName": { $regex: search_string, $options: 'i' } });
                }
            }
            if (_.isObject(req.body) && _.has(req.body, 'status') && (req.body.status)) {

                and_clauses.push({ "status": req.body.status });

            }
            conditions['$and'] = and_clauses;

            const aggregateData = Role.aggregate([
                { $match: conditions },
                { $sort: { _id: -1 } }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await Role.aggregatePaginate(aggregateData, options);
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
            let result = await Role.findById(id).exec();
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
            return await Role.findOne(params).exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByField(params) {
        try {
            return await Role.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async delete(id) {
        try {
            await Role.findById(id).lean().exec();
            return await Role.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await Role.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async save(data) {
        try {
            let result = await Role.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async getPermissionByRoleDetails(){
        try {
            let permissionResult = await Role.aggregate([
                {
                    $match: {
                        isDeleted: false
                    }
                },
                {
                    $lookup: {
                        from: "admin_menus",
                        let: { stat: false , roleID: '$_id', status: "Active"},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$isDeleted" ,"$$stat"] },
                                            { $eq: ["$status" ,"$$status"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "rolepermissions",
                                    let: { menuId: "$_id" , roleUID: "$$roleID"},
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $in: ["$$menuId" ,"$permission_id"] },
                                                        { $eq: ["$role_id", "$$roleUID"]}
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
                                    menu_name: 1,
                                    slug: 1,
                                    checked: { $cond: { if: "$permission_data", then: true, else: false } }
                                }
                            }
                        ],
                        as: "menus"
                    }
                },
                {
                    $project: {
                        roleDisplayName: '$roleDisplayName',
                        role: '$role',
                        rolegroup: '$rolegroup',
                        menus: '$menus'
                    }
                }

            ]);
            return permissionResult;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new RoleRepository;