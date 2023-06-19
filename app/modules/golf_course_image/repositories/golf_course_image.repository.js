const GolfCourseImage = require('golf_course_image/models/golf_course_image.model');
const _ = require('underscore');

class GolfCourseImageRepository {
    constructor() { 
        this.limit = 10;
    }
    async getAll(req) {
        try {
           
            let conditions = {};
            let and_clauses = [{"isDeleted": false}];
            const currentPage = req.body.currentPage || 1;
            if (_.isObject(req.body) && _.has(req.body, 'keyword')) {
                if(!_.isEmpty(req.body.keyword)) {
                    const search_string = req.body.keyword.trim();
                    and_clauses.push({ "title": { $regex: search_string, $options: 'i' } });
                }
            }
           
            conditions['$and'] = and_clauses;
            
            const aggregateData = GolfCourseImage.aggregate([
                { $match: conditions },
                { $sort: { _id: -1 } }
            ])    
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await GolfCourseImage.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getById(id){
        try {
            let result = await GolfCourseImage.findById(id).exec();
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }
    
    async getByField(params) {
        try {
            return await GolfCourseImage.findOne(params).exec();
        } catch (error) {
            return error;
        }
    }

    async getAllByField(params) {
        try {
            return await GolfCourseImage.find(params).sort({orderNumber:1}).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async delete(id) {
        try {
            await GolfCourseImage.findById(id).lean().exec();
            return await GolfCourseImage.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await GolfCourseImage.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async save(data) {
        try {
            let result = await GolfCourseImage.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }

    async getGolfCourseImageByUser(param) {
        try {
           
            let conditions = {};
            let and_clauses = [{"isDeleted": false}];
            console.log(param);
            conditions['$and'] = and_clauses;
            
            return await GolfCourseImage.aggregate([                
                { $match: conditions },
                {
                    $project:{
                        "_id" : "$_id",
                        "title" : "$title",
                        "short_title" : "$short_title",
                        "short_image" : "$short_image",
                        "isSelected":{$cond: [{ $in: ["$_id", param.selected_golf_clubs]}, true, false]},
                    }
                },
                { $sort: { title: 1 } }
            ])    
            
            
        } catch (error) {
            return error;
        }
    }
}

module.exports = new GolfCourseImageRepository;