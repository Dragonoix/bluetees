const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RolePermissionSchema = new Schema({
  role_id: { type: Schema.Types.ObjectId, ref: 'Role' ,index: true},
  permission_id: [{ type: Schema.Types.ObjectId, ref: 'admin_menu'}],
  isDeleted: {type: Boolean,default: false,enum: [true, false]},
},{ timestamps: true, versionKey: false });;

module.exports = mongoose.model('RolePermission', RolePermissionSchema);