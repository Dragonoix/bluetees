const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];
// define the schema for our product
const MenuSchema = mongoose.Schema({
    menu_name: {type: String, default: '' },
    slug: {type: String, default: '' },
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    status: {type: String,default: "Active",enum: status},
},{ timestamps: true, versionKey: false });

// For pagination
MenuSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('admin_menu', MenuSchema);