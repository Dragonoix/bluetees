const GolfClub = require('golf_club/models/golf_club.model');
const user = require('user/models/user.model');
const { default: mongoose } = require('mongoose');
const _ = require('underscore');

class GolfClubRepository {
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

            conditions['$and'] = and_clauses;

            const aggregateData = GolfClub.aggregate([
                { $match: conditions },
                { $sort: { short_number: 1 } },
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await GolfClub.aggregatePaginate(aggregateData, options);
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
            let result = await GolfClub.findById(id).exec();
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
            return await GolfClub.findOne(params).exec();
        } catch (error) {
            return error;
        }
    }

    async getAllClubs(req) {
        try {
            let conditions = {};
            let and_clauses = [];
            const currentPage = parseInt(req.body.page) || 1;
            and_clauses.push({ "isDeleted": false });

            if (req.body.columns && req.body.columns.length) {
                let statusFilter = _.findWhere(req.body.columns, { data: 'status' });
                let clubFilter = _.findWhere(req.body.columns, { data: 'title' });

                if (statusFilter && statusFilter.search && statusFilter.search.value) {
                    and_clauses.push({
                        "status": statusFilter.search.value
                    });
                }

                if (clubFilter && clubFilter.search && clubFilter.search.value) {
                    and_clauses.push({
                        "title": clubFilter.search.value
                    });
                }
            }

            conditions['$and'] = and_clauses;

            // console.log(conditions);

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
                sortOperator["$sort"]['_id'] = 1;
            }

            let aggregate = GolfClub.aggregate([
                { $match: conditions },
                sortOperator
            ]);

            let options = {
                page: currentPage,
                limit: this.limit
            };
            let allUsers = await GolfClub.aggregatePaginate(aggregate, options);
            return allUsers;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    }

    async getAllByField(params) {
        try {
            return await GolfClub.find(params).sort({ createdAt: 1 }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async delete(id) {
        try {
            await GolfClub.findById(id).lean().exec();
            return await GolfClub.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await GolfClub.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async save(data) {
        try {
            let result = await GolfClub.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async getAllCount(params) {
        let documents = await GolfClub.countDocuments(params);
        try {
            if (!documents) {
                return 0;
            }
            return documents;

        } catch (e) {
            return e;
        }
    }

    async getGolfClubByUser(param, userId) {
        try {

            let conditions = {};
            let and_clauses = [{ "isDeleted": false }];
            conditions['$and'] = and_clauses;

            return await GolfClub.aggregate([
                { $match: conditions },
                {
                    $lookup: {
                        from: "users",
                        let: { userId: userId },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$userId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        dis: {
                            $arrayElemAt: [{
                                $filter: {
                                    input: '$userData.selected_golfclub_ids',
                                    as: 'datas',
                                    cond: { $eq: ['$$datas.clubId', '$_id'] }
                                }
                            }, 0]
                        }
                    }
                },
                {
                    $lookup: {
                        from: "user_ave_distances",
                        let: { userId: userId, clubId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$userId", "$$userId"] },
                                            { $eq: ["$clubId", "$$clubId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "clubData"
                    }
                },
                {
                    $unwind: {
                        path: "$clubData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        "_id": "$_id",
                        "title": "$title",
                        "short_title": "$short_title",
                        "short_number": "$short_number",
                        "short_image": "$short_image",
                        "isSelected": { $cond: [{ $in: ["$_id", param.selected_golf_clubs] }, true, false] },
                        "distance": {
                            $cond: {
                                if: "$dis.distance", then: "$dis.distance", else:
                                    { $cond: { if: "$clubData.average_distance", then: "$clubData.average_distance", else: 0 } }
                            }
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ])


        } catch (error) {
            return error;
        }
    }



    async getAllCustom() {
        try {
            return await GolfClub.aggregate([
                {
                    $match: {
                        "isDeleted": false
                    }
                },
                {
                    $sort: {
                        short_number: 1
                    }
                },
                {
                    $lookup: {
                        from: "user_golf_round_datas",
                        let: { uId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ["$$uId", "$allShots.clubId"]
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
                {
                    $project: {
                        _id: '$_id',
                        title: '$title',
                        short_title: '$short_title',
                        short_number: '$short_number',
                        short_image: '$short_image',
                        isSelected: '$isSelected',
                        isDeleted: '$isDeleted',
                        user_max_distance: { $cond: { if: '$golfRoundData', then: '$golfRoundData.max_distance', else: 0 } }

                    }
                }
            ])
        } catch (error) {
            return error;
        }
    }

}

module.exports = new GolfClubRepository;