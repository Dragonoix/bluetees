const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];

// define the Goal schema for our user model
const goalSchema = mongoose.Schema({
    goal: {type: String, default: ""},
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    shortcode: { type: String, default: 'enUS' },
    status: {type: String, default: "Active",enum: status},
    translate : [
        {
            shortcode: { type: String, default: '' },
            goal: {type: String, default: ""},
        }
    ]
},{ timestamps: true, versionKey: false });


// For pagination
goalSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Goal', goalSchema);