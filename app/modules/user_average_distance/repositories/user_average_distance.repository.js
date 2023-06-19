const mongoose = require('mongoose');
const UserDistanceData = require('user_average_distance/models/user_average_distance.model');
const _ = require('underscore');

class UserDistanceRepository {
    constructor() { 
        this.limit = 10;
    }

    async getById(id){
        try {
            let result = await UserDistanceData.findById(id).exec();
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
            return await UserDistanceData.findOne(params).exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByField(params) {
        try {
            return await UserDistanceData.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async calculateCompletedFairwaysNGIR(params){
        try {
            let aggregate = await UserDistanceData.aggregate([
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
            let aggregate = await UserDistanceData.aggregate([
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
            let aggregate = await UserDistanceData.aggregate([
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
            let aggregate = await UserDistanceData.aggregate([

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
            let aggregate = await UserDistanceData.aggregate([
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
            let aggregate = await UserDistanceData.aggregate([
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
            return await UserDistanceData.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async clearById(holeId, shotId) {
        try {

            return await UserDistanceData.updateOne({_id: holeId, allShots: {"$elemMatch" : {"_id": mongoose.Types.ObjectId(shotId)}}},
            {"$set": { "allShots.$.distance": 0}} 
            )
        } catch (error) {
            return error;
        }
    }

    async calculateMaxDistance(params){
        try {
            let aggregate = await UserDistanceData.aggregate([
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
            return await UserDistanceData.findOneAndUpdate(condition, { 
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
            let shotDelete = await UserDistanceData.updateOne(field, data);
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
            let result = await UserDistanceData.create(data);
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
            await UserDistanceData.findById(id).lean().exec();
            return await UserDistanceData.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async bulkDelete (params) {
        try {
            await UserDistanceData.deleteMany(params);
            return true;
        } catch (e) {
            return e;
        }
    }

    async getMaxAvgClubDistance(params) {
        try {
            return await UserDistanceData.find(params).sort({'average_distance': -1}).populate("clubId");
            
        } catch (error) {
            return error;
        }
    }

}

module.exports = new UserDistanceRepository;