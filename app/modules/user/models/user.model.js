const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const platformType = ['ios', 'android', 'web'];
const genderType = ['male', 'female', 'N/A', ''];
const personalizeExpType = ["clasic_mode", "dark_mode", "light_mode"];
const deleted = [true, false];
const onOffData = ["On", "Off"];


var UserSchema = new Schema({
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    email: { type: String, default: '' },
    country_code: { type: String, default: '' },
    gorgias_id: { type: Number, default: null},
    postscript_id: { type: String, default: null},
    klaviyo_user_id: { type: String, default: null},
    phone: { type: String, default: '' },
    id_course: { type: String, default: null },
    courseName: { type: String, default: null },
    city: { type: String, default: null },
    stateShort: { type: String, default: null },
    country: { type: String, default: '' },
    language: { type: String, default: '' },
    layoutTotalHoles: { type: Number, default: 0 },
    longitude: { type: Number, default: null },
    latitude: { type: Number, default: null },
    password: { type: String, default: '' },
    newPasswordToken: { type: String, default: '' },
    role: { type: Schema.Types.ObjectId, ref: 'Role' },
    otp_code: { type: String, default: '' },
    otp_exp_time: { type: Date, default: Date.now },
    profile_image: { type: String, default: '' },
    gender: { type: String, default: '', enum: genderType },
    skill_level: { type: Schema.Types.ObjectId, ref: 'Skill_level' },
    age: { type: Number, default: 30 },
    handicap: { type: Number, default: 15 },
    driving : { type: Boolean, default: false, enum: [true, false] },
    walking : { type: Boolean, default: false, enum: [true, false] },
    // goal: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
    goal: {
        'connect_my_device': { type: Boolean, default: false, enum: [true, false] },
        'keep_my_score': { type: Boolean, default: false, enum: [true, false] },
        'map_my_distance': { type: Boolean, default: false, enum: [true, false] },
        'start_lowering_my_score': { type: Boolean, default: false, enum: [true, false] },
        'track_my_handicap': { type: Boolean, default: false, enum: [true, false] },
        'connect_with_friends': { type: Boolean, default: false, enum: [true, false] }
    },
    homeCourse: { type: String, default: '' },
    homeCourseName: { type: String, default: '' },
    personalize_experince: { type: String, default: 'clasic_mode', enum: personalizeExpType },
    customize_settings: {
        'metrics': { type: String, default: 'yards', enum: ['yards', 'meters'] },
        'active_slope': { type: Boolean, default: false, enum: [true, false] },
        'approach_assist': { type: Boolean, default: true, enum: [true, false] },
        'club_suggestion': { type: Boolean, default: false, enum: [true, false] }
    },
    selected_golfclub_ids: [
        {
            clubId: { type: Schema.Types.ObjectId, ref: "Golf_Club", default: null, index: true },
            title: {type: String, default: ''},
            short_title: {type: String, default: ''},
            distance: { type: Number, default: 0 }
        }
    ],
    faceId: { type: String, default: '' },
    androidFaceId: { type: String, default: '' },
    faceIdButton: { type: String, default: "Off", enum: onOffData },
    ghinNumber: { type: String, default: '' },
    isPhoneVerified: { type: Boolean, default: false, enum: [true, false] },
    isProfileComplete: { type: Boolean, default: false, enum: [true, false] },
    latest_news: { type: Boolean, default: false, enum: [true, false] },
    deviceToken: { type: String, default: '' },
    platform: { type: String, default: 'web', enum: platformType },
    last_login_date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false, enum: deleted },
    isActive: { type: Boolean, default: true, enum: [true, false] },
    want_newsletter: { type: Boolean, default: false, enum: [true, false] },
}, { timestamps: true, versionKey: false });

// generating a hash
UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function (password, checkPassword) {
    return bcrypt.compareSync(password, checkPassword);
    //bcrypt.compare(jsonData.password, result[0].pass
};

// For pagination
UserSchema.plugin(mongooseAggregatePaginate);

// create the model for users and expose it to our app
module.exports = mongoose.model('User', UserSchema);