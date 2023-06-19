const { time } = require('cron');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const userGolfRoundSchema = mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null,index: true },
    courseId: { type: String, default: '' },
    courseName: { type: String, default: '' },
    courseCity: { type: String, default: '' },
    courseState: { type: String, default: '' },
    courseCountry: { type: String, default: null },
    courseLatitude: { type: String, default: '' },
    courseLongitude: { type: String, default: '' },
    layoutTotalHoles: { type: Number, default: 0},
    roundType: { type: String, default: ''},
    totalHoles: { type: Number, default: 0 },
    totalHolesPlayed: { type: Number, default: 0 },
    teeBox: { type: String, default: ''},
    teeBoxOrder: { type: Number, default: 0},
    teeBoxLatitude: { type: String, default: '' },
    teeBoxLongitude: { type: String, default: '' },
    totalTime: { type: Number, default: 0 },
    totalPar: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    totalStrokes: { type: Number, default: 0 },
    totalPutts: { type: Number, default: 0 },
    approach_position_long_percentage: { type: Number, default: 0 },
    approach_position_right_percentage: { type: Number, default: 0 },
    approach_position_short_percentage: { type: Number, default: 0 },
    approach_position_left_percentage: { type: Number, default: 0 },
    approach_position_green_percentage: { type: Number, default: 0 },
    total_ace: { type: Number, default: 0 },
    total_albatross: { type: Number, default: 0 },
    total_eagle: { type: Number, default: 0 },
    total_birdie: { type: Number, default: 0 },
    total_par: { type: Number, default: 0 },
    total_bogey: { type: Number, default: 0 },
    total_double_bogey: { type: Number, default: 0 },
    total_triple_bogey: { type: Number, default: 0 },
    total_over: { type: Number, default: 0 },
    total_fairwayLeft: { type: Number, default: 0 },
    total_fairwayRight: { type: Number, default: 0 },
    total_fairwayCenter: { type: Number, default: 0 },
    end_time: { type: String, default: ''},
    finishScorecard: {type: Boolean,default: false,enum: [true, false]},
    isRoundComplete: {type: Boolean,default: false,enum: [true, false]},
    isRoundSave: {type: Boolean,default: false,enum: [true, false]},
    isDeleted: { type: Boolean, default: false, enum: [true, false] },
},{ timestamps: true, versionKey: false });

// For pagination
userGolfRoundSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('User_Golf_Round', userGolfRoundSchema);
