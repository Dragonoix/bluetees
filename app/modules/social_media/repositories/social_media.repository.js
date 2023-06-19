const Social_media = require('social_media/models/social_media.model');
const _ = require('underscore');

class Social_mediaRepository {
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
                    and_clauses.push({ "social_media": { $regex: search_string, $options: 'i' } });
                }
            }
            conditions['$and'] = and_clauses;
            
            const aggregateData = Social_media.aggregate([
                { $match: conditions },
                { $sort: { _id: -1 } }
            ])    
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await Social_media.aggregatePaginate(aggregateData, options);
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
            let result = await Social_media.findById(id).exec();
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }

    async getAllMedias(req) {
        try {
            let conditions = {};
            let and_clauses = [];
            const currentPage = parseInt(req.body.page) || 1;
            and_clauses.push({ "isDeleted": false });

            if (req.body.columns && req.body.columns.length) {
                let statusFilter = _.findWhere(req.body.columns, { data: 'status' });
                let mediaFilter = _.findWhere(req.body.columns, { data: 'social_media' });

                if (statusFilter && statusFilter.search && statusFilter.search.value) {
                    and_clauses.push({
                        "status": statusFilter.search.value
                    });
                }

                if (mediaFilter && mediaFilter.search && mediaFilter.search.value) {
                    and_clauses.push({
                        "social_media": mediaFilter.search.value
                    });
                }

            }

            conditions['$and'] = and_clauses;


            let sortOperator = { "$sort": {} };
            if (_.has(req.body, 'order') && req.body.order.length) {
                for (let order of req.body.order) {
                    let sortField = req.body.columns[+order.column].data;
                    if (order.dir == 'desc') {
                        var sortOrder = -1;
                    } else if (order.dir == 'asc') {
                        var sortOrder = 1;
                    }
                    sortOperator["$sort"][sortField] = sortOrder;
                }
            } else {
                sortOperator["$sort"]['_id'] = -1;
            }

            let my_aggregate = Social_media.aggregate([
                { $match: conditions },
                {
                    $project: {
                        "createdAt": 0,
                        "updatedAt": 0,
                        "isDeleted": 0,
                    }
                },
                sortOperator
            ])

            let options = {
                page: currentPage,
                limit: this.limit
            };
            let allData = await Social_media.aggregatePaginate(my_aggregate, options);
            return allData;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    }
    
    async getByField(params){

        try {
            let user = await Social_media.findOne(params).exec();
            if (!user) {
                return null;
            }
            return user;

        } catch (e) {
            return e;
        }
    }
    async getAllByField(params) {
        try {
            return await Social_media.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async delete(id) {
        try {
            await Social_media.findById(id).lean().exec();
            return await Social_media.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await Social_media.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async save(data) {
        try {
            let result = await Social_media.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }
}

module.exports = new Social_mediaRepository;