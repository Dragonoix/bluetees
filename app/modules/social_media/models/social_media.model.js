const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];

// define the Skill schema for our user model
const mediaSchema = mongoose.Schema({
    social_media: {type: String, default: ""},
    shortcode: { type: String, default: 'enUS' },
    translate : [
        {
            shortcode: { type: String, default: '' },
            social_media: {type: String, default: ""},
        }
    ],
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    status: {type: String, default: "Active",enum: status},
},{ timestamps: true, versionKey: false });


// For pagination
mediaSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('social_media', mediaSchema);