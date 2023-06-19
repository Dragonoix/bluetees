const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];
// define the schema for our product
const productSchema = mongoose.Schema({
    productId: {type: String, default: '' },
    title: {type: String, default: '' },
    sub_title: {type: String, default: '' },
    vendor: {type: String, default: '' },
    handle: {type: String, default: '' },
    tags: {type: String, default: '' },
    slug: {type: String, default: ''},
    admin_graphql_api_id: {type: String, default: '' },
    variants: { type : Array , "default" : []},
    options: { type : Array , "default" : []},
    image: { type : Array , "default" : []},
    orderRank: { type: Number, default: 0},
    deviceName: { type: Number, default: 0},
    bluetoothDeviceName: { type : Array , "default" : []},
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    status: {type: String,default: "Active",enum: status},
},{ timestamps: true, versionKey: false });

// For pagination
productSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Product', productSchema);