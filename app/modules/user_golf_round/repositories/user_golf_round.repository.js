const UserGolfRound = require('user_golf_round/models/user_golf_round.model');
const UserGolfRoundData = require('user_golf_round_data/models/user_golf_round_data.model');
const GolfClubData = require('golf_club/models/golf_club.model');
const mongoose = require('mongoose');
const _ = require('underscore');
const moment = require('moment');

class UserGolfRoundDataRepository {
    constructor() {
        this.limit = 10;
    }
    async getAll(req) {
        try {
            let userId = req.user._id;
            let conditions = {};
            let and_clauses = [{
                userId: mongoose.Types.ObjectId(userId),
                // "isRoundComplete": true,
                "roundData.isCompleted": true
            }];
            const currentPage = req.body.currentPage || 1;
            conditions['$and'] = and_clauses;


            const aggregateData = UserGolfRound.aggregate([
                {
                    $lookup: {
                        from: "user_golf_round_datas",
                        let: { roundId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$roundId", "$$roundId"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "golf_clubs",
                                    let: { clubId: "$allShots.clubId" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $in: ["$_id", "$$clubId"] },
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                "title": 1,
                                                "short_title": 1
                                            }
                                        }
                                    ],
                                    as: 'clubData'
                                }
                            },
                            { $unwind: { path: '$clubData', preserveNullAndEmptyArrays: true } },
                            {
                                $addFields: {
                                    "allShots.club_name": "$clubData.title",
                                    "allShots.short_title": "$clubData.short_title"
                                }
                            },
                            {
                                $project: {
                                    "clubData": 0,
                                }
                            },
                        ],
                        as: 'roundData'
                    }
                },

                { $match: conditions },
                {
                    $addFields: {
                        totalScore: {
                            $cond: {
                                if: { $eq: ["$totalScore", 0] },
                                then: { $sum: "$roundData.strokes" },
                                else: "$totalScore"
                            }
                        },
                        totalStrokes: {
                            $cond: {
                                if: { $eq: ["$totalScore", 0] },
                                then: { $sum: "$roundData.strokes" },
                                else: "$totalScore"
                            }
                        },
                        totalPar: {
                            $cond: {
                                if: { $gt: [{ $size: "$roundData" }, 0] },
                                then: { $sum: "$roundData.par" },
                                else: 0
                            }
                        },
                        totalHcp: {
                            $cond: {
                                if: { $gt: [{ $size: "$roundData" }, 0] },
                                then: { $sum: "$roundData.hcp" },
                                else: 0
                            }
                        },
                        totalPutts: {
                            $cond: {
                                if: { $gt: [{ $size: "$roundData" }, 0] },
                                then: { $sum: "$roundData.putts" },
                                else: 0
                            }
                        }
                    }
                },
                { $sort: { createdAt: -1 } }
            ])
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await UserGolfRound.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }

            return result;
        } catch (error) {
            return error;
        }
    }

    async getRoundCountByParam(params) {
        try {
            let rounds = await UserGolfRound.aggregate([
                {
                    $match: {
                        isDeleted: false
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
                                            { $eq: ["$isDeleted", false] },
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
            // console.log(rounds, "rounds");
            if (rounds.length > 0) {
                return rounds.length;
            } else {
                return 0;
            }
        } catch (e) {
            return e;
        }
    }


    async getTotalParNTotalStroke(req) {
        try {
            let userId = req.user._id;
            let conditions = {};
            let and_clauses = [{
                userId: mongoose.Types.ObjectId(userId),
                "isRoundComplete": true,
                "finishScorecard": true,
                "totalStrokes": { $gt: 0 }

            }];
            const currentPage = req.body.currentPage || 1;
            conditions['$and'] = and_clauses;

            const result = await UserGolfRound.aggregate([
                {
                    $lookup: {
                        from: "user_golf_round_datas",
                        let: { roundId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$roundId", "$$roundId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "roundData"
                    }
                },
                { $match: conditions },
                {
                    $addFields: {
                        totalScore: {
                            $cond: {
                                if: { $eq: ["$totalScore", 0] },
                                then: { $sum: "$roundData.strokes" },
                                else: "$totalScore"
                            }
                        },
                        totalPar: {
                            $cond: {
                                if: { $gt: [{ $size: "$roundData" }, 0] },
                                then: { $sum: "$roundData.par" },
                                else: 0
                            }
                        },

                    }
                },
                {
                    $group: {
                        _id: null,
                        totalScore: { $sum: "$totalScore" },
                        totalPar: { $sum: "$totalPar" },
                    }
                }
                // { $sort: { createdAt: -1 } }
            ])
            // const options = {
            //     page: currentPage,
            //     limit: this.limit
            // };
            // const result = await UserGolfRound.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }


    async getLastParNStroke(req) {
        try {
            let userId = req.user._id;
            let conditions = {};
            let and_clauses = [{
                userId: mongoose.Types.ObjectId(userId),
                "isRoundComplete": true,
                totalStrokes: { $gt: 0 }
            }];
            conditions['$and'] = and_clauses;

            const result = await UserGolfRound.aggregate([
                {
                    $lookup: {
                        from: "user_golf_round_datas",
                        let: { roundId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$roundId", "$$roundId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "roundData"
                    }
                },
                { $match: conditions },
                {
                    $addFields: {
                        totalScore: {
                            $cond: {
                                if: { $eq: ["$totalScore", 0] },
                                then: { $sum: "$roundData.strokes" },
                                else: "$totalScore"
                            }
                        },
                        totalPar: {
                            $cond: {
                                if: { $gt: [{ $size: "$roundData" }, 0] },
                                then: { $sum: "$roundData.par" },
                                else: 0
                            }
                        },

                    }
                },
                {
                    $group: {
                        _id: null,
                        totalScore: { $sum: "$totalScore" },
                        totalPar: { $sum: "$totalPar" },
                    }
                }
            ])
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }
    async getDetails(params) {
        try {
            var conditions = {};
            var and_clauses = [];
            and_clauses.push(params);
            // and_clauses.push({
            //     'roundData.isCompleted' : true
            // });

            conditions['$and'] = and_clauses;

            let aggregateData = await UserGolfRound.aggregate([
                // {
                //     "$lookup": {
                //         "from": "user_golf_round_datas",
                //         "localField": "_id",
                //         "foreignField": "roundId",
                //         "as": "roundData"
                //     },

                // },

                // { $unwind: { path: '$roundData', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "user_golf_round_datas",
                        let: { roundId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$roundId", "$$roundId"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "golf_clubs",
                                    let: { clubId: "$allShots.clubId" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $in: ["$_id", "$$clubId"] },
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                "title": 1,
                                                "short_title": 1
                                            }
                                        }
                                    ],
                                    as: 'clubData'
                                }
                            },
                            { $unwind: { path: '$clubData', preserveNullAndEmptyArrays: true } },
                            {
                                $addFields: {
                                    "allShots.club_name": "$clubData.title",
                                    "allShots.short_title": "$clubData.short_title"
                                }
                            },
                            {
                                $project: {
                                    "clubData": 0,
                                }
                            },
                        ],
                        as: 'roundData'
                    }
                },
                { $unwind: { path: '$roundData', preserveNullAndEmptyArrays: true } },
                {
                    $match: conditions
                },

                {
                    $addFields: {
                        totalPar: {
                            $cond: {
                                if: { $eq: ["$roundData.par", 0] },
                                then: 0,
                                else: "$roundData.par"
                            }
                        },
                        TotalScore: {
                            $cond: {
                                if: { $eq: ["$roundData.score", 0] },
                                then: 0,
                                else: "$roundData.strokes"
                            }
                        },
                        totalStrokes: {
                            $cond: {
                                if: { $eq: ["$roundData.strokes", 0] },
                                then: 0,
                                else: "$roundData.strokes"
                            }
                        },
                        holeTotalPar: {
                            $cond: {
                                if: { $eq: ["$roundData.score", 0] },
                                then: 0,
                                else: "$roundData.par"
                            }
                        },
                        holeTotalPutts: {
                            $cond: {
                                if: { $eq: ["$roundData.score", 0] },
                                then: 0,
                                else: "$roundData.putts"
                            }
                        },
                        totalHcp: {
                            $cond: {
                                if: { $eq: ["$roundData.hcp", 0] },
                                then: 0,
                                else: "$roundData.hcp"
                            }
                        },
                        totalHoleCountFairway: {
                            $cond: {
                                if: { $eq: ["$roundData.par", 3] },
                                then: 0,
                                else: 1
                            }
                        },
                    }
                },
                {
                    $sort: {
                        'roundData.hole': 1
                    }
                },

                {
                    $group: {
                        _id: '$_id',
                        userId: { $first: '$userId' },
                        courseId: { $first: '$courseId' },
                        courseName: { $first: '$courseName' },
                        courseCity: { $first: '$courseCity' },
                        courseState: { $first: '$courseState' },
                        courseLatitude: { $first: '$courseLatitude' },
                        courseLongitude: { $first: '$courseLongitude' },
                        totalHoles: { $first: '$totalHoles' },
                        layoutTotalHoles: { $first: '$layoutTotalHoles' },
                        roundType: { $first: '$roundType' },
                        teeBox: { $first: '$teeBox' },
                        teeBoxOrder: { $first: '$teeBoxOrder' },
                        teeBoxLatitude: { $first: '$teeBoxLatitude' },
                        teeBoxLongitude: { $first: '$teeBoxLongitude' },
                        totalTime: { $first: '$totalTime' },
                        totalPutts: { $first: '$totalPutts' },
                        totalStrokes: { $sum: '$totalStrokes' },
                        finishScorecard: { $first: '$finishScorecard' },
                        isRoundComplete: { $first: '$isRoundComplete' },
                        isRoundSave: { $first: '$isRoundSave' },
                        createdAt: { $first: '$createdAt' },
                        roundData: { $push: '$roundData' },
                        holeTotalPar: { $sum: '$holeTotalPar' },
                        holeTotalPutts: { $sum: '$holeTotalPutts' },
                        totalHoleCountFairway: { $sum: '$totalHoleCountFairway' },
                        totalPar: { $sum: '$totalPar' },
                        totalHcp: { $sum: '$totalHcp' },
                        total_ace: { $first: '$total_ace' },
                        total_albatross: { $first: '$total_albatross' },
                        total_eagle: { $first: '$total_eagle' },
                        total_birdie: { $first: '$total_birdie' },
                        total_par: { $first: '$total_par' },
                        total_bogey: { $first: '$total_bogey' },
                        total_double_bogey: { $first: '$total_double_bogey' },
                        total_triple_bogey: { $first: '$total_triple_bogey' },
                        total_over: { $first: '$total_over' },
                        TotalScore: { $sum: '$TotalScore' },
                        approach_position_long_percentage: { $first: '$approach_position_long_percentage' },
                        approach_position_right_percentage: { $first: '$approach_position_right_percentage' },
                        approach_position_short_percentage: { $first: '$approach_position_short_percentage' },
                        approach_position_left_percentage: { $first: '$approach_position_left_percentage' },
                        approach_position_green_percentage: { $first: '$approach_position_green_percentage' },
                        total_fairwayLeft: { $first: '$total_fairwayLeft' },
                        total_fairwayRight: { $first: '$total_fairwayRight' },
                        total_fairwayCenter: { $first: '$total_fairwayCenter' },
                    }
                },
                {
                    $addFields: {
                        totalScore: {
                            $cond: {
                                if: { $eq: ["$totalScore", 0] },
                                then: "$holeTotalScore",
                                else: "$totalScore"
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        totalPutts: {
                            $cond: {
                                if: { $eq: ["$totalPutts", 0] },
                                then: "$holeTotalPutts",
                                else: "$totalPutts"
                            }
                        }
                    }
                },

                {
                    $sort: {
                        '_id': -1
                    }
                },

            ]);
            return aggregateData.length > 0 ? aggregateData[0] : aggregateData;
        } catch (e) {
            throw (e);
        }
    }

    async getCompletedDetails(params) {
        try {
            var conditions = {};
            var and_clauses = [];
            and_clauses.push(params);
            and_clauses.push({
                'roundData.isCompleted': true,
            });

            conditions['$and'] = and_clauses;

            let aggregateData = await UserGolfRound.aggregate([
                {
                    "$lookup": {
                        "from": "user_golf_round_datas",
                        "localField": "_id",
                        "foreignField": "roundId",
                        "as": "roundData"
                    },
                },

                { $unwind: { path: '$roundData', preserveNullAndEmptyArrays: true } },
                {
                    $match: conditions
                },

                {
                    $addFields: {
                        totalPar: {
                            $cond: {
                                if: { $eq: ["$roundData.par", 0] },
                                then: 0,
                                else: "$roundData.par"
                            }
                        },
                        TotalScore: {
                            $cond: {
                                if: { $eq: ["$roundData.score", 0] },
                                then: 0,
                                else: "$roundData.strokes"
                            }
                        },
                        totalStrokes: {
                            $cond: {
                                if: { $eq: ["$roundData.strokes", 0] },
                                then: 0,
                                else: "$roundData.strokes"
                            }
                        },
                        holeTotalPar: {
                            $cond: {
                                if: { $eq: ["$roundData.score", 0] },
                                then: 0,
                                else: "$roundData.par"
                            }
                        },
                        holeTotalPutts: {
                            $cond: {
                                if: { $eq: ["$roundData.score", 0] },
                                then: 0,
                                else: "$roundData.putts"
                            }
                        },
                        totalHcp: {
                            $cond: {
                                if: { $eq: ["$roundData.hcp", 0] },
                                then: 0,
                                else: "$roundData.hcp"
                            }
                        },
                        totalHoleCountFairway: {
                            $cond: {
                                if: { $eq: ["$roundData.par", 3] },
                                then: 0,
                                else: 1
                            }
                        },
                    }
                },
                {
                    $sort: {
                        'roundData.hole': 1
                    }
                },

                {
                    $group: {
                        _id: '$_id',
                        // _id: null,                        
                        userId: { $first: '$userId' },
                        courseId: { $first: '$courseId' },
                        courseName: { $first: '$courseName' },
                        courseCity: { $first: '$courseCity' },
                        courseState: { $first: '$courseState' },
                        courseLatitude: { $first: '$courseLatitude' },
                        courseLongitude: { $first: '$courseLongitude' },
                        totalHoles: { $first: '$totalHoles' },
                        layoutTotalHoles: { $first: '$layoutTotalHoles' },
                        roundType: { $first: '$roundType' },
                        teeBox: { $first: '$teeBox' },
                        teeBoxOrder: { $first: '$teeBoxOrder' },
                        teeBoxLatitude: { $first: '$teeBoxLatitude' },
                        teeBoxLongitude: { $first: '$teeBoxLongitude' },
                        totalTime: { $first: '$totalTime' },
                        totalPutts: { $first: '$totalPutts' },
                        totalStrokes: { $sum: '$totalStrokes' },
                        finishScorecard: { $first: '$finishScorecard' },
                        isRoundComplete: { $first: '$isRoundComplete' },
                        isRoundSave: { $first: '$isRoundSave' },
                        createdAt: { $first: '$createdAt' },
                        roundData: { $push: '$roundData' },
                        holeTotalPar: { $sum: '$holeTotalPar' },
                        holeTotalPutts: { $sum: '$holeTotalPutts' },
                        totalHoleCountFairway: { $sum: '$totalHoleCountFairway' },
                        totalPar: { $first: '$totalPar' },
                        totalHcp: { $sum: '$totalHcp' },
                        total_ace: { $first: '$total_ace' },
                        total_albatross: { $first: '$total_albatross' },
                        total_eagle: { $first: '$total_eagle' },
                        total_birdie: { $first: '$total_birdie' },
                        total_par: { $first: '$total_par' },
                        total_bogey: { $first: '$total_bogey' },
                        total_double_bogey: { $first: '$total_double_bogey' },
                        total_triple_bogey: { $first: '$total_triple_bogey' },
                        total_over: { $first: '$total_over' },
                        TotalScore: { $first: '$TotalScore' },
                        approach_position_long_percentage: { $first: '$approach_position_long_percentage' },
                        approach_position_right_percentage: { $first: '$approach_position_right_percentage' },
                        approach_position_short_percentage: { $first: '$approach_position_short_percentage' },
                        approach_position_left_percentage: { $first: '$approach_position_left_percentage' },
                        approach_position_green_percentage: { $first: '$approach_position_green_percentage' },
                        total_fairwayLeft: { $first: '$total_fairwayLeft' },
                        total_fairwayRight: { $first: '$total_fairwayRight' },
                        total_fairwayCenter: { $first: '$total_fairwayCenter' },
                    }
                },
                {
                    $group: {
                        // _id: '$_id',
                        _id: null,
                        userId: { $first: '$userId' },
                        courseId: { $first: '$courseId' },
                        courseName: { $first: '$courseName' },
                        courseCity: { $first: '$courseCity' },
                        courseState: { $first: '$courseState' },
                        courseLatitude: { $first: '$courseLatitude' },
                        courseLongitude: { $first: '$courseLongitude' },
                        totalHoles: { $first: '$totalHoles' },
                        layoutTotalHoles: { $first: '$layoutTotalHoles' },
                        roundType: { $first: '$roundType' },
                        teeBox: { $first: '$teeBox' },
                        teeBoxOrder: { $first: '$teeBoxOrder' },
                        teeBoxLatitude: { $first: '$teeBoxLatitude' },
                        teeBoxLongitude: { $first: '$teeBoxLongitude' },
                        totalTime: { $first: '$totalTime' },
                        totalPutts: { $first: '$totalPutts' },
                        totalStrokes: { $sum: '$totalStrokes' },
                        finishScorecard: { $first: '$finishScorecard' },
                        isRoundComplete: { $first: '$isRoundComplete' },
                        isRoundSave: { $first: '$isRoundSave' },
                        createdAt: { $first: '$createdAt' },
                        roundData: { $sum: '$roundData' },
                        holeTotalPar: { $sum: '$holeTotalPar' },
                        holeTotalPutts: { $sum: '$holeTotalPutts' },
                        totalHoleCountFairway: { $sum: '$totalHoleCountFairway' },
                        totalPar: { $sum: '$totalPar' },
                        totalHcp: { $sum: '$totalHcp' },
                        total_ace: { $sum: '$total_ace' },
                        total_albatross: { $sum: '$total_albatross' },
                        total_eagle: { $sum: '$total_eagle' },
                        total_birdie: { $sum: '$total_birdie' },
                        total_par: { $sum: '$total_par' },
                        total_bogey: { $sum: '$total_bogey' },
                        total_double_bogey: { $sum: '$total_double_bogey' },
                        total_triple_bogey: { $sum: '$total_triple_bogey' },
                        total_over: { $sum: '$total_over' },
                        TotalScore: { $sum: '$TotalScore' },
                        approach_position_long_percentage: { $sum: '$approach_position_long_percentage' },
                        approach_position_right_percentage: { $sum: '$approach_position_right_percentage' },
                        approach_position_short_percentage: { $sum: '$approach_position_short_percentage' },
                        approach_position_left_percentage: { $sum: '$approach_position_left_percentage' },
                        approach_position_green_percentage: { $sum: '$approach_position_green_percentage' },
                        total_fairwayLeft: { $sum: '$total_fairwayLeft' },
                        total_fairwayRight: { $sum: '$total_fairwayRight' },
                        total_fairwayCenter: { $sum: '$total_fairwayCenter' },
                    }
                },
                {
                    $addFields: {
                        totalScore: {
                            $cond: {
                                if: { $eq: ["$totalScore", 0] },
                                then: "$holeTotalScore",
                                else: "$totalScore"
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        totalPutts: {
                            $cond: {
                                if: { $eq: ["$totalPutts", 0] },
                                then: "$holeTotalPutts",
                                else: "$totalPutts"
                            }
                        }
                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                },

            ]);
            return aggregateData.length > 0 ? aggregateData : aggregateData;
        } catch (e) {
            throw (e);
        }
    }



    async getTopTenPlayerNameAndRounds() {
        try {
            let aggregateData = await UserGolfRound.aggregate([
                {
                    $match: {
                        isRoundComplete: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        let: { userId: "$userId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$userId"] },
                                            { $eq: ["$isDeleted", false] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "userData"
                    }
                },
                { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
                {
                    $match: {
                        "userData.first_name": {
                            $ne: null
                        },
                        "userData.country": {
                            $ne: null
                        }

                    }
                },
                {
                    $group: {
                        _id: "$userId",
                        first_name: { $first: "$userData.first_name" },
                        last_name: { $first: "$userData.last_name" },
                        country: { $first: "$userData.country" },
                        country_code: { $first: "$userData.country_code" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                },
                { $limit: 10 }
            ]);

            return aggregateData;
        } catch (e) {
            throw (e);
        }
    }

    async getAvgRounds(userId) {
        try {
            let conditions = {};
            let and_clauses = [{ userId: mongoose.Types.ObjectId(userId), "isRoundComplete": true, finishScorecard: true, totalHoles: 18 }];
            conditions['$and'] = and_clauses;

            let aggregateData = await UserGolfRound.aggregate([
                {
                    $match: conditions
                },
                {
                    $group: {
                        _id: null,
                        totalRounds: { $sum: 1 },
                        totalParValue: { $sum: "$finalParVal" }
                    }
                },
                {
                    $addFields: {
                        avgRound: { $divide: ["$totalParValue", "$totalRounds"] }
                    }
                }
            ]);
            return aggregateData.length > 0 ? aggregateData[0] : aggregateData;
        } catch (e) {
            throw (e);
        }
    }

    async getById(id) {
        try {
            let result = await UserGolfRound.findById(id).exec();
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
            return await UserGolfRound.findOne(params).exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByField(params) {
        try {
            return await UserGolfRound.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }
    async getByFieldWithSort(params, sortBy) {
        try {
            return await UserGolfRound.findOne(params).sort(sortBy).exec();
        } catch (error) {
            return error;
        }
    }

    async getByFieldWithSortAggregate(params) {
        try {

            let conditions = {};
            conditions['$and'] = params;

            // For sorting //
            let sortOperator = { "$sort": {} };
            sortOperator["$sort"]['createdAt'] = -1;
            const result = await UserGolfRound.aggregate([
                {
                    $addFields: {
                        roundDate: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },

                    }
                },
                { $match: conditions },
                sortOperator
            ])
            if (!result) {
                return null;
            }
            return result[0];
        } catch (error) {
            return error;
        }
    }

    async getDistinctDocument(field, params) {
        try {
            let record = await UserGolfRound.distinct(field, params);
            if (!record) {
                return null;
            }
            return record;
        } catch (e) {
            return e;
        }
    }

    async getDistinctDocumentNew(field, params) {
        try {
            let record = await UserGolfRound.distinct(field, params);
            if (!record) {
                return null;
            }
            return record;
        } catch (e) {
            return e;
        }
    }

    async getStats(params) {
        try {
            let aggregate = await UserGolfRound.aggregate([
                { $match: params },
                {
                    $addFields: {
                        roundDate: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },

                    }
                },
                {
                    $group: {
                        _id: null,
                        totalScore: {
                            $sum: { $cond: [{ $gte: ["$totalHoles", 18] }, "$totalScore", 0] }
                        },
                        totalPutts: {
                            $sum: { $cond: [{ $gte: ["$totalHoles", 18] }, "$totalPutts", 0] }
                        },
                        totalParValue: {
                            $sum: { $cond: [{ $gte: ["$totalHoles", 18] }, "$totalPar", 0] }
                        },
                        totalCompleteRound: {
                            $sum: { $cond: [{ $gte: ["$totalHoles", 18] }, 1, 0] }
                        },
                        totalGirHole: { $sum: "$gir" },
                        totalHolesValue: { $sum: "$totalHoles" },
                        totalScore: { $sum: "$totalScore" },
                        totalPutts: { $sum: "$totalPutts" },
                        totalParValue: { $sum: "$totalPar" },

                    }
                },

            ]);
            return (aggregate && aggregate.length) ? aggregate[0] : null;
        } catch (error) {
            return error;
        }
    }


    async updateById(data, id) {
        try {
            return await UserGolfRound.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }
    async holeScoreUpadte(condition, updateValue) {
        try {
            return await UserGolfRound.findOneAndUpdate(condition, {
                $set: updateValue
            }, { upsert: true, new: true, useFindAndModify: false })
                .lean().exec();
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async getHoleDetails(condition) {
        try {
            const searchQuery = { "$and": condition };
            return await UserGolfRound.aggregate([
                {
                    $lookup: {
                        from: "customer_golf_round_datas",
                        let: { roundId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$roundId", "$$roundId"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "roundData"
                    }
                },
                { $unwind: { path: "$roundData", preserveNullAndEmptyArrays: false } },
                {
                    $match: searchQuery
                },
                {
                    $group: {
                        _id: "$_id",
                        courseId: { $first: "$courseId" },
                        courseName: { $first: "$courseName" },
                        courseLatitude: { $first: '$courseLatitude' },
                        courseLongitude: { $first: '$courseLongitude' },
                        roundData: { $first: "$roundData" }

                    }
                },

            ]).exec();

        } catch (error) {
            return error;
        }
    }


    async save(data) {
        try {
            let result = await UserGolfRound.create(data);
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
            await UserGolfRound.findById(id).lean().exec();
            return await UserGolfRound.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async bulkDelete(params) {
        try {
            await UserGolfRound.deleteMany(params);
            return true;
        } catch (e) {
            return e;
        }
    }

    async getAverageClubDistance(params) {
        try {
            let aggregate = await UserGolfRound.aggregate([
                {
                    $match: {
                        userId: params.userId,
                        isRoundComplete: true
                    }
                },
                {
                    $lookup: {
                        from: "user_golf_round_datas",
                        let: { roundId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$roundId", "$$roundId"] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$isCompleted", true] }
                                        ]
                                    }
                                }
                            },
                            { $unwind: { path: '$allShots', preserveNullAndEmptyArrays: true } },
                            {
                                $group: {
                                    _id: "$allShots.clubId",
                                    avg_distance: { $avg: "$allShots.distance" }
                                }
                            }
                        ],
                        as: "holeData"
                    }
                },
                { $unwind: { path: '$holeData', preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$holeData._id",
                        distance: { $avg: "$holeData.avg_distance" }
                    }
                },

                {
                    $lookup: {
                        "from": "golf_clubs",
                        "localField": "_id",
                        "foreignField": "_id",
                        "as": "clubData"
                    }
                },
                { $unwind: { path: "$clubData", preserveNullAndEmptyArrays: false } },


            ]);

            // console.log(aggregate);
            return aggregate;
        } catch (error) {
            return error;
        }
    }

    async getMaxDistanceByClubIdNew() {
        try {
            let aggregate = await GolfClubData.aggregate([
                {
                    $sort: {
                        "short_number": 1
                    }
                },
                {
                    $lookup: {
                        "from": "user_golf_round_datas",
                        "localField": "_id",
                        "foreignField": "allShots.clubId",
                        "as": "clubdata"
                    }
                },

                //{ $unwind: "$clubdata" },
                { $unwind: { path: "$clubData", preserveNullAndEmptyArrays: true } },

                {
                    $group: {
                        _id: "$clubdata.allShots.clubId",
                        distance: { '$max': '$clubdata.allShots.distance' },
                        title: { '$first': '$title' },
                        short_title: { '$first': '$short_title' },
                        short_image: { '$first': '$short_image' }
                    }
                },


            ]);
            return aggregate;
        } catch (error) {
            return error;
        }
    }

    async getMaxDistanceByClubId(clubId) {
        try {
            let aggregate = await UserGolfRoundData.aggregate([
                { $unwind: "$allShots" },

                { $match: { "allShots.clubId": mongoose.Types.ObjectId(clubId) } },

                {
                    $group: {
                        _id: "$allShots.clubId",
                        distance: { '$max': '$allShots.distance' }

                    }
                },


            ]);
            return aggregate;
        } catch (error) {
            return error;
        }
    }

    async getByFieldCustom(id) {
        try {
            var data = await UserGolfRound.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: "user_golf_round_datas",
                        let: { roundsId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ["$roundId", "$$roundsId"]
                                            },
                                            {
                                                $eq: ["$isCompleted", false]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    "isCompleted": 1
                                }
                            }
                        ],
                        as: 'holeData'
                    }
                },
                {
                    $project: {
                        holeData: '$holeData'
                    }
                }

            ]);
            if (data.length > 0) {
                return data[0]
            } else {
                return {}
            }
        } catch (error) {
            return error;
        }
    }

    async getTopFiveRounds(params, total_rounds) {
        try {
            let aggregateData = await UserGolfRound.aggregate([
                {
                    $match: params
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
                        _id: "$courseId",
                        courseName: { $first: "$courseName" },
                        count: { $sum: 1 },
                        "courseLatitude": { $first: "$courseLatitude" },
                        "courseLongitude": { $first: "$courseLongitude" }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                },
                { $limit: 5 },
                {
                    $project: {
                        percentage: { $cond: { if: {$eq: [Number(total_rounds), 0]}, then: 0, else: { $round: [{ $divide: [{ $multiply: ['$count', 100] }, Number(total_rounds)] }] } } },
                        _id: "$courseId",
                        courseName: "$courseName",
                        count: "$count",
                        "courseLatitude": "$courseLatitude",
                        "courseLongitude": "$courseLongitude"
                    }
                },
            ]);
            // console.log(aggregateData, "hhhhh");
            return aggregateData;
        } catch (e) {
            throw (e);
        }
    }

    async getPaginateData(params, page, total_rounds) {
        try {
            const currentPage = page ? page : 1;
            const options = {
                page: currentPage,
                limit: this.limit
            };
            let aggregateData = UserGolfRound.aggregate([
                {
                    $match: params
                },
                {
                    $group: {
                        _id: "$courseId",
                        courseName: { $first: "$courseName" },
                        count: { $sum: 1 },
                        "courseLatitude": { $first: "$courseLatitude" },
                        "courseLongitude": { $first: "$courseLongitude" },
                    }
                },
                {
                    $project: {
                        percentage: { $round: [{ $divide: [{ $multiply: ['$count', 100] }, Number(total_rounds)] }] },
                        _id: "$courseId",
                        courseName: "$courseName",
                        count: "$count",
                        "courseLatitude": "$courseLatitude",
                        "courseLongitude": "$courseLongitude"
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ]);
            const result = await UserGolfRound.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (err) {
            throw err;
        }
    }

    async updateByFieldArray(params, data) {
        try {
            let user = await UserGolfRound.update(params, { $set: data });
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    }


    async getMyAllRounds(id) {
        try {
            let data = await UserGolfRound.aggregate([
                {
                    $match: {
                        userId: id,
                        isDeleted: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        roundIds: { $push: "$_id" }
                    }
                }
            ]);

            if (data.length > 0) {
                return data[0]
            } else {
                return {}
            }
        } catch (error) {
            return error;
        }
    }



}

module.exports = new UserGolfRoundDataRepository;