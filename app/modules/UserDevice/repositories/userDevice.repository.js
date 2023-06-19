const UserDevice = require('UserDevice/models/userDevice.model');
const mongoose = require('mongoose');
const _ = require('underscore');

class UserDeviceRepository {
    constructor() {
        this.limit = 10;
    }
    async getAll(req) {
        try {
            let userId = req.body.userId;
            let conditions = {};
            let and_clauses = [{ "isDeleted": false, userId: mongoose.Types.ObjectId(userId) }];
            const currentPage = req.body.currentPage || 1;
            conditions['$and'] = and_clauses;

            const aggregateData = UserDevice.aggregate([
                {
                    "$lookup": {
                        "from": "products",
                        "localField": "productId",
                        "foreignField": "_id",
                        "as": "product"
                    },
                },
                { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
                { $match: conditions },
                { $sort: { _id: -1 } }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await UserDevice.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getDeviceCountByParam() {
        try {

            let device = await UserDevice.aggregate([
                {
                    $match: {
                        isDeleted: false,
                        status: "Active"
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
                { $unwind: { path: '$userData', preserveNullAndEmptyArrays: false } }
            ]);
            // console.log(device);

            if (device.length > 0) {
                return device.length;
            } else {
                return 0;
            }


        } catch (e) {
            return e;
        }
    }

    async getAllUserDevice(req) {
        try {
            let userId = req.user._id;
            let conditions = {};
            let and_clauses = [{ "isDeleted": false, userId: mongoose.Types.ObjectId(userId) }];
            const currentPage = req.body.currentPage || 1;
            conditions['$and'] = and_clauses;

            const aggregateData = UserDevice.aggregate([
                {
                    "$lookup": {
                        "from": "products",
                        "localField": "productId",
                        "foreignField": "_id",
                        "as": "product"
                    },
                },
                { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
                { $match: conditions },
                { $sort: { _id: -1 } }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await UserDevice.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getAllUserDeviceOth(params) {
        try {
            var conditions = {};
            var and_clauses = [];

            and_clauses.push({
                isDeleted: false
            });
            and_clauses.push(params);

            conditions['$and'] = and_clauses;
            let aggregateData = await UserDevice.aggregate([{
                "$lookup": {
                    "from": "products",
                    "localField": "productId",
                    "foreignField": "_id",
                    "as": "product_data"
                },
            },
            { $unwind: { path: '$product_data', preserveNullAndEmptyArrays: true } },
            {
                $match: conditions
            },
            ]);
            return aggregateData;
        } catch (e) {
            throw (e);
        }
    }


    async getDetails(params) {
        try {
            var conditions = {};
            var and_clauses = [];

            and_clauses.push({
                isDeleted: false
            });
            and_clauses.push(params);

            conditions['$and'] = and_clauses;
            let aggregateData = await UserDevice.aggregate([{
                "$lookup": {
                    "from": "products",
                    "localField": "productId",
                    "foreignField": "_id",
                    "as": "product_data"
                },
            },
            { $unwind: { path: '$product_data', preserveNullAndEmptyArrays: true } },
            {
                $match: conditions
            },
            ]);
            return aggregateData.length > 0 ? aggregateData[0] : aggregateData;
        } catch (e) {
            throw (e);
        }
    }

    async getById(id) {
        try {
            let result = await UserDevice.findById(id).exec();
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
            return await UserDevice.findOne(params).exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByField(params) {
        try {
            return await UserDevice.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByFieldDeviceWithDetails(params) {
        try {
            return await UserDevice.find(params).populate("purchaseId").populate("socialMediaId").populate("productId");
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await UserDevice.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateByField(data, query) {
        try {
            let result = await UserDevice.findOneAndUpdate(query, data, { new: true });
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            console.log(e);
            return e;
        }
    }

    async save(data) {
        try {
            let result = await UserDevice.create(data);
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
            await UserDevice.findById(id).lean().exec();
            return await UserDevice.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async deviceDelete(id) {
        try {
            let result = await UserDevice.findById(id);
            if (result) {
                let resultDelete = await UserDevice.remove({ _id: id }).exec();
                if (!resultDelete) {
                    return null;
                }
                return resultDelete;
            }
        } catch (e) {
            throw e;
        }
    }


    async updateCount(id) {
        try {
            return await UserDevice.findOneAndUpdate({ userId: id }, { $inc: { "isWarranty": 1 } })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async getUserActivitySevenDays() {
        try {
            var today = new Date();
            today.setUTCHours(0, 0, 0);

            today.setDate(today.getDate() - 6);

            var dateArray = getDates(today, new Date());
            let aggregate = await UserDevice.aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isRegisterComplete: true,
                        createdAt: { $gte: today }
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

    async getUserActivityThirtyDays() {
        try {
            var today = new Date();
            today.setUTCHours(0, 0, 0);

            today.setDate(today.getDate() - 29);

            var dateArray = getDates(today, new Date());

            let aggregate = await UserDevice.aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isRegisterComplete: true,
                        createdAt: { $gt: today }
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

    async getUserAndDeviceMonthly(start, end) {
        try {
            let aggregate = await UserDevice.aggregate([
                {
                    $match: {
                        isDeleted: false,
                        isRegisterComplete: true,
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
    }

    async updateAllByField(data, query) {
        try {
            let result = await UserDevice.updateMany(query, { $set: data });
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            console.log(e);
            return e;
        }
    }


}

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



module.exports = new UserDeviceRepository;