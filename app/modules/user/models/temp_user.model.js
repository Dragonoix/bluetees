const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const status = ["Active", "Inactive"];

const tempUserSchema = mongoose.Schema({
    userId : { type: Schema.Types.ObjectId, ref: 'User', default: null},
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    email: { type: String, default: '' },
    country: { type: String, default: '' },
    language: { type: String, default: '' },
    country_code: { type: String, default: ''},
    phone: { type: String, default: ''}, 
    otp_code: { type: String, default: ''},
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    status: {type: String,default: "Active",enum: status},
},{ timestamps: true, versionKey: false });




// For pagination
tempUserSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('tempUser', tempUserSchema);