var mongoose = require('mongoose');
var Permission = require('permission/models/permission.model');
var Role = require('role/models/role.model');
var async = require('async');
const utils = require(appRoot + '/helper/utils');
const _ = require("underscore");

var permissionRepository = {
   
    getPermissionByRole: async (role) => {
        try {
            let permResult = await Permission.aggregate([
                {
                    "$project": {
                      "permission_group": "$permission_group",
                       "displayName": "$displayName",
                       "link": "$link",
                       "slug": "$slug",
                       "description": "$description",
                       "orderNumber": "$orderNumber",
                  }
                },
                {
                    $lookup: {
                       from: "rolepermissions",
                       let: {
                          permissionId: "$_id"
                       },
                       pipeline: [
                          {
                             $match: {
                                $expr: {
                                   $and: [
                                    {
                                        "$in": [
                                          "$$permissionId",
                                          "$permissionall"
                                        ]
                                      }, 
                                      
                                      {
                                        $eq: [
                                           "$role",
                                           mongoose.Types.ObjectId(role)
                                        ]
                                     }
                                      
                                     
                                   ]
                                }
                             }
                          }
                       ],
                       as: "rolepermissionsData"
                    }
                 },
                {
                    $addFields: {
                        hasAccess: { $cond: [{ $ne: ['$rolepermissionsData', []] }, true, false] }
                    }
                },
                { $group: { _id: "$permission_group", orderNumber:{$first:"$orderNumber"} ,permission_list: { $push: "$$ROOT" }}},
                { "$sort": {orderNumber: 1}}
                
            ]);
    
           return permResult;
        } catch (err) {
            throw err;
        }
    // var aggregate = Permission.aggregate([
    //     {
    //         "$project": {
    //          "permission_group": "$permission_group",
    //            "operation": "$operation",
    //            "displayName": "$displayName",
    //            "description": "$description",
    //       }
    //     },
    //     { $group: { _id: "$permission_group", permission_list: { $push: "$$ROOT" } } },
    //     { "$sort": {_id: -1}}
    // ]).exec(function (err, permResult) {
    //    if (err) {
    //         return cb(err.message, null);
    //     } else {
    //         var _result = [];
    //         async.forEachSeries(permResult, function (perm, callbackOne) {
    //             async.forEachSeries(perm.permission_list, function (innerPerms, callbackTwo) {
    //                 var permId = innerPerms._id;
    //                 RolePermission.findOne({$and:[{'role':role},{'permissionall': {$in: [permId]}}]}, function (err, roleInfo) {
    //                    innerPerms.is_access = (roleInfo != null)?true:false;
    //                     callbackTwo();
    //                 });
    //             }, function (err) {
    //                 if (err) return cb(err.message, null);
    //                 else {
    //                     _result.push(perm);
    //                     callbackOne();
    //                 }
    //             });
    //         }, function (err) {
    //             if (err) return cb(err.message, null);
    //             else {
    //                 return cb(null, _result);
    //             }
    //         });
    //     }  
    // })    
   },

    updateRolePermissionById: async (field,data) => {
        try {
            let update = await Permission.findOneAndUpdate(field, data,{upsert: true, 'new': true});
            if(!update) {
                return null;
            }
            return update;
        } catch (err) {
            throw err;
        }
    },

    getAll: async () => {
        try {
            let result = await Permission.find({ status: 'Active'}).sort({permission_group:-1}).exec();
            if(!result) {
                return null;
            }
            return result;
        } catch(err) {
            throw err;
        }
    },

    getRolePermissionByField: async (params) => {
        try {
            let result = await RolePermission.findOne(params);
            if (!result) {
                return null;
            }
            return result;
        } catch (err) {
            throw err;
        }
    },
    getById: async (id) => {
        try {
            let result = await Permission.findById(id);
            if (!result) {
                return null;
            }
            return result;
        } catch (err) {
            throw err;
        }
    },

    getByField: async (params) => {
        try {
            let result = await Permission.findOne(params);
            if (!result) {
                return null;
            }
            return result;
        } catch (err) {
            throw err;
        }
    },

    delete: async (id) => {
        try {
            let result = await Permission.findById(id);
            if(!result) {
                return null;
            }
            return result;
        } catch (err) {
            throw err;
        }
    },

    deleteByField: async (field, fieldValue) => {
        //todo: Implement delete by field
    },

    updateById: async (data, id) => {
        try {
            let result = await Permission.findByIdAndUpdate(id, data);
            if (!result) {
                return null;
            }
            return result;
        } catch (err) {
            throw err;
        }
    },

    updateByField: async (field, fieldValue, data) => {
        //todo: update by field
    },

    async save(data) {
        try {
            let result = await Permission.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    },
    
    saveRolePermission: async (obj) => {
        try {
            let newRolePermission = new RolePermission(obj);
            let _save = await newRolePermission.save();    
            if (!_save) {
                return null;
            }
            return _save;
        } catch (err) {
            throw err;
        }
    }
};



module.exports = permissionRepository;