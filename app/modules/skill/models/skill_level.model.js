const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];

// define the Skill schema for our user model
const skillSchema = mongoose.Schema({
    skill_level: {type: String, default: ""},
    definition: {type: String, default: ""},
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    shortcode: { type: String, default: 'enUS' },
    status: {type: String, default: "Active",enum: status},
    translate : [
        {
            shortcode: { type: String, default: '' },
            skill_level: {type: String, default: ""},
            definition: {type: String, default: ""},
        }
    ]
},{ timestamps: true, versionKey: false });


// For pagination
skillSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Skill_level', skillSchema);