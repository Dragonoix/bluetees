const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];
const locationType = ["US", "UK", "INTERNATIONAL"];

// define the Skill schema for our user model
const purchaseSchema = mongoose.Schema({
    location:{type: String, default: "US", enum: locationType},
    purchase_from: {type: String},
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    status: {type: String, default: "Active",enum: status},
    translate : [
        {
            shortcode: { type: String, default: '' },
            purchase_from: {type: String, default: ""},
        }
    ]
},{ timestamps: true, versionKey: false });


// For pagination
purchaseSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('purchase', purchaseSchema);