const Setting = require('setting/models/setting.model');
const _ = require('underscore');

class SettingRepository {
    constructor() {
        this.limit = 10;
    }

    async getAll() {
        try {

            let result = await Setting.find({ "isDeleted": false }).exec();

            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getById(id) {
        let result = await Setting.findById(id).exec();
        try {
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }

    async getByField(params) {
        let result = await Setting.findOne(params).exec();
        try {
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }

    async getAllByField(params) {
        let result = await Setting.find(params).exec();
        try {
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }

    async getCmsCount(params) {
        try {
            let result = await Setting.countDocuments(params);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async delete(id) {
        try {
            let result = await Cms.findById(id);
            if (result) {
                let resultDelete = await Setting.remove({ _id: id }).exec();
                if (!resultDelete) {
                    return null;
                }
                return resultDelete;
            }
        } catch (e) {
            throw e;
        }
    }

    async updateById(data, id) {
        try {
            let result = await Setting.findByIdAndUpdate(id, data, { new: true, upsert: true }).exec();
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

};

module.exports = new SettingRepository;