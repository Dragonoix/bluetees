const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];
const colorTheme = ["DARK MODE", "LIGHT MODE"];
const unitsData = ["YARDS","METERS"];
const powerMode = ["LOW","OFF"];
const Distance = ["PAST 250","ALWAYS", "NEVER"];
const onOffData = ["On","Off"];
const formatTime = [12, 24];
// define the schema for our product
const userDeviceSchema = mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    purchaseId: { type: Schema.Types.ObjectId, ref: 'purchase', default: null },
    socialMediaId: { type: Schema.Types.ObjectId, ref: 'social_media', default: null },
    email: {type: String, default: '' },
    deviceName: {type: String, default: '' },
    serialNumber: {type: String, default: '' },
    iosSerialNumber: {type: String, default: '' },
    androidSerialNumber: {type: String, default: '' },
    osVersion: {type: Number, default: 0 },
    registeredDate: {type: Date,default: Date.now},
    lastLocation: {type: String, default: '' },
    lastLatitude: {type: String, default: '' },
    lastLongitude: {type: String, default: '' },
    totalUsed : {type: Number, default: 0 },
    lostDevice: { type: Boolean, default: false, enum: [true, false] },
    basicSetting: {
        units: {type: String,default: "YARDS",enum: unitsData},
        centerDistance: {type: String,default: "PAST 250",enum: Distance},
        screenBrightness: {type: Number, default: 0 },
        theme: {type: String,default: "DARK MODE",enum: colorTheme},
        lowPowerMode: {type: String,default: "OFF",enum: powerMode},
        timeZone: {type: String, default: '' },
        wifi:{type: String,default: "On",enum: onOffData},
        bluetooth:{type: String,default: "On",enum: onOffData},
        timeFormat: {type: Number, default: 24, enum: formatTime}
    },
    notification: {
        phoneCall: {type: String,default: "On",enum: onOffData},
        textMessage: {type: String,default: "On",enum: onOffData}
    },
    pushNotification: {
        lowBattery: {type: String,default: "On",enum: onOffData},
        leftBehind: {type: String,default: "On",enum: onOffData}
    },
    isRegisterComplete: { type: Boolean, default: false, enum: [true, false] },
    isWarranty: { type: Number, default: 1 },
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    status: {type: String,default: "Active",enum: status},
},{ timestamps: true, versionKey: false });

// For pagination
userDeviceSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('User_Device', userDeviceSchema);