const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];
// define the schema for our product
const faqSchema = mongoose.Schema({
    question: {type: String, default: '' },
    answer: {type: String, default: '' },
    image: {type: String, default: '' },
    videoLink: {type: String, default: '' },
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    status: {type: String,default: "Active",enum: status},
    shortcode: { type: String, default: 'enUS' },
    translate : [
        {
            shortcode: { type: String, default: '' },
            question: {type: String, default: ""},
            answer: {type: String, default: ""},
        }
    ]
},{ timestamps: true, versionKey: false });

// For pagination
faqSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('faq', faqSchema);