const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const deleted = [true, false];
const status = ["Active", "Inactive"];

const LanguageSchema = new Schema({
    title: { type: String, default: '' },
    shortcode: { type: String, default: '' },
    icon: { type: String, default: '' },
    isDefault: { type: Boolean, default: false, enum: [true, false] },
    status: { type: String, default: "Active", enum: status },
    isDeleted: { type: Boolean, default: false, enum: deleted },
}, { timestamps: true });

// For pagination
LanguageSchema.plugin(mongooseAggregatePaginate);

// create the model for users and expose it to our app
module.exports = mongoose.model('Language', LanguageSchema);