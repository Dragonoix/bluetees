const purchase = require('purchase/models/purchase.model');
const _ = require('underscore');

class purchaseLevelRepository {
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
                    and_clauses.push({ "purchase_website": { $regex: search_string, $options: 'i' } });
                }
            }
            conditions['$and'] = and_clauses;
            
            const aggregateData = purchase.aggregate([
                { $match: conditions },
                { $sort: { _id: -1 } }
            ])    
            const options = {
                page: currentPage,
                limit: this.limit
            };
            const result = await purchase.aggregatePaginate(aggregateData, options);
            if (!result) {
                return null;
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async getAllPurchases(req) {
        try {
            let conditions = {};
            let and_clauses = [];
            const currentPage = parseInt(req.body.page) || 1;
            and_clauses.push({ "isDeleted": false });

            if (req.body.columns && req.body.columns.length) {
                let statusFilter = _.findWhere(req.body.columns, { data: 'status' });

                if (statusFilter && statusFilter.search && statusFilter.search.value) {
                    and_clauses.push({
                        "status": statusFilter.search.value
                    });
                }
            }

            if (req.body.columns && req.body.columns.length) {
                let statusFilter = _.findWhere(req.body.columns, { data: 'location' });

                if (statusFilter && statusFilter.search && statusFilter.search.value) {
                    and_clauses.push({
                        "location": statusFilter.search.value.toUpperCase()
                    });
                }
            }
            

            conditions['$and'] = and_clauses;

            console.log(conditions);

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

            let aggregate = purchase.aggregate([
                { $match: conditions },
                sortOperator
            ], { collation: { locale: "en", caseFirst: "upper" } });

            let options = { 
                page: currentPage,
                limit: this.limit
            };
            let allUsers = await purchase.aggregatePaginate(aggregate, options);
            return allUsers;
        } catch (e) {
            console.log(e);
            throw (e);
        }
    }

    async getById(id){
        try {
            let result = await purchase.findById(id).exec();
            if (!result) {
                return null;
            }
            return result;

        } catch (e) {
            return e;
        }
    }
    
    async getByField(params){

        try {
            let user = await purchase.findOne(params).exec();
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
            return await purchase.find(params).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async delete(id) {
        try {
            await purchase.findById(id).lean().exec();
            return await purchase.deleteOne({ _id: id }).lean().exec();
        } catch (error) {
            return error;
        }
    }

    async updateById(data, id) {
        try {
            return await purchase.findByIdAndUpdate(id, data, { new: true, upsert: true })
                .lean().exec();
        } catch (error) {
            return error;
        }
    }

    async save(data) {
        try {
            let result = await purchase.create(data);
            if (!result) {
                return null;
            }
            return result;
        } catch (e) {
            return e;
        }
    }
}

module.exports = new purchaseLevelRepository;