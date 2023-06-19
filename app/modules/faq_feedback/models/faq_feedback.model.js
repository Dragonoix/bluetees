const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const faqFeedbackSchema = mongoose.Schema({
    faq_id: { type: Schema.Types.ObjectId, ref: 'faq' },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    feedback_type: { type: Boolean, enum: [true, false] },
    isDeleted: { type: Boolean, default: false, enum: [true, false] },
    status: { type: String, default: 'Active', enum: ["Active", "Inactive"] },
}, { timestamps: true, versionKey: false });

// For pagination
faqFeedbackSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('faq_feedback', faqFeedbackSchema);