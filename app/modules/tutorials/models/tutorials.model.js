const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const status = ["Active", "Inactive"];
// define the schema for our product
const TutorialSchema = mongoose.Schema({
    title: {type: String, default: '' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    youtubeVideoLink: {type: String, default: '' },
    isDeleted: {type: Boolean,default: false,enum: [true, false]},
    status: {type: String,default: "Active",enum: status},
    shortcode: { type: String, default: 'enUS' },
    translate : [
        {
            shortcode: { type: String, default: '' },
            title: {type: String, default: ""},
        }
    ]
},{ timestamps: true, versionKey: false });

// For pagination
TutorialSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Tutorials', TutorialSchema);