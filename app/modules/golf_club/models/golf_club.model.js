const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];

// define the schema for our golf club brand
const golfClubSchema = mongoose.Schema({
    title: {type: String, default: '' },
    short_title : { type: String, default: ''},
    short_number : { type: Number, default: ''},
    short_image: {type: String, default: '' },
    isSelected: {type: Boolean,default: false,enum: [true, false]},
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    status: {type: String,default: "Active",enum: status},
},{ timestamps: true, versionKey: false });

// For pagination
golfClubSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Golf_Club', golfClubSchema);