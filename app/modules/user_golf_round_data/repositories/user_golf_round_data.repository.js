const UserGolfRoundData = require('user_golf_round_data/models/user_golf_round_data.model');
const mongoose = require('mongoose');
const _ = require('underscore');

class UserGolfRoundDataRepository {
    constructor() { 
        this.limit = 10;
    }

    async getById(id){
        try {
            let result = await UserGolfRoundData.findById(id).exec();
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
            return await UserGolfRoundData.findOne(params).exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByField(params) {
        try {
            return await UserGolfRoundData.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async calculateCompletedFairwaysNGIR(params){
        try {
            let aggregate = await UserGolfRoundData.aggregate([
                            { $match: params },
                            {
                                $addFields: {
                                    totalFairWay: {
                                        $cond: {
                                        if: { $eq: ["$isFairwaysGiven", true] },
                                            then: 1,
                                        else: 0
                                        }
                                    }
                                }
                            },
                            {
                                $addFields: {
                                    totalGIR: {
                                        $cond: {
                                        if: { $eq: ["$isGirGiven", true] },
                                            then: 1,
                                        else: 0
                                        }
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: "$_id",
                                    totalFairWay: { '$first':  '$totalFairWay'},
                                    totalGIR: { '$first':  '$totalGIR'},

                                 }
                            },
                            {
                                $group: {
                                    _id: null,
                                    //max_distance: { '$max':  '$max_distance'},
                                    totalFairWay: { '$sum':  '$totalFairWay'},
                                    totalGIR: { '$sum':  '$totalGIR'},
                                 }
                            }
                        ]);
            return aggregate;
        }catch (error) {
            return error;
        }
    }

    async getMaxDistance(params){
        try {
            let aggregate = await UserGolfRoundData.aggregate([
                            { $match: params },
                            { $unwind: "$allShots" },
                            {
                                $group: {
                                    _id: "$allShots.clubId",
                                    max_distance: { '$max':  '$allShots.distance'},

                                 }
                            }
                        ]);
            return aggregate;
        }catch (error) {
            return error;
        }
    }

    async getMaxDistanceByRoundId(params){
        try {
            let aggregate = await UserGolfRoundData.aggregate([
                            { $match: params },
                            { $unwind: "$allShots" },
                            {
                                $group: {
                                    _id: "$roundId",
                                    max_distance: { '$max':  '$allShots.distance'},

                                 }
                            }
                        ]);
            return aggregate;
        }catch (error) {
            return error;
        }
    }

    async getMaxClubDistance(params){
        try {
            let aggregate = await UserGolfRoundData.aggregate([

                            { $match: params },
                            { $unwind: "$allShots" },

                            {
                                $group: {
                                    _id: "$allShots.clubId",
                                    max_club_distance: { '$max':  '$allShots.distance'},

                                 }
                            },
                            // {
                            //     $group: {
                            //         _id: null,
                            //         max_distance: { '$max':  '$max_distance'}
                            //      }
                            // }
                        ]);
            return aggregate;
        }catch (error) {
            return error;
        }
    }

    async calculateFairways(params){
        try {
            let aggregate = await UserGolfRoundData.aggregate([
                            { $match: params },
                           
                            {
                                $group: {
                                    _id: null,
                                    fairwayLeft: { $sum: "$fairwayLeft" },
                                    fairwayRight: { $sum: "$fairwayRight" },
                                    fairwayCenter: {$sum:"$fairwayCenter"} 

                                 }
                            }
                        ]);
            return aggregate;
        }catch (error) {
            return error;
        }
    }

    async calculateApproachPosition(params){
        try {
            let aggregate = await UserGolfRoundData.aggregate([
                            { $match: params },
                           
                            {
                                $group: {
                                    _id: null,
                                    approach_position_long: { $sum: "$approach_position_long" },
                                    approach_position_right: { $sum: "$approach_position_right" },
                                    approach_position_short: { $sum: "$approach_position_short" },
                                    approach_position_left: { $sum: "$approach_position_left" },
                                    approach_position_green: { $sum: "$approach_position_green" }

                                 }
                            }
                        ]);
            return aggregate;
        }catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await UserGolfRoundData.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async clearById(holeId, shotId) {
        try {

            return await UserGolfRoundData.updateOne({_id: holeId, allShots: {"$elemMatch" : {"_id": mongoose.Types.ObjectId(shotId)}}},
            {"$set": { "allShots.$.distance": 0}} 
            )
        } catch (error) {
            return error;
        }
    }

    async calculateMaxDistance(params){
        try {
            let aggregate = await UserGolfRoundData.aggregate([
                            { $match: params },
                           
                            {
                                $group: {
                                    _id: null,
                                    approach_position_long: { $sum: "$approach_position_long" },
                                    approach_position_right: { $sum: "$approach_position_right" },
                                    approach_position_short: { $sum: "$approach_position_short" },
                                    approach_position_left: { $sum: "$approach_position_left" },
                                    approach_position_green: { $sum: "$approach_position_green" }

                                 }
                            }
                        ]);
            return aggregate;
        }catch (error) {
            return error;
        }
    }

    async holeScoreUpdate(condition, updateValue) {
        console.log(updateValue);
        try {
            return await UserGolfRoundData.findOneAndUpdate(condition, { 
                $set : updateValue 
              },{new: true})
                .lean().exec();
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async deleteShot(field,data) {
        try {
            let shotDelete = await UserGolfRoundData.updateOne(field, data);
            if (!shotDelete) {
                return null;
            }
            return shotDelete;
        } catch (e) {
            return e;
        }
    }


    async save(data) {
        try {
            let result = await UserGolfRoundData.create(data);
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
            await UserGolfRoundData.findById(id).lean().exec();
            return await UserGolfRoundData.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async bulkDelete (params) {
        try {
            await UserGolfRoundData.deleteMany(params);
            return true;
        } catch (e) {
            return e;
        }
    }

    async getStrokesPuttsSum(params) {
        try {
            console.log(params);
            let aggregate = await UserGolfRoundData.aggregate([
                { $match: params },
               
                {
                    $group: {
                        _id: null,
                        totalScore: { $sum: "$strokes" },
                        totalStrokes: { $sum: "$strokes" },
                        totalPutts: { $sum: "$putts" },
                        totalPar: { $sum: "$par"},
                        totalGirHole: {$sum:"$isGirHole"},
                     }
                },
            ]);
            return (aggregate && aggregate.length)?aggregate[0]:null;
        } catch (error) {
            return error;
        }
    }

    async updateByFieldArray(params, data) {
        try {
            let user = await UserGolfRoundData.update(params, { $set: data });
            if (!user) {
                return null;
            }
            return user;
        } catch (e) {
            return e;
        }
    }

}

module.exports = new UserGolfRoundDataRepository;