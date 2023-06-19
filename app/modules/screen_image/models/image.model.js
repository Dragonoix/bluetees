const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];

// define the Image schema for our user model
const imageSchema = mongoose.Schema({
    image: {type: String, default: ""},
    isDeleted: {type: Boolean, default: false, enum: [true, false]},
    status: {type: String, default: "Active", enum: status},
},{ timestamps: true, versionKey: false });


// For pagination
imageSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('image', imageSchema);