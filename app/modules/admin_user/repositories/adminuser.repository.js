const AdminUser = require('user/models/user.model');
const mongoose = require('mongoose');
const _ = require('underscore');

class AdminUserRepository {
    constructor() {
        this.limit = 10;
    }

    async getAll(req) {
        try {
            let logginUserId = req.user._id;
            let conditions = {};
            let and_clauses = [{ "isDeleted": false, 'user_role.rolegroup': 'frontend', _id: { $ne: logginUserId } }];
            const currentPage = req.body.page || 1;


            if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {
                and_clauses.push({
                    $or: [
                        { 'first_name': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'last_name': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'full_name': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'phone': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'email': { $regex: '^'+req.body.search.value.trim(), $options: 'i' } }
                    ]
                });
            }

            if (req.body.columns && req.body.columns.length) {
                let statusFilter = _.findWhere(req.body.columns, { data: 'status' });
                let commuteFilter = _.findWhere(req.body.columns, { data: 'commute' });

                if (statusFilter && statusFilter.search && statusFilter.search.value) {
                    let status = statusFilter.search.value === 'Active' ? true : false
                    and_clauses.push({
                        "isActive": status
                    });
                }

                if (commuteFilter && commuteFilter.search && commuteFilter.search.value) {
                    if (commuteFilter.search.value === 'walking') {
                        and_clauses.push({
                            "walking": true
                        });
                    }
                    if (commuteFilter.search.value === 'driving') {
                        and_clauses.push({
                            "driving": true
                        });
                    }

                }

            }

            let currentdate=new Date();
            let lastDate= new Date(currentdate.setDate(currentdate.getDate() - 5));
            
            // For sorting //
            let sortOperator = { "$sort": {} };
            if (_.isObject(req.body) && _.has(req.body, 'sortBy')) {
                let sortBy = req.body.sortBy;
                let sortField = '_id';
                let sortOrder = -1;
                if (sortBy == 'adminuser_name_a_z') {
                    sortOrder = 1;
                    sortField = 'name'
                } else if (sortBy == 'adminuser_name_z_a') {
                    sortOrder = -1;
                    sortField = 'name'
                } else if (sortBy == 'old') {
                    sortOrder = 1;
                    sortField = '_id'
                } else if (sortBy == 'new') {
                    sortOrder = -1;
                    sortField = '_id'
                } else if (sortBy == 'last_name') {
                    sortOrder = 1;
                    sortField = 'last_name'
                } else if (sortBy == 'status') {
                    sortOrder = -1;
                    and_clauses.push({
                        "createdAt": {
                            $lte: new Date(),
                            $gt: lastDate
                        }
                    });
                } else if (sortBy == 'createdAt') {
                    sortOrder = -1;
                    sortField = 'createdAt'
                } else {
                    sortOrder = -1;
                    sortField = '_id'
                }
                sortOperator["$sort"][sortField] = sortOrder;
            } else {
                sortOperator["$sort"]['_id'] = -1;
            }

            conditions['$and'] = and_clauses;

            const aggregateData = AdminUser.aggregate([
                {
                    "$lookup": {
                        "from": "roles",
                        "localField": "role",
                        "foreignField": "_id",
                        "as": "user_role"
                    },
                },
                { $unwind: "$user_role" },
                {
                    $addFields: {
                        full_name: { $concat: [ "$first_name", " ", "$last_name" ] } 
                    }
                },
                { $match: conditions },
                sortOperator
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await AdminUser.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getUserCountByParam(params) {
        let user = await AdminUser.countDocuments(params);
        try {
            if (!user) {
                return 0;
            }
            return user;

        } catch (e) {
            return e;
        }
    }

    async getById(id) {
        try {
            let result = await AdminUser.findById(id).exec();
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }


    async getById(id) {
        let result = await AdminUser.findById(id).populate("skill_level");
        try {
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }

    async getByField(params) {
        let result = await AdminUser.findOne(params).exec();
        try {
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }

    async getAllByField(params) {
        let result = await AdminUser.find(params).exec();
        try {
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }

    async getCustomerCount(params) {
        try {
            let result = await AdminUser.countDocuments(params);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async updateById(data, id) {
        try {
            let result = await AdminUser.findByIdAndUpdate(id, data, { new: true, upsert: true }).exec();
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async updateByField(data, query) {
        try {
            let result = await AdminUser.findOneAndUpdate(query, data, {
                new: true,
                upsert: true
            });
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async save(data) {
        try {
            let result = await AdminUser.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async updatePassword(field, data) {
        try {
            let passwordUpdate = await AdminUser.updateOne(field, data);
            if (!passwordUpdate) {
                return null;
            }
            return shotDelete;
        } catch (e) {
            return e;
        }
    }

    async delete(id) {
        try {
            let result = await AdminUser.findById(id);
            if (result) {
                let resultDelete = await AdminUser.remove({ _id: id }).exec();
                if (!resultDelete) {
                    return null;
                }
                return resultDelete;
            }
        } catch (e) {
            throw e;
        }
    }

    async getAdminUserInfoById(id) {
        try {
            let getData = await AdminUser.aggregate([
                {
                    $match:{
                        _id:id,
                        isDeleted:false
                    }
                },
                {
                    $lookup:{
                        from:"roles",
                        let:{roleId:"$role"},
                        pipeline:[{
                            $match:{
                                $expr:{
                                    $and:[
                                        {
                                            $eq:["$_id","$$roleId"]
                                        },
                                        {
                                            $eq:["$isDeleted",false]
                                        }
                                    ]
                                }
                            }
                        }],
                        as:"role_data"
                    }
                },
                {
                    $unwind:"$role_data"
                },
                {
                    $project:{
                        _id:1,
                        first_name:1,
                        last_name:1,
                        profile_image:1,
                        email:1,
                        phone:1,
                        role:1,
                        roleDisplayName:"$role_data.roleDisplayName",
                        isDeleted:1,
                        isActive:1
                    }
                }
            ]);

            if(!getData) {
                return null;
            }
            return getData;

        } catch (e) {
            throw e;
        }
    }

    async getAllAdminUsers(req) {
        try {
            let logginUserId = mongoose.Types.ObjectId(req.user._id);
            let conditions = {};
            let and_clauses = [{ "isDeleted": false, 'role_data.rolegroup': 'backend', _id: { $ne: logginUserId } }];
            const currentPage = req.body.page || 1;
            /* if (_.isObject(req.body) && _.has(req.body, 'keyword')) {
                if (!_.isEmpty(req.body.keyword)) {
                    const search_string = req.body.keyword.trim();
                    and_clauses.push({
                        $or: [
                            { 'first_name': { $regex: search_string, $options: 'i' } },
                            { 'last_name': { $regex: search_string, $options: 'i' } },
                            { 'phone': { $regex: search_string, $options: 'i' } }
                        ]
                    });
                }
            } */

            if (_.isObject(req.body.search) && _.has(req.body.search, 'value')) {
                and_clauses.push({
                    $or: [
                        { 'first_name': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'last_name': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'full_name': { $regex: req.body.search.value.trim(), $options: 'i' } },
                        { 'email': { $regex: req.body.search.value.trim(), $options: 'i' } }
                    ]
                });
            }

            if (req.body.columns && req.body.columns.length) {
                let statusFilter = _.findWhere(req.body.columns, { data: 'status' });

                if (statusFilter && statusFilter.search && statusFilter.search.value) {
                    let status = statusFilter.search.value === 'Active' ? true : false
                    and_clauses.push({
                        "isActive": status
                    });
                }
            }

            conditions['$and'] = and_clauses;



            // For sorting //
            let sortOperator = { "$sort": {} };
            if (_.isObject(req.body) && _.has(req.body, 'sortBy')) {
                let sortBy = req.body.sortBy;
                let sortField = '_id';
                let sortOrder = -1;
                if (sortBy == 'adminuser_name_a_z') {
                    sortOrder = 1;
                    sortField = 'name'
                } else if (sortBy == 'adminuser_name_z_a') {
                    sortOrder = -1;
                    sortField = 'name'
                } else if (sortBy == 'old') {
                    sortOrder = 1;
                    sortField = '_id'
                } else if (sortBy == 'new') {
                    sortOrder = -1;
                    sortField = '_id'
                } else {
                    sortOrder = -1;
                    sortField = '_id'
                }
                sortOperator["$sort"][sortField] = sortOrder;
            } else {
                sortOperator["$sort"]['_id'] = -1;
            }

            const aggregateData = AdminUser.aggregate([
                {
                    "$lookup": {
                        "from": "roles",
                        "localField": "role",
                        "foreignField": "_id",
                        "as": "role_data"
                    },
                },
                { $unwind: "$role_data" },
                {
                    $addFields: {
                        full_name: { $concat: [ "$first_name", " ", "$last_name" ] } 
                    }
                },
                { $match: conditions },
                sortOperator
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await AdminUser.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

}

module.exports = new AdminUserRepository;