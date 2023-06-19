const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];

const UserAveDistanceSchema = mongoose.Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', default: null,index: true },
    clubId: {type: Schema.Types.ObjectId, ref: "Golf_Club", default: null, index: true },
    total_distance: {type: Number, default: 0},
    max_distance: {type: Number, default: 0},
    average_distance: {type: Number, default: 0},
    status: {type: String,default: "Active",enum: status},
},{ timestamps: true, versionKey: false });


// For pagination
UserAveDistanceSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('user_ave_distance', UserAveDistanceSchema);