const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];

const ProblemSchema = mongoose.Schema({
    parent_problemId : { type: Schema.Types.ObjectId, ref: 'problem', default: null},
    problem_name : { type: String, default: ""},
    slug : { type: String },
    isDeleted : { type: Boolean, enum: [true, false], default: false},
    has_child: { type: String, default: true, enum: [true, false]},
    status: {type: String,default: "Active",enum: status},
    send_to_gorgias : {type: Boolean,default: false,enum: [true, false]},
    send_to_igolf : {type: Boolean,default: false,enum: [true, false]},
    shortcode: { type: String, default: 'enUS' },
    translate : [
        {
            shortcode: { type: String, default: '' },
            problem_name: {type: String, default: ""},
        }
    ]
},{ timestamps: true, versionKey: false });


// For pagination
ProblemSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('problem', ProblemSchema);