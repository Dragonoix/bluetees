const userBlueteesRepo = require('user_golf_round/repositories/user_golf_round.repository');
const userBlueteesDataRepo = require('user_golf_round_data/repositories/user_golf_round_data.repository');
const userRepo = require('user/repositories/user.repository');
const userDistanceRepo = require('user_average_distance/repositories/user_average_distance.repository');
const golfClubRepo = require('golf_club/repositories/golf_club.repository')
const _ = require('underscore');
const config = require(appRoot + '/config/index')
const utils = require(appRoot + '/helper/utils')
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const Score = require(appRoot + '/helper/score');
const requestHandler = new RequestHandler(logger);
const axios = require('axios');
const mongoose = require('mongoose');
const { stubFalse, round } = require('lodash');
const { getById } = require('../../user_golf_round_data/repositories/user_golf_round_data.repository');
const libFunc = require(appRoot + '/helper/library');
const countryLoc = require('country-locator');

class userGolfRoundController {
    constructor() { }

    /*
    // @Method: create
    // @Description: Golf round create
    */
    async create(req, res) {
        try {
            if (!req.body.courseId) {
                requestHandler.throwError(400, 'bad request', 'Course Id is required')();
            } else if (!req.body.courseName) {
                requestHandler.throwError(400, 'bad request', 'Course Name is required')();
            } else if (!req.body.totalHoles) {
                requestHandler.throwError(400, 'bad request', 'Round Total Holes is required')();
            } else if (!_.has(req.body, 'roundData') || !_.isArray(req.body.roundData)) {
                requestHandler.throwError(400, 'bad request', 'roundData field must be an array')();
            } else {
                // await libFunc.deleteIncompleteJunkCourse({ "user_id": req.user._id });

                let roundExist = await userBlueteesRepo.getByField({ userId: req.user._id, courseId: req.body.courseId, isRoundComplete: false });
                // if (!roundExist) {
                if (_.has(req.body, "courseLatitude") && _.has(req.body, "courseLongitude") && req.body.courseLatitude != "" && req.body.courseLongitude != "" && req.body.courseLatitude != null && req.body.courseLongitude != null) {
                    // console.log(Number(req.body.courseLatitude), Number(req.body.courseLongitude));
                    let countryInfo = countryLoc.findCountryByCoordinate(Number(req.body.courseLatitude), Number(req.body.courseLongitude));
                    if (countryInfo && _.has(countryInfo, "code")) {
                        req.body.courseCountry = countryInfo.code;
                    }

                }
                req.body.userId = req.user._id;
                let saveRound = await userBlueteesRepo.save(req.body);
                if (saveRound && saveRound._id) {
                    let roundData = [];
                    _.each(req.body.roundData, (singleRound) => {
                        singleRound["roundId"] = saveRound._id;
                        roundData.push(singleRound);
                    });

                    for (let singleRound of roundData) {

                        /* calculate score */
                        let scoreData = await Score.calculateScore(singleRound["par"], singleRound["strokes"], singleRound["putts"]);

                        // For static fairway put //
                        singleRound["fairwayLeft"] = 0;
                        singleRound["fairwayRight"] = 0;
                        singleRound["fairwayCenter"] = 0;
                        await userBlueteesDataRepo.save(singleRound);
                    }
                    const result = await userBlueteesRepo.getDetails({ _id: saveRound._id });
                    result["longest_drive"] = 0;
                    if (!_.isEmpty(result)) {
                        return requestHandler.sendSuccess(res, 'Round created successfully')(result);
                    } else {
                        requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                    }
                } else {
                    requestHandler.throwError(400, 'bad request', 'Round Total Holes is required')();
                }
                // } else {
                //     const result = await userBlueteesRepo.getDetails({ _id: roundExist._id });
                //     // If the round has created perfectly //
                //     if (!_.isEmpty(result) && result.roundData.length > 0) {
                //         req.body.userId = req.user._id;
                //         let saveRoundnew = await userBlueteesRepo.save(req.body);
                //         console.log(saveRoundnew);
                //         const newresult = await userBlueteesRepo.getDetails({ _id: saveRoundnew._id });
                //         return requestHandler.sendSuccess(res, 'Round details fetched')(newresult);
                //     } else if (!_.isEmpty(result) && result.roundData.length == 0) {
                //         // Delete the existing round which is no round data//    
                //         let deleteRound = await userBlueteesRepo.delete(roundExist._id);
                //         // Insert the new round
                //         req.body.userId = req.user._id;
                //         let saveRound = await userBlueteesRepo.save(req.body);
                //         if (saveRound && saveRound._id) {
                //             let roundData = [];
                //             _.each(req.body.roundData, (singleRound) => {
                //                 singleRound["roundId"] = saveRound._id;
                //                 roundData.push(singleRound);
                //             });


                //             const result = await userBlueteesRepo.getDetails({ _id: saveRound._id });
                //             if (!_.isEmpty(result)) {
                //                 return requestHandler.sendSuccess(res, 'Round created successfully')(result);
                //             } else {
                //                 requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                //             }
                //         } else {
                //             requestHandler.throwError(400, 'bad request', 'Round Total Holes is required')();
                //         }

                //     } else {
                //         requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                //     }
                // }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /*
    // @Method: delete
    // @Description: Golf round delete
    */
    async delete(req, res) {
        try {
            if (!req.params.id) {
                requestHandler.throwError(400, 'bad request', 'Round Id is required')();
            } else {
                let roundExist = await userBlueteesRepo.getByField({ _id: mongoose.Types.ObjectId(req.params.id) });
                if (!roundExist) {
                    requestHandler.throwError(400, 'bad request', 'No such round is available')();
                } else {
                    let deleteRound = await userBlueteesRepo.delete(roundExist._id);
                    if (deleteRound) {
                        await userBlueteesDataRepo.bulkDelete({ roundId: roundExist._id });
                        return requestHandler.sendSuccess(res, 'Round deleted successfully')({ deleted: true });
                    } else {
                        requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                    }
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /*
    // @Method: multipleDelete
    // @Description: Golf round multiple delete
    */
    async multipleDelete(req, res) {
        try {
            let roundIdArr = req.body.roundId;
            if (roundIdArr.length > 0) {
                let deleteRound = await userBlueteesRepo.bulkDelete({ _id: { $in: roundIdArr.map(mongoose.Types.ObjectId) } });
                if (deleteRound) {
                    await userBlueteesDataRepo.bulkDelete({ roundId: { $in: roundIdArr.map(mongoose.Types.ObjectId) } });
                    return requestHandler.sendSuccess(res, 'Round deleted successfully')();
                } else {
                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry please provide round data')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /*
    // @Method: list
    // @Description: Golf round list
    */
    async list(req, res) {
        try {
            let result = await userBlueteesRepo.getAll(req);

            if (_.isEmpty(result.docs)) {
                requestHandler.throwError(400, 'bad request', 'Sorry round not found!')();
            } else {
                let allCompletedRounds = await userBlueteesRepo.getDistinctDocument("_id", { userId: req.user._id, isRoundComplete: true, totalStrokes: { $gt: 0 } });
                let allFinishedScoreRounds = await userBlueteesRepo.getDistinctDocument("_id", { userId: req.user._id, isRoundComplete: true, finishScorecard: true, totalStrokes: { $gt: 0 } });

                let stats = {
                    avgScore: 0,
                    totalRounds: 0,
                    bestRound: 0,
                    approach_position_long_percentage: 0,
                    approach_position_right_percentage: 0,
                    approach_position_short_percentage: 0,
                    approach_position_left_percentage: 0,
                    approach_position_green_percentage: 0,
                    total_fairwayLeft: 0,
                    total_fairwayRight: 0,
                    total_fairwayCenter: 0,
                    avgRound: 0,
                    avgbestPar: 0
                };

                if (allCompletedRounds && allCompletedRounds.length) {

                    stats["totalRounds"] = allCompletedRounds.length;
                    if (allFinishedScoreRounds.length > 0) {
                        let completedStats = await userBlueteesRepo.getCompletedDetails({ _id: { $in: allFinishedScoreRounds } });


                        if (!_.isEmpty(completedStats)) {
                            stats["avgScore"] = parseInt(parseFloat(completedStats.totalScore / completedStats.totalCompleteRound).toFixed(2));
                            if (completedStats.totalPutts != 0) {
                                let getAvgRound = completedStats.totalParValue / completedStats.totalCompleteRound;
                                if (utils.isFloat(getAvgRound) && getAvgRound != 0) {
                                    stats["avgRound"] = getAvgRound.toFixed(1);
                                } else {
                                    stats["avgRound"] = parseInt(getAvgRound);
                                }
                            } else {
                                stats["avgRound"] = 0;
                            }

                            stats["approach_position_long_percentage"] = Math.round(parseFloat(completedStats[0].approach_position_long_percentage) / stats["totalRounds"]);
                            stats["approach_position_right_percentage"] = Math.round(parseFloat(completedStats[0].approach_position_right_percentage) / stats["totalRounds"]);
                            stats["approach_position_short_percentage"] = Math.round(parseFloat(completedStats[0].approach_position_short_percentage) / stats["totalRounds"]);
                            stats["approach_position_left_percentage"] = Math.round(parseFloat(completedStats[0].approach_position_left_percentage) / stats["totalRounds"]);

                            stats["approach_position_green_percentage"] = Math.round(parseFloat(completedStats[0].approach_position_green_percentage) / stats["totalRounds"]);


                            stats["total_fairwayLeft"] = Math.round(parseFloat(completedStats[0].total_fairwayLeft) / stats["totalRounds"]);
                            stats["total_fairwayRight"] = Math.round(parseFloat(completedStats[0].total_fairwayRight) / stats["totalRounds"]);

                            stats["total_fairwayCenter"] = Math.round(parseFloat(completedStats[0].total_fairwayCenter) / stats["totalRounds"]);

                        }
                    }
                    if (allCompletedRounds.length > 0) {
                        let roundCompleteStats = await userBlueteesRepo.getStats({ _id: { $in: allCompletedRounds } });
                        if (roundCompleteStats) {
                            let bestScoreData = await userBlueteesRepo.getByFieldWithSort({
                                userId: req.user._id,
                                isRoundComplete: true,
                                finishScorecard: true,
                                totalScore: { $gt: 0 }
                            }, { totalScore: 1 });

                            stats["bestRound"] = (!_.isEmpty(bestScoreData)) ? bestScoreData.totalScore : 0;

                            stats["avgScore"] = parseInt(Math.round(parseFloat(roundCompleteStats.totalScore / allCompletedRounds.length).toFixed(2)));
                            stats["avgRound"] = parseInt(roundCompleteStats.totalParValue / allCompletedRounds.length);
                        }
                    }
                }

                var parStat = await userBlueteesRepo.getTotalParNTotalStroke(req);
                if (parStat.length > 0) {
                    var avgPar = parseFloat(parStat[0].totalScore) - parseFloat(parStat[0].totalPar);
                    stats["avgbestPar"] = Math.round(avgPar / stats["totalRounds"]);
                }


                requestHandler.sendSuccess(res, 'Round history list fetched Successfully')(result.docs, { stats });
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /*
    // @Method: Summary
    // @Description: Golf Summary
    */
    async summary(req, res) {
        try {
            let rounds = []
            let myAllRounds = await userBlueteesRepo.getMyAllRounds(req.user._id);
            if (!_.isEmpty(myAllRounds)) {
                rounds = myAllRounds.roundIds
            }
            var allClubs = await userRepo.getAllUserAndClubData(req.user._id, rounds);
            let result = await userBlueteesRepo.getAll(req);
            if (_.isEmpty(result.docs)) {

                requestHandler.sendSuccess(res, 'Round Summary list fetched Successfully')(result.docs, { 'myClubDistance': [], 'allClub': allClubs });

            } else {

                let allCompletedRounds = await userBlueteesRepo.getDistinctDocument("_id", { userId: req.user._id, isRoundComplete: true, totalStrokes: { $gt: 0 } });

                let allFinishedScoreRounds = await userBlueteesRepo.getDistinctDocument("_id", { userId: req.user._id, isRoundComplete: true, finishScorecard: true, totalStrokes: { $gt: 0 } });
                let stats = {
                    bestRound: 0,
                    lastRound: 0,
                    total_ace: 0,
                    total_albatross: 0,
                    total_eagle: 0,
                    total_birdie: 0,
                    longest_drive: 0,
                    total_par: 0,
                    total_bogey: 0,
                    total_double_bogey: 0,
                    total_triple_bogey: 0,
                    total_over: 0,
                    approach_position_long_percentage: 0,
                    approach_position_right_percentage: 0,
                    approach_position_short_percentage: 0,
                    approach_position_left_percentage: 0,
                    approach_position_green_percentage: 0,
                    total_fairwayLeft: 0,
                    total_fairwayRight: 0,
                    total_fairwayCenter: 0,
                    avgBestPar: 0,
                    LastPar: 0
                };

                let allShots_arr = [];

                (result.docs).map(o => {
                    (o.roundData).filter(obj => {
                        if (obj.allShots.length > 0) {
                            allShots_arr = allShots_arr.concat(obj.allShots)
                        }
                    });
                })

                if (allShots_arr.length > 0) {
                    stats['longest_drive'] = Math.max(...allShots_arr.map(o => o.distance));
                }


                let allLongestDistance = await userBlueteesRepo.getAverageClubDistance({
                    "userId": mongoose.Types.ObjectId(req.user._id),
                });


                if (allCompletedRounds && allCompletedRounds.length) {
                    stats["totalRounds"] = allCompletedRounds.length;


                    if (allFinishedScoreRounds.length > 0) {

                        let completedStats = await userBlueteesRepo.getCompletedDetails({ _id: { $in: allFinishedScoreRounds } });
                        if (!_.isEmpty(completedStats)) {
                            stats["total_ace"] = parseInt(Math.round(completedStats[0].total_ace / stats["totalRounds"]));
                            stats["total_albatross"] = parseInt(Math.round(completedStats[0].total_albatross / stats["totalRounds"]));
                            stats["total_eagle"] = parseInt(Math.round(completedStats[0].total_eagle / stats["totalRounds"]));
                            stats["total_birdie"] = parseInt(Math.round(completedStats[0].total_birdie / stats["totalRounds"]));
                            stats["total_par"] = parseInt(Math.round(completedStats[0].total_par / stats["totalRounds"]));
                            stats["total_bogey"] = parseInt(Math.round(completedStats[0].total_bogey / stats["totalRounds"]));
                            stats["total_double_bogey"] = parseInt(Math.round(completedStats[0].total_double_bogey / stats["totalRounds"]));
                            stats["total_triple_bogey"] = parseInt(Math.round(completedStats[0].total_triple_bogey / stats["totalRounds"]));
                            stats["total_over"] = parseInt(Math.round(completedStats[0].total_over / stats["totalRounds"]));

                            stats["approach_position_long_percentage"] = Math.round(parseFloat(completedStats[0].approach_position_long_percentage) / stats["totalRounds"]);
                            stats["approach_position_right_percentage"] = Math.round(parseFloat(completedStats[0].approach_position_right_percentage) / stats["totalRounds"])
                            stats["approach_position_short_percentage"] = Math.round(parseFloat(completedStats[0].approach_position_short_percentage) / stats["totalRounds"])
                            stats["approach_position_left_percentage"] = Math.round(parseFloat(completedStats[0].approach_position_left_percentage) / stats["totalRounds"])
                            stats["approach_position_green_percentage"] = Math.round(parseFloat(completedStats[0].approach_position_green_percentage) / stats["totalRounds"]);

                            stats["total_fairwayLeft"] = Math.round(parseFloat(completedStats[0].total_fairwayLeft) / stats["totalRounds"]);
                            stats["total_fairwayRight"] = Math.round(parseFloat(completedStats[0].total_fairwayRight) / stats["totalRounds"]);
                            stats["total_fairwayCenter"] = Math.round(parseFloat(completedStats[0].total_fairwayCenter) / stats["totalRounds"]);

                        }
                    }

                    if (allCompletedRounds.length > 0) {
                        let roundCompleteStats = await userBlueteesRepo.getStats({ _id: { $in: allCompletedRounds } });

                        if (roundCompleteStats) {
                            let bestScoreData = await userBlueteesRepo.getByFieldWithSort({
                                userId: req.user._id,
                                isRoundComplete: true,
                                finishScorecard: true,
                                totalScore: { $gt: 0 }
                            }, { totalScore: 1 });
                            if (!_.isEmpty(bestScoreData)) {
                                stats["bestRound"] = (!_.isEmpty(bestScoreData)) ? bestScoreData.totalScore : 0;
                                stats["avgBestPar"] = parseInt(bestScoreData.totalScore) - parseInt(bestScoreData.totalPar)
                                stats["bestRoundHole"] = parseInt(bestScoreData.totalHoles)
                            }

                        }
                    }
                }
                var lastparStat = await userBlueteesRepo.getByFieldWithSort({
                    'userId': req.user._id,
                    'isRoundComplete': true,
                    'finishScorecard': true,
                    'totalScore': { $gt: 0 }
                }, { "createdAt": -1 });
                if (!_.isEmpty(lastparStat)) {
                    stats["lastRound"] = lastparStat.totalScore;
                    stats["LastPar"] = parseInt(lastparStat.totalScore - lastparStat.totalPar);
                    stats["lastRoundHole"] = parseInt(lastparStat.totalHoles);
                }
                requestHandler.sendSuccess(res, 'Round Summary list fetched Successfully')(result.docs, { stats, 'myClubDistance': allLongestDistance, 'allClub': allClubs });
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /*
    // @Method: topFiveRounds
    // @Description: Golf round top five
    */
    async topFiveRounds(req, res) {
        try {
            let result = await userBlueteesRepo.getTopFiveRounds(req);
            if (_.isEmpty(result)) {
                requestHandler.throwError(400, 'bad request', 'Sorry round not found!')();
            } else {
                requestHandler.sendSuccess(res, 'Top five Round history list fetched Successfully')(result);
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: details
    // @Description: Golf round details
    */
    async details(req, res) {
        try {
            const roundId = req.params.id;
            const result = await userBlueteesRepo.getDetails({ _id: mongoose.Types.ObjectId(roundId) })
            if (!_.isEmpty(result) && result._id) {
                // Dynamic Longest Drive //
                // var condition = {
                //     'roundId': roundId,
                //     'isRoundComplete': true
                // }
                // const completedHolesNo = await userBlueteesDataRepo.calculateCompletedFairwaysNGIR(condition);
                let scoringSymbol = 'not_score';
                let parValue = 0;
                let scoreValue = 0;
                _.each(result.roundData, (singleRound) => {
                    parValue = parseInt(singleRound.par);
                    scoreValue = parseInt(singleRound.score);
                    if (scoreValue > 0) {
                        if (scoreValue == 1) {
                            scoringSymbol = "ace"
                        } else if ((scoreValue + 3) == parValue) {
                            scoringSymbol = "albatross"
                        } else if ((scoreValue + 2) == parValue) {
                            scoringSymbol = "eagle"
                        } else if ((scoreValue + 1) == parValue) {
                            scoringSymbol = "birdie"
                        } else if (scoreValue == parValue) {
                            scoringSymbol = "par"
                        } else if ((parValue - 1) == scoreValue) {
                            scoringSymbol = "bogey"
                        } else if ((parValue - 2) == scoreValue) {
                            scoringSymbol = "double_bogey"
                        } else if ((parValue - 3) == scoreValue) {
                            scoringSymbol = "triple_bogey"
                        } else if ((scoreValue - parValue) > 3) {
                            scoringSymbol = "triple_bogey"
                        } else {
                            scoringSymbol = "not_score"
                        }
                    } else {
                        scoringSymbol = 'not_score';
                    }
                    singleRound["scoringSymbol"] = scoringSymbol
                });
                // Now static for development //
                result["longest_drive"] = 0;

                var maxDistance = await userBlueteesDataRepo.getMaxDistanceByRoundId({
                    'roundId': mongoose.Types.ObjectId(roundId)
                });
                if (maxDistance.length > 0) {
                    result["longest_drive"] = maxDistance[0]['max_distance'];
                }

                result["approach_position_long_percentage"] = Math.round(result["approach_position_long_percentage"]);
                result["approach_position_right_percentage"] = Math.round(result["approach_position_right_percentage"]);
                result["approach_position_short_percentage"] = Math.round(result["approach_position_short_percentage"]);
                result["approach_position_left_percentage"] = Math.round(result["approach_position_left_percentage"]);
                result["approach_position_green_percentage"] = Math.round(result["approach_position_green_percentage"]);
                result["total_fairwayLeft"] = Math.round(result["total_fairwayLeft"]);
                result["total_fairwayRight"] = Math.round(result["total_fairwayRight"]);
                result["total_fairwayCenter"] = Math.round(result["total_fairwayCenter"]);





                return requestHandler.sendSuccess(res, 'Round details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry round not found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    /* @Method: updateScore
    // @Description: Customer Golf round score update
    */
    async updateHoleScore(req, res) {
        try {
            const roundId = mongoose.Types.ObjectId(req.params.id);
            const holeId = mongoose.Types.ObjectId(req.body.holeId);
            const isRoundData = await userBlueteesRepo.getByField({ "_id": roundId });

            if (_.isEmpty(isRoundData)) {
                requestHandler.throwError(400, 'bad request', 'Sorry round not found')();
            } else {

                const hole_exist = await userBlueteesDataRepo.getByField({ 'roundId': roundId, _id: holeId });
                if (_.isEmpty(hole_exist)) {
                    requestHandler.throwError(400, 'bad request', 'Sorry hole not found')();
                } else {
                    let data = {
                        isCompleted: true,
                        isPuttsGiven: req.body.isPuttsGiven,
                        isFairwaysGiven: req.body.isFairwaysGiven,
                        isGirGiven: req.body.isGirGiven,
                        fairwayRight: req.body.fairwayRight,
                        fairwayCenter: req.body.fairwayCenter,
                        fairwayLeft: req.body.fairwayLeft,
                        approach_position_green: req.body.approach_position_green,
                        approach_position_long: req.body.approach_position_long,
                        approach_position_right: req.body.approach_position_right,
                        approach_position_short: req.body.approach_position_short,
                        approach_position_left: req.body.approach_position_left,
                    };

                    if (_.has(req.body, 'strokes')) {
                        data["strokes"] = parseInt(req.body.strokes);
                    }

                    if (_.has(req.body, 'putts')) {
                        data["putts"] = parseInt(req.body.putts);
                    }

                    var checkCurrentScore = await userBlueteesDataRepo.getById(req.body.holeId);
                    var deductableAce = 0; var deductableAlbatross = 0; var deductableEagle = 0; var deductableBirdie = 0;
                    var deductablePar = 0; var deductableBogey = 0; var deductableDbogey = 0; var deductableTbogey = 0;
                    var deductableOver = 0;

                    var scoreCal = await Score.calculateScore(hole_exist.par, req.body.strokes, req.body.putts);
                    data["par"] = hole_exist.par;
                    data["user_ace"] = scoreCal.ace;
                    data["user_albatross"] = scoreCal.albatross;
                    data["user_eagle"] = scoreCal.eagle;
                    data["user_birdie"] = scoreCal.birdie;
                    data["user_par"] = scoreCal.par;
                    data["user_bogey"] = scoreCal.bogey;
                    data["user_double_bogey"] = scoreCal.double_bogey;
                    data["user_triple_bogey"] = scoreCal.triple_bogey;
                    data["user_over"] = scoreCal.over;
                    /* Update Mother Table */

                    if (parseInt(checkCurrentScore.user_ace) > 0) {
                        deductableAce = checkCurrentScore.user_ace;
                    }

                    if (parseInt(checkCurrentScore.user_albatross) > 0) {
                        deductableAlbatross = checkCurrentScore.user_albatross;
                    }

                    if (parseInt(checkCurrentScore.user_eagle) > 0) {
                        deductableEagle = checkCurrentScore.user_eagle;
                    }
                    if (parseInt(checkCurrentScore.user_birdie) > 0) {
                        deductableBirdie = checkCurrentScore.user_birdie;
                    }

                    if (parseInt(checkCurrentScore.user_par) > 0) {
                        deductablePar = checkCurrentScore.user_par;
                    }

                    if (parseInt(checkCurrentScore.user_bogey) > 0) {
                        deductableBogey = checkCurrentScore.user_bogey;
                    }
                    if (parseInt(checkCurrentScore.user_double_bogey) > 0) {
                        deductableDbogey = checkCurrentScore.user_double_bogey;
                    }

                    if (parseInt(checkCurrentScore.user_triple_bogey) > 0) {
                        deductableTbogey = checkCurrentScore.user_triple_bogey;
                    }

                    if (parseInt(checkCurrentScore.user_over) > 0) {
                        deductableOver = checkCurrentScore.user_over;
                    }

                    isRoundData.total_ace = (isRoundData.total_ace + scoreCal.ace) - deductableAce;
                    isRoundData.total_albatross = (isRoundData.total_albatross + scoreCal.albatross) - deductableAlbatross;
                    isRoundData.total_eagle = (isRoundData.total_eagle + scoreCal.eagle) - deductableEagle;
                    isRoundData.total_birdie = (isRoundData.total_birdie + scoreCal.birdie) - deductableBirdie;
                    isRoundData.total_par = (isRoundData.total_par + scoreCal.par) - deductablePar;
                    isRoundData.total_bogey = (isRoundData.total_bogey + scoreCal.bogey) - deductableBogey;
                    isRoundData.total_double_bogey = (isRoundData.total_double_bogey + scoreCal.double_bogey) - deductableDbogey;
                    isRoundData.total_triple_bogey = (isRoundData.total_triple_bogey + scoreCal.triple_bogey) - deductableTbogey;
                    isRoundData.total_over = (isRoundData.total_over + scoreCal.over) - deductableOver;

                    // Gir Value Calculate //
                    if (_.has(req.body, 'strokes') && _.has(req.body, 'putts')) {
                        if (parseInt(req.body.strokes) > 0) {
                            let parValue = hole_exist.par;
                            let scorePuttsDiff = parseInt(req.body.strokes) - parseInt(req.body.putts);
                            data["isGirHole"] = (scorePuttsDiff <= (parseInt(parValue) - 2)) ? 1 : 0
                        }
                    }
                    const result = await userBlueteesDataRepo.updateById(data, holeId._id);
                    const updatedResult = await userBlueteesRepo.getDetails({ _id: mongoose.Types.ObjectId(roundId) });

                    // For Update GIR //

                    /* fairway calculate start */
                    var total_fairwayLeft = 0;
                    var total_fairwayRight = 0;
                    var total_fairwayCenter = 0;
                    var approach_position_long = 0;
                    var approach_position_right = 0;
                    var approach_position_short = 0;
                    var approach_position_left = 0;
                    var approach_position_green = 0;

                    var condition = {
                        'roundId': roundId,
                        'isCompleted': true
                    }

                    var completedHolesNo = await userBlueteesDataRepo.calculateCompletedFairwaysNGIR(condition);
                    var sumValuesFairways = await userBlueteesDataRepo.calculateFairways({
                        'roundId': roundId,
                        'isCompleted': true,
                        'isFairwaysGiven': true
                    });

                    if (sumValuesFairways.length > 0 && completedHolesNo.length > 0) {
                        total_fairwayLeft = Math.round((parseInt(sumValuesFairways[0]['fairwayLeft']) / completedHolesNo[0].totalFairWay) * 100);
                        total_fairwayRight = Math.round((parseInt(sumValuesFairways[0]['fairwayRight']) / completedHolesNo[0].totalFairWay) * 100);
                        total_fairwayCenter = Math.round((parseInt(sumValuesFairways[0]['fairwayCenter']) / completedHolesNo[0].totalFairWay) * 100);

                    }

                    var sumValuesGIR = await userBlueteesDataRepo.calculateApproachPosition({
                        'roundId': roundId,
                        'isCompleted': true,
                        'isGirGiven': true
                    });

                    if (sumValuesGIR.length > 0 && completedHolesNo.length > 0) {

                        approach_position_long = Math.round((parseInt(sumValuesGIR[0]['approach_position_long']) / completedHolesNo[0].totalGIR) * 100);
                        approach_position_right = Math.round((parseInt(sumValuesGIR[0]['approach_position_right']) / completedHolesNo[0].totalGIR) * 100);
                        approach_position_short = Math.round((parseInt(sumValuesGIR[0]['approach_position_short']) / completedHolesNo[0].totalGIR) * 100);
                        approach_position_left = Math.round((parseInt(sumValuesGIR[0]['approach_position_left']) / completedHolesNo[0].totalGIR) * 100);
                        approach_position_green = Math.round((parseInt(sumValuesGIR[0]['approach_position_green']) / completedHolesNo[0].totalGIR) * 100);
                    }

                    var strokePuttsSum = await userBlueteesDataRepo.getStrokesPuttsSum({
                        "roundId": mongoose.Types.ObjectId(roundId),
                    });
                    // console.log(">>>>", strokePuttsSum);
                    /* fairway calculate end */
                    const updateGir = await userBlueteesRepo.updateById({
                        'gir': updatedResult.totalGir,
                        'total_ace': isRoundData.total_ace,
                        'total_albatross': isRoundData.total_albatross,
                        'total_eagle': isRoundData.total_eagle,
                        'total_birdie': isRoundData.total_birdie,
                        'total_par': isRoundData.total_par,
                        'total_bogey': isRoundData.total_bogey,
                        'total_double_bogey': isRoundData.total_double_bogey,
                        'total_triple_bogey': isRoundData.total_triple_bogey,
                        'total_over': isRoundData.total_over,
                        'total_fairwayLeft': total_fairwayLeft,
                        'total_fairwayRight': total_fairwayRight,
                        'total_fairwayCenter': total_fairwayCenter,
                        'approach_position_long_percentage': approach_position_long,
                        'approach_position_right_percentage': approach_position_right,
                        'approach_position_short_percentage': approach_position_short,
                        'approach_position_left_percentage': approach_position_left,
                        'approach_position_green_percentage': approach_position_green,
                        totalScore: strokePuttsSum.totalScore,
                        totalStrokes: strokePuttsSum.totalStrokes,
                        totalPutts: strokePuttsSum.totalPutts,
                        totalPar: strokePuttsSum.totalPar,

                    },
                        req.params.id);

                    // Update final score final putts from my game page//
                    if (_.has(req.body, 'pageFrom')) {

                        if (req.body.pageFrom == 'my_game') {
                            const updateRoundData = { totalScore: req.body.totalScore, totalPutts: req.body.totalPutts, finalParVal: req.body.finalParVal, finishScorecard: req.body.finishScorecard }
                            const updateMyRound = await userBlueteesRepo.updateById(updateRoundData, req.params.id);
                        }

                        if (req.body.pageFrom == 'score_voice') {
                            const finishScorecard = (updatedResult.roundData.length == updatedResult.scoreInputForHole) ? true : false;
                            const updateRoundData = { totalScore: updatedResult.holeTotalScore, totalPutts: updatedResult.holeTotalPutts, finalParVal: updatedResult.holeTotalPar, finishScorecard: finishScorecard }
                            const updateMyRound = await userBlueteesRepo.updateById(updateRoundData, req.params.id);
                        }
                    }

                    if (!_.isEmpty(result) && result._id) {
                        const finalResult = await userBlueteesRepo.getDetails({ _id: mongoose.Types.ObjectId(roundId) });

                        finalResult["longest_drive"] = 0;
                        var maxDistance = await userBlueteesDataRepo.getMaxDistance({
                            "roundId": mongoose.Types.ObjectId(roundId)
                        });
                        if (maxDistance.length > 0) {
                            finalResult["longest_drive"] = maxDistance[0]['max_distance'];
                        }
                        const isRoundData = await userBlueteesRepo.getByFieldCustom(roundId);
                        if (!_.isEmpty(isRoundData) && isRoundData.holeData.length > 0) {
                            await userBlueteesRepo.updateById({ isRoundComplete: false }, roundId);

                        } else {
                            await userBlueteesRepo.updateById({ isRoundComplete: true }, roundId);
                        }

                        requestHandler.sendSuccess(res, 'Score updated successfully')(finalResult);
                    }
                    else {
                        requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                    }
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /* @Method: createAndUpdateShotPerHole
    // @Description: User Golf round shots create and update per hole
    */
    async createAndUpdateShotPerHole(req, res) {
        try {
            const roundId = mongoose.Types.ObjectId(req.params.id);
            const holeId = mongoose.Types.ObjectId(req.body.holeId);
            const isRoundData = await userBlueteesRepo.getByField({ "_id": roundId });
            if (_.isEmpty(isRoundData)) {
                requestHandler.throwError(400, 'bad request', 'Sorry round not found')();
            } else {
                const hole_exist = await userBlueteesDataRepo.getByField({ 'roundId': roundId, _id: holeId });
                if (_.isEmpty(hole_exist)) {
                    requestHandler.throwError(400, 'bad request', 'Sorry hole not found')();
                } else {
                    var resultset = await userBlueteesDataRepo.getById(holeId)

                    if (!_.isEmpty(resultset) && resultset) {
                        /** Create Shot */
                        if (_.isEmpty(resultset.allShots)) {

                            let shotObj = {
                                "clubId": req.body.clubId ? req.body.clubId : "",
                                "lat": req.body.lat ? req.body.lat : "",
                                "long": req.body.long ? req.body.long : "",
                                "distance": req.body.distance ? req.body.distance : "",
                            };

                            const result = await userBlueteesDataRepo.updateById({ $push: { allShots: shotObj } }, holeId._id);

                            if (!_.isEmpty(result) && result._id) {
                                const updatedResult = await userBlueteesRepo.getDetails({ _id: mongoose.Types.ObjectId(roundId) });

                                if (updatedResult) {

                                    updatedResult["longest_drive"] = 0;

                                    // var maxDistance = await userBlueteesDataRepo.getMaxDistance({
                                    //     'roundId': roundId
                                    // });

                                    var maxDistance = await userBlueteesDataRepo.getMaxDistanceByRoundId({
                                        'roundId': roundId
                                    });

                                    if (maxDistance.length > 0) {
                                        updatedResult['longest_drive'] = maxDistance[0]['max_distance'];
                                    }

                                    requestHandler.sendSuccess(res, 'Shot added successfully')(updatedResult);
                                } else {
                                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                                }
                            } else {
                                requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                            }
                        }
                        /** Update Shot */
                        else {
                            var result = {};
                            const distance = await userBlueteesDataRepo.getByField({ '_id': holeId })
                            if (!_.isEmpty(distance) && distance.allShots[0].distance > 0) {
                                result = await userBlueteesDataRepo.holeScoreUpdate({ '_id': holeId, 'roundId': roundId, "allShots._id": resultset.allShots[0]._id }, { "allShots.$.clubId": req.body.clubId })

                            } else {
                                result = await userBlueteesDataRepo.holeScoreUpdate({ '_id': holeId, 'roundId': roundId, "allShots._id": resultset.allShots[0]._id }, { "allShots.$.clubId": req.body.clubId, "allShots.$.distance": req.body.distance })
                            }
                            if (!_.isEmpty(result)) {
                                const updatedResult = await userBlueteesRepo.getDetails({ _id: mongoose.Types.ObjectId(roundId) });

                                updatedResult['longest_drive'] = 0;

                                var maxDistance = await userBlueteesDataRepo.getMaxDistanceByRoundId({
                                    'roundId': roundId
                                });

                                if (maxDistance.length > 0) {
                                    updatedResult['longest_drive'] = maxDistance[0]['max_distance'];
                                }

                                requestHandler.sendSuccess(res, 'Shot updated successfully')(updatedResult);
                            } else {
                                requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                            }
                        }
                    }
                    else {
                        requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                    }
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /* @Method: Clear Distance 
    // @Description: User Golf round shots distance will get cleared
    */

    async distanceClear(req, res) {
        try {
            const roundId = mongoose.Types.ObjectId(req.params.id);
            const holeId = mongoose.Types.ObjectId(req.body.holeId);
            const shotId = mongoose.Types.ObjectId(req.body.shotId);
            const isRoundData = await userBlueteesRepo.getByField({ "_id": roundId });
            if (_.isEmpty(isRoundData)) {
                requestHandler.throwError(400, 'bad request', 'Sorry round not found')();
            } else {
                const hole_exist = await userBlueteesDataRepo.getByField({ 'roundId': roundId, _id: holeId });
                if (_.isEmpty(hole_exist)) {
                    requestHandler.throwError(400, 'bad request', 'Sorry hole not found')();
                } else {
                    let resultClear = await userBlueteesDataRepo.clearById(holeId, shotId)
                    if (!_.isEmpty(resultClear)) {
                        const data = await userBlueteesRepo.getDetails({ _id: mongoose.Types.ObjectId(roundId) })
                        requestHandler.sendSuccess(res, 'Distance Cleared successfully')(data);
                    } else {
                        requestHandler.throwError(400, 'bad request', 'Sorry Shot Distance not found')();
                    }
                }

            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /* @Method: roundComplete
    // @Description: User round complete
    */
    async roundComplete(req, res) {
        try {
            const roundId = req.params.id;
            const isRoundData = await userBlueteesRepo.getByFieldCustom(roundId);
            // let start_dt = new Date(isRoundData.createdAt);
            // let end_dt = new Date(req.body.end_time)

            // let timeDiffInMin = (Math.floor((end_dt - start_dt) / 1000)) / 60;

            if (_.isEmpty(isRoundData)) {
                requestHandler.throwError(400, 'bad request', 'Sorry round not found')();
            } else {
                if (isRoundData.holeData.length > 0) {
                    req.body.isRoundComplete = false
                    // requestHandler.throwError(400, 'bad request', 'Please Complete all the round holes ')();
                } else {
                    req.body.isRoundComplete = true
                }
                req.body.isRoundSave = true;
                var strokePuttsSum = await userBlueteesDataRepo.getStrokesPuttsSum({
                    "roundId": mongoose.Types.ObjectId(roundId),
                });
                req.body.totalScore = strokePuttsSum.totalScore;
                req.body.totalStrokes = strokePuttsSum.totalScore;
                req.body.totalPutts = strokePuttsSum.totalPutts;
                req.body.totalPar = strokePuttsSum.totalPar;
                // req.body.totalTime = parseInt(timeDiffInMin)
                const result = await userBlueteesRepo.updateById(req.body, roundId);
                requestHandler.sendSuccess(res, 'Round completed successfully')(result);
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    /* @Method: Round Complete Offline
    // @Description: User round complete for Offline Score
    */
    async roundCompleteOffline(req, res) {
        try {
            const payload = [];
            const userId = req.user._id;
            const roundId = mongoose.Types.ObjectId(req.params.id);
            const isRoundData = await userBlueteesRepo.getByFieldCustom(roundId);
            if (_.isEmpty(isRoundData)) {
                requestHandler.throwError(400, 'bad request', 'Sorry round not found')();
            } else {

                if (req.body.clubData.length > 0 && req.body.isRoundComplete == true) {
                    /* calculating average distances */
                    const averages = Object.entries((req.body.clubData).reduce((acc, { clubId, total_distance }) => ({ ...acc, [clubId]: [...(acc[clubId] || []), total_distance] }), {}))
                        .map(([clubId, total_distance]) => ({ clubId, total_distance: total_distance.reduce((acc, cur) => acc + cur, 0), average_distance: parseFloat(total_distance.reduce((acc, cur) => acc + cur, 0) / total_distance.length), userId: req.user._id }));

                    /* Getting the maximum distances given by user */
                    var maxDistanceResult = [];
                    req.body.clubData.forEach((hash => a => {
                        if (!hash[a.clubId]) {
                            hash[a.clubId] = { clubId: a.clubId, total_distance: 0 };
                            maxDistanceResult.push(hash[a.clubId]);
                        }
                        hash[a.clubId].total_distance = Math.max(hash[a.clubId].total_distance, a.total_distance);
                    })(Object.create(null)));

                    for (const element of averages) {
                        const isData = await userDistanceRepo.getByField({ userId: userId, clubId: mongoose.Types.ObjectId(element.clubId) });
                        if (_.isEmpty(isData)) {
                            const SaveData = await userDistanceRepo.save({
                                "userId": userId,
                                "clubId": element.clubId,
                                "total_distance": element.total_distance,
                                "average_distance": element.average_distance,
                                "max_distance": maxDistanceResult.find(x => x.clubId === (element.clubId).toString()).total_distance
                            });
                            payload.push(SaveData);

                            var totalAvgDistance = parseFloat(element.average_distance)


                            // var selected_golfclub_ids = []

                            //     selected_golfclub_ids.push({
                            //         clubId: element.clubId,
                            //         distance: element.average_distance
                            //     });

                            // await userRepo.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { $push: { selected_golfclub_ids: selected_golfclub_ids } });

                            let get_user_details = await userRepo.getAllByField({ _id: userId })
                            let is_present = false;
                            for (let i = 0; i < get_user_details[0].selected_golfclub_ids.length; i++) {

                                if (get_user_details[0].selected_golfclub_ids[i].clubId.toString() == element.clubId.toString()) {
                                    is_present = true;
                                    break;
                                }
                            }

                            if (is_present) {
                                let update_data = await userRepo.updateByFieldArray({ _id: element.userId, 'selected_golfclub_ids.clubId': element.clubId }, { 'selected_golfclub_ids.$.distance': parseFloat(totalAvgDistance) });
                            } else {
                                var selected_golfclub_ids = []

                                selected_golfclub_ids.push({
                                    clubId: element.clubId,
                                    distance: parseFloat(totalAvgDistance / 2)
                                });
                                let save_data = await userRepo.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { $push: { selected_golfclub_ids: selected_golfclub_ids } });
                            }

                        } else {
                            const distanceInDB = isData.total_distance;
                            const maxDistanceInDB = isData.max_distance;
                            var totalDistance = (distanceInDB + parseFloat(element.total_distance));

                            let payloadMaxDistance = maxDistanceResult.find(x => x.clubId === (element.clubId).toString()).total_distance;

                            const avgDistanceDB = isData.average_distance;
                            var totalAvgDistance = (avgDistanceDB + parseFloat(element.average_distance))

                            const updatedData = await userDistanceRepo.updateById({ total_distance: parseFloat(totalDistance), average_distance: parseFloat(totalAvgDistance / 2), max_distance: maxDistanceInDB > payloadMaxDistance ? maxDistanceInDB : payloadMaxDistance }, isData._id);

                            payload.push(updatedData);

                            let get_user_details = await userRepo.getAllByField({ _id: userId })
                            let is_present = false;
                            for (let i = 0; i < get_user_details[0].selected_golfclub_ids.length; i++) {

                                if (get_user_details[0].selected_golfclub_ids[i].clubId.toString() == element.clubId.toString()) {
                                    is_present = true;
                                    break;
                                }
                            }


                            if (is_present) {
                                let update_data = await userRepo.updateByFieldArray({ _id: isData.userId, 'selected_golfclub_ids.clubId': isData.clubId }, { 'selected_golfclub_ids.$.distance': parseFloat(totalAvgDistance / 2) });
                            } else {
                                var selected_golfclub_ids = []

                                selected_golfclub_ids.push({
                                    clubId: isData.clubId,
                                    distance: parseFloat(totalAvgDistance / 2)
                                });
                                let save_data = await userRepo.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { $push: { selected_golfclub_ids: selected_golfclub_ids } });

                            }
                        }
                    }

                }
                req.body.isRoundSave = true;
                req.body.roundData.forEach(async ele => {
                    await userBlueteesDataRepo.updateById(ele, ele._id)
                })
                const result = await userBlueteesRepo.updateById(req.body, roundId);
                if (!_.isEmpty(result)) {
                    requestHandler.sendSuccess(res, 'Round completed successfully')({ result, clubData: payload });
                } else {
                    requestHandler.throwError(400, 'bad request', 'Something went wrong')();
                }
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };


    async multipleRoundCompleteOffline(req, res) {
        try {
            if (req.body.data && req.body.data.length > 0) {
                req.body.data.forEach(async ele => {
                    const payload = [];
                    const userId = req.user._id;
                    const roundId = mongoose.Types.ObjectId(ele._id);
                    const isRoundData = await userBlueteesRepo.getByFieldCustom(roundId);
                    if (_.isEmpty(isRoundData)) {
                        requestHandler.throwError(400, 'bad request', 'Sorry round not found')();
                    } else {

                        if (ele.clubData.length > 0 && ele.isRoundComplete == true) {
                            /* calculating average distances */
                            const averages = Object.entries((ele.clubData).reduce((acc, { clubId, total_distance }) => ({ ...acc, [clubId]: [...(acc[clubId] || []), total_distance] }), {}))
                                .map(([clubId, total_distance]) => ({ clubId, total_distance: total_distance.reduce((acc, cur) => acc + cur, 0), average_distance: parseFloat(total_distance.reduce((acc, cur) => acc + cur, 0) / total_distance.length), userId: req.user._id }));

                            /* Getting the maximum distances given by user */
                            var maxDistanceResult = [];
                            ele.clubData.forEach((hash => a => {
                                if (!hash[a.clubId]) {
                                    hash[a.clubId] = { clubId: a.clubId, total_distance: 0 };
                                    maxDistanceResult.push(hash[a.clubId]);
                                }
                                hash[a.clubId].total_distance = Math.max(hash[a.clubId].total_distance, a.total_distance);
                            })(Object.create(null)));

                            for (const element of averages) {
                                const isData = await userDistanceRepo.getByField({ userId: userId, clubId: mongoose.Types.ObjectId(element.clubId) });
                                if (_.isEmpty(isData)) {
                                    const SaveData = await userDistanceRepo.save({
                                        "userId": userId,
                                        "clubId": element.clubId,
                                        "total_distance": element.total_distance,
                                        "average_distance": element.average_distance,
                                        "max_distance": maxDistanceResult.find(x => x.clubId === (element.clubId).toString()).total_distance
                                    });
                                    payload.push(SaveData);

                                    var totalAvgDistance = parseFloat(element.average_distance)


                                    // var selected_golfclub_ids = []

                                    //     selected_golfclub_ids.push({
                                    //         clubId: element.clubId,
                                    //         distance: element.average_distance
                                    //     });

                                    // await userRepo.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { $push: { selected_golfclub_ids: selected_golfclub_ids } });

                                    let get_user_details = await userRepo.getAllByField({ _id: userId })
                                    let is_present = false;
                                    for (let i = 0; i < get_user_details[0].selected_golfclub_ids.length; i++) {

                                        if (get_user_details[0].selected_golfclub_ids[i].clubId.toString() == element.clubId.toString()) {
                                            is_present = true;
                                            break;
                                        }
                                    }

                                    if (is_present) {
                                        let update_data = await userRepo.updateByFieldArray({ _id: element.userId, 'selected_golfclub_ids.clubId': element.clubId }, { 'selected_golfclub_ids.$.distance': parseFloat(totalAvgDistance) });
                                    } else {
                                        var selected_golfclub_ids = []

                                        selected_golfclub_ids.push({
                                            clubId: element.clubId,
                                            distance: parseFloat(totalAvgDistance / 2)
                                        });
                                        let save_data = await userRepo.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { $push: { selected_golfclub_ids: selected_golfclub_ids } });
                                    }

                                } else {
                                    const distanceInDB = isData.total_distance;
                                    const maxDistanceInDB = isData.max_distance;
                                    var totalDistance = (distanceInDB + parseFloat(element.total_distance));

                                    let payloadMaxDistance = maxDistanceResult.find(x => x.clubId === (element.clubId).toString()).total_distance;

                                    const avgDistanceDB = isData.average_distance;
                                    var totalAvgDistance = (avgDistanceDB + parseFloat(element.average_distance))

                                    const updatedData = await userDistanceRepo.updateById({ total_distance: parseFloat(totalDistance), average_distance: parseFloat(totalAvgDistance / 2), max_distance: maxDistanceInDB > payloadMaxDistance ? maxDistanceInDB : payloadMaxDistance }, isData._id);

                                    payload.push(updatedData);

                                    let get_user_details = await userRepo.getAllByField({ _id: userId })
                                    let is_present = false;
                                    for (let i = 0; i < get_user_details[0].selected_golfclub_ids.length; i++) {

                                        if (get_user_details[0].selected_golfclub_ids[i].clubId.toString() == element.clubId.toString()) {
                                            is_present = true;
                                            break;
                                        }
                                    }


                                    if (is_present) {
                                        let update_data = await userRepo.updateByFieldArray({ _id: isData.userId, 'selected_golfclub_ids.clubId': isData.clubId }, { 'selected_golfclub_ids.$.distance': parseFloat(totalAvgDistance / 2) });
                                    } else {
                                        var selected_golfclub_ids = []

                                        selected_golfclub_ids.push({
                                            clubId: isData.clubId,
                                            distance: parseFloat(totalAvgDistance / 2)
                                        });
                                        let save_data = await userRepo.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { $push: { selected_golfclub_ids: selected_golfclub_ids } });

                                    }
                                }
                            }

                        }
                        ele.isRoundSave = true;
                        ele.roundData.forEach(async ele => {
                            await userBlueteesDataRepo.updateById(ele, ele._id)
                        })
                        const result = await userBlueteesRepo.updateById(ele, roundId);
                        if (!_.isEmpty(result)) {
                            requestHandler.sendSuccess(res, 'Round completed successfully')({ result, clubData: payload });
                        } else {
                            requestHandler.throwError(400, 'bad request', 'Something went wrong')();
                        }
                    }
                });
            } else {
                requestHandler.throwError(400, 'bad request', 'Please provide data.')();
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    /*
   // @Method: Average Distance list
   // @Description: Average distance list of a Club respect to User
   */
    async avglist(req, res) {
        try {

            const result = await userDistanceRepo.getMaxAvgClubDistance({ isDeleted: false, status: 'Active', userId: req.user._id })

            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Average Distance details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry something went wrong')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }


    /*
   // @Method: Approach Assist Distance
   // @Description: Approach Assist Distance list of a Club respect to User
   */
    async approachAssist(req, res) {
        try {

            const result = await userDistanceRepo.getAllByField({ userId: req.user._id, average_distance: { $lte: parseInt(req.body.distance) } })
            if (!_.isEmpty(result)) {
                return requestHandler.sendSuccess(res, 'Approach Assist Distance details')(result);
            } else {
                requestHandler.throwError(400, 'bad request', 'Sorry, No such distance found')();
            }

        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

}

module.exports = new userGolfRoundController();