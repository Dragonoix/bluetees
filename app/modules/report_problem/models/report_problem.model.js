const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];

const reportProblemSchema = mongoose.Schema({
    userId : { type: Schema.Types.ObjectId, ref: 'User', default: null},
    problemId : { type: Schema.Types.ObjectId, ref: 'problem', default: null},
    problem : { type: String, default: ""},
    courseName: { type: String, default: null},
    send_to_gorgias : {type: Boolean,default: false,enum: [true, false]},
    gorgias_ticket_id : { type: Number, default: null},
    send_to_igolf : {type: Boolean,default: false,enum: [true, false]},
    igolf_ticket_id : { type: Number, default: null},
    isDeleted : { type: Boolean, enum: [true, false], default: false},
    status: {type: String,default: "Active",enum: status},
},{ timestamps: true, versionKey: false });


// For pagination
reportProblemSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('report_problem', reportProblemSchema);