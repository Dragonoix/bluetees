const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const status = ['Active', 'Inactive'];

const ErrorLogSchema = new Schema({

  api_url: { type: String, default: '' },
  log_msg: { type: Schema.Types.Mixed, default: '' },
  status: { type: String, default: 'Active', enum: status },
  isDeleted: { type: Boolean, default: false, enum: [true, false] },
}, { timestamps: true, versionKey: false });

// For pagination
ErrorLogSchema.plugin(mongooseAggregatePaginate);

// create the model for Shop and expose it to our app
module.exports = mongoose.model('Error_log', ErrorLogSchema);