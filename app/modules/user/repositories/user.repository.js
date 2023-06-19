const mongoose = require('mongoose');
const User = require('user/models/user.model');
const TempUser = require('user/models/temp_user.model');
class userRepository {
    constructor() {
        this.limit = 10;
    }

    async fineOneWithRole(params) {
        try {
            let user = await User.findOne({
                email: params.email,
                isDeleted: false,
                isActive: true
            }).populate('role').exec();
            if (!user) {
                throw {
                    "status": 500,
                    data: null,
                    "message": 'Authentication failed. email not found.'
                }
            }

            if (!user.validPassword(params.password, user.password)) {
                throw {
                    "status": 500,
                    data: null,
                    "message": 'Authentication failed. Wrong password.'
                }
            } else {
                throw {
                    "status": 200,
                    data: user,
                    "message": ""
                }
            }
        } catch (e) {
            return e;
        }

    }
    async getUserDetails(params) {
        try {
            var conditions = {};
            var and_clauses = [];

            and_clauses.push({
                isActive: true,
                isDeleted: false
            });
            and_clauses.push(params);

            conditions['$and'] = and_clauses;
            let aggregateData = await User.aggregate([
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
                    "$lookup": {
                        "from": "skill_levels",
                        "localField": "skill_level",
                        "foreignField": "_id",
                        "as": "skill_level"
                    },
                },
                { $unwind: "$skill_level" },
                {
                    $match: conditions
                },
                {
                    $group: {
                        _id: '$_id',
                        role: { $first: '$role' },
                        skill_level: { $first: '$skill_level' },
                        first_name: { $first: '$first_name' },
                        last_name: { $first: '$last_name' },
                        name: { $first: '$name' },
                        email: { $first: '$email' },
                        phone: { $first: '$phone' },
                        profile_image: { $first: '$profile_image' },
                        gender: { $first: '$gender' },
                        location: { $first: '$location' },
                        zip: { $first: '$zip' },
                        date_of_birth: { $first: '$date_of_birth' },
                        last_login_date: { $first: '$last_login_date' },
                        deviceToken: { $first: '$deviceToken' },
                        platform: { $first: '$platform' },
                        user_role: { $first: '$user_role' }
                    }
                }

            ]).exec();
            return aggregateData.length > 0 ? aggregateData[0] : aggregateData;
        } catch (e) {
            throw (e);
        }
    }


    async getByFieldWithRole(params) {

        try {
            let user = await User.findOne(params).populate('role').exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    }


    async getById(id) {
        try {
            let user = await User.findById(id).exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    }

    async getUserProfileDetails(params) {
        try {
            var conditions = {};
            var and_clauses = [];

            and_clauses.push({
                isActive: true,
                isDeleted: false
            });
            and_clauses.push(params);

            conditions['$and'] = and_clauses;
            let aggregateData = await User.aggregate([
                {
                    $lookup: {
                        from: "roles",
                        let: { roleId: "$role" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$roleId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "role"
                    }
                },
                { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "rolepermissions",
                        let: { roleId: "$role._id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$role_id", "$$roleId"] }
                                        ]
                                    }
                                }
                            },

                            {
                                $lookup: {
                                    from: "admin_menus",
                                    let: { permisssion: "$permission_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $in: ["$_id", "$$permisssion"] }
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    as: "permission"
                                }
                            },
                            {
                                $project: {
                                    permission_id: 0
                                }
                            },
                        ],
                        as: "rolePermission"
                    }
                },
                { $unwind: { path: '$rolePermission', preserveNullAndEmptyArrays: true } },
                {
                    $match: conditions
                }

            ])
            if (!aggregateData) {
                return null;
            }
            return aggregateData;
        } catch (e) {
            return e;
        }
    }

    async getByField(params) {

        try {
            let user = await User.findOne(params).exec();
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
            let user = await User.find(params).exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    }

    async delete(id) {
        try {
            let user = await User.findById(id);
            if (user) {
                let userDelete = await User.remove({
                    _id: id
                }).exec();
                if (!userDelete) {
                    return null;
                }
                return userDelete;
            }
        } catch (e) {
            return e;
        }
    }

    async deleteByField(field, fieldValue) {
        //todo: Implement delete by field
    }

    async updateById(data, id) {
        try {
            let user = await User.findByIdAndUpdate(id, data, {
                new: true
            });

            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    }

    async updateOne(id, data) {
        try {
            let data_updated = await User.updateOne(id, data, { upsert: true })
            if (!data_updated) {
                return null;
            }
            return data_updated;
        } catch (err) {
            throw err;
        }
    }

    async updateByField(field, fieldValue) {
        try {
            let user = await User.findByIdAndUpdate(fieldValue, field, {
                new: true
            });
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    }

    async updateByFieldArray(params, data) {
        try {
            let user = await User.update(params, { $set: data });
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    }

    async save(data) {
        try {
            let user = await User.create(data);

            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    }

    async forgotPassword(params) {

        try {
            let user = await User.findOne({ email: params.email }).exec();
            if (!user) {
                throw { "status": 500, data: null, "message": 'Authentication failed. User not found.' }
            } else if (user) {
                let random_pass = Math.random().toString(36).substr(2, 9);
                let readable_pass = random_pass;
                random_pass = user.generateHash(random_pass);
                let user_details = await User.findByIdAndUpdate(user._id, { password: random_pass }).exec();
                if (!user_details) {
                    throw { "status": 500, data: null, "message": 'User not found.' }
                } else {
                    throw { "status": 200, data: readable_pass, "message": "Mail is sending to your mail id with new password" }
                }
                //return readable_pass;	
            }
        } catch (e) {
            return e;
        }
    }

    async getUserByField(data) {
        try {
            let user = await User.findOne(data).populate('role').exec();
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    }
    async getUsersByField(data) {
        try {
            let user = await User.find(data).populate('role').exec();
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    }

    async getUserCountByParam(params) {
        try {

            let user = await User.countDocuments(params);
            return user;
        } catch (e) {
            throw (e);
        }
    }

    async fineOneWithRoleDetails(params) {
        try {
            let aggregate = await User.aggregate([
                {
                    $match: {
                        email: params.email,
                        isDeleted: false,
                        isActive: true
                    }
                },
                {
                    $lookup: {
                        from: "roles",
                        let: { roleId: "$role" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$roleId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "role"
                    }
                },
                { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "rolepermissions",
                        let: { roleId: "$role._id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$role_id", "$$roleId"] }
                                        ]
                                    }
                                }
                            },

                            {
                                $lookup: {
                                    from: "admin_menus",
                                    let: { permisssion: "$permission_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $in: ["$_id", "$$permisssion"] }
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    as: "permission"
                                }
                            },
                            {
                                $project: {
                                    permission_id: 0
                                }
                            },
                        ],
                        as: "rolePermission"
                    }
                },
                { $unwind: { path: '$rolePermission', preserveNullAndEmptyArrays: true } },
            ]);

            if (aggregate.length > 0) {
                return aggregate[0]
            } else {
                return null
            }

        } catch (e) {
            return e;
        }

    }

    async getAllUserAndClubData(id, rounds) {
        try {
            return await User.aggregate([
                {
                    $match: {
                        _id: id,
                        isDeleted: false

                    }
                },
                {
                    $project: {
                        clubId: "$selected_golfclub_ids.clubId"
                    }
                },
                {
                    $lookup: {
                        from: "golf_clubs",
                        let: { uId: "$clubId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ["$_id", "$$uId"]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "user_golf_round_datas",
                                    let: { cId: "$_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        {
                                                            $in: ["$roundId", rounds]
                                                        },
                                                        {
                                                            $in: ["$$cId", "$allShots.clubId"]
                                                        },
                                                        {
                                                            $eq: ["$isDeleted", false]
                                                        }

                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            $group: {
                                                _id: "$allShots.clubId",
                                                max_distance: { '$max': '$allShots.distance' }

                                            }
                                        },
                                        {
                                            $project: {
                                                max_distance: { $arrayElemAt: ['$max_distance', 0] },

                                            }
                                        }
                                    ],
                                    as: 'golfRoundData'
                                }
                            },
                            { $unwind: { path: '$golfRoundData', preserveNullAndEmptyArrays: true } },

                        ],
                        as: 'clubs'
                    }
                },
                { $unwind: { path: '$clubs', preserveNullAndEmptyArrays: true } },

                {
                    $project: {
                        _id: '$_id',
                        clubId: "$clubs._id",
                        title: '$clubs.title',
                        short_title: '$clubs.short_title',
                        short_number: '$clubs.short_number',
                        short_image: '$clubs.short_image',
                        isSelected: '$clubs.isSelected',
                        isDeleted: '$clubs.isDeleted',
                        user_max_distance: { $cond: { if: '$clubs.golfRoundData', then: '$clubs.golfRoundData.max_distance', else: 0 } }

                    }
                }
            ])
        } catch (error) {
            return error;
        }
    }

    async getUserSevenDays() {
        try {
            var today = new Date();
            today.setUTCHours(0, 0, 0);

            today.setDate(today.getDate() - 6);

            var dateArray = getDates(today, new Date());
            let aggregate = await User.aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isProfileComplete: true,
                        createdAt: { $gte: today }
                    }
                },
                {
                    $addFields:
                    {
                        day: {
                            $dayOfYear: "$createdAt"
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%m-%d-%Y", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },

            ]);
            let data = [];
            dateArray.forEach(ele => {
                let obj = aggregate.find(o => o._id === ele);
                if (obj) {
                    var dateStr = obj._id;
                    var day = getDayName(dateStr, "en-EN");
                    data.push({
                        label: day.slice(0, 3),
                        date: obj._id,
                        count: obj.count
                    })
                } else {
                    var dateStr = ele;
                    var day = getDayName(dateStr, "en-EN");
                    data.push({
                        label: day.slice(0, 3),
                        date: ele,
                        count: 0
                    })
                }
            });
            return data;
        } catch (error) {
            return error;
        }
    }

    async getUserThirtyDays() {
        try {
            var today = new Date();
            today.setUTCHours(0, 0, 0);

            today.setDate(today.getDate() - 29);

            var dateArray = getDates(today, new Date());

            let aggregate = await User.aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isProfileComplete: true,
                        createdAt: { $gt: today }
                    }
                },
                {
                    $addFields:
                    {
                        day: {
                            $dayOfYear: "$createdAt"
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%m-%d-%Y", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },
            ]);
            let data = [];
            dateArray.forEach(ele => {
                let obj = aggregate.find(o => o._id === ele);
                if (obj) {
                    var dateStr = obj._id;
                    data.push({
                        label: dateStr.slice(0, 2) + '/' + dateStr.slice(3, 5),
                        date: dateStr,
                        count: obj.count
                    })
                } else {
                    var dateStr = ele;
                    data.push({
                        label: ele.slice(0, 2) + '/' + ele.slice(3, 5),
                        date: ele,
                        count: 0
                    })
                }
            });
            return data;
        } catch (error) {
            return error;
        }
    }

    async getUserMonthly(start, end) {
        try {
            let aggregate = await User.aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isProfileComplete: true,
                        createdAt: {
                            $gte: new Date(start),
                            $lte: new Date(end)
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },
            ]);
            return aggregate;
        } catch (error) {
            return error;
        }
    };


    async saveTemp(data) {
        try {
            let user = await TempUser.create(data);

            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    }

    async tempGetByField (params) {
        try {
            let user = await TempUser.findOne(params).exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    }

    async tempDelete(id) {
        try {
            let user = await TempUser.findById(id);
            if (user) {
                let userDelete = await TempUser.remove({
                    _id: id
                }).exec();
                if (!userDelete) {
                    return null;
                }
                return userDelete;
            }
        } catch (e) {
            return e;
        }
    }

};

function getDayName(dateStr, locale) {
    var date = new Date(dateStr);
    return date.toLocaleDateString(locale, { weekday: 'long' });
}

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

function getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        var dd = String(currentDate.getDate()).padStart(2, '0');
        var mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        var yyyy = currentDate.getFullYear();
        dateArray.push(mm + '-' + dd + '-' + yyyy);

        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}


module.exports = new userRepository;