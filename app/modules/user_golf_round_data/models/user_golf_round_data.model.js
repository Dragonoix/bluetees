const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const userGolfRoundDataSchema = mongoose.Schema({
    roundId: { type: Schema.Types.ObjectId, ref: "User_Golf_Round", default: null, index: true },
    hole: { type: Number, default: 0 },
    tBoxDistance:{ type: Number, default: 0 },
    par: { type: Number, default: 0 },
    hcp: { type: Number, default: 0 },
    strokes: { type: Number, default: 0 },
    putts: { type: Number, default: 0 },
    isPuttsGiven: { type: Boolean, default: false, enum: [true, false] },
    isGirHole: { type: Number, default: 0 },
    fairwayLeft: { type: Number, default: 0 },
    fairwayRight: { type: Number, default: 0 },
    fairwayCenter: { type: Number, default: 0 },
    approach_position_long: { type: Number ,default: 0 },
    approach_position_right: { type: Number ,default: 0 },
    approach_position_short: { type: Number ,default: 0 },
    approach_position_left: { type: Number ,default: 0 },
    approach_position_green: { type: Number ,default: 0 },
    user_ace: { type: Number, default: 0 },
    user_albatross: { type: Number, default: 0 },
    user_eagle: { type: Number, default: 0 },
    user_birdie: { type: Number, default: 0 },
    user_par: { type: Number, default: 0 },
    user_bogey: { type: Number, default: 0 },
    user_double_bogey: { type: Number, default: 0 },
    user_triple_bogey: { type: Number, default: 0 },
    user_over: { type: Number, default: 0 },
    allShots: [
        {
            clubId: { type: Schema.Types.ObjectId, ref: "Golf_Club", default: null, index: true },
            // club_name:{ type: String, default: "" },
            lat: { type: String, default: "" },
            long: { type: String, default: "" },
            distance: { type: Number,  default: 0  }
        }
    ],
    isFairwaysGiven: { type: Boolean, default: false, enum: [true, false] },
    isGirGiven: { type: Boolean, default: false, enum: [true, false] },
    isCompleted:{type:Boolean, default:false, enum: [true, false]},
    isDeleted: { type: Boolean, default: false, enum: [true, false] },
},{ timestamps: true, versionKey: false });

// For pagination
userGolfRoundDataSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('User_Golf_Round_Data', userGolfRoundDataSchema);