const mongoose = require("mongoose");
const ErrorLog = require("error_log/models/error_log.model");


const ErrorLogRepository = {
  
  getById: async (id) => {    
    try {
      let record = await ErrorLog.findById(id).lean().exec();
      if (!record) {
        return null;
      }
      return record;
    } catch (e) {
      throw e;
    }
  },

  getByField: async (params) => {
   
    try {
      let record = await ErrorLog.findOne(params).exec();
      if (!record) {
        return null;
      }
      return record;
    } catch (e) {
      throw e;
    }
  },

  getAllByField: async (params) => {    
    try {
      let record = await ErrorLog.find(params).populate("title").sort({ title: 1 }).exec();
      if (!record) {
        return null;
      }
      return record;
    } catch (e) {
      throw e;
    }
  },

  save: async (data) => {
    try {
      let save = await ErrorLog.create(data);
      if (!save) {
        return null;
      }
      return save;
    } catch (e) {
      throw e;
    }
  },
  
  delete: async (id) => {
    try {
      let record = await ErrorLog.findById(id);
      if (record) {
        let recordDelete = await ErrorLog.findByIdAndUpdate(
          id,
          {
            isDeleted: true,
          },
          {
            new: true,
          }
        );
        if (!recordDelete) {
          return null;
        }
        return recordDelete;
      }
    } catch (e) {
      throw e;
    }
  },

  updateById: async (id, data) => {
    try {
      let record = await ErrorLog.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (!record) {
        return null;
      }
      return record;
    } catch (e) {
      throw e;
    }
  },

  updateByField: async (field, fieldValue, data) => {
    //todo: update by field
  },
};

module.exports = ErrorLogRepository;
