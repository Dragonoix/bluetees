const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
// define the schema for our golf club brand
const golfCourseImageSchema = mongoose.Schema({
    courseId: { type: String, default: '' },
    courseName: { type: String, default: '' },
    theme: { type: String, default: '' },
    image: {type: String, default: '' },
},{ timestamps: true, versionKey: false });

// For pagination
golfCourseImageSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Golf_Course_Image', golfCourseImageSchema);