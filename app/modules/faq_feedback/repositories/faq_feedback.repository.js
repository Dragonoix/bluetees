const mongoose = require('mongoose');
const FAQFeedback = require('faq_feedback/models/faq_feedback.model');

const faqFeedbackRepository = {

    getAll: async (req) => {
        try {
            var conditions = {};
            var and_clauses = [];
            and_clauses.push({
                "isDeleted": false                
            });

            var sortOperator = {
                "$sort": {}
            };

            if(_.isObject(req.body)){
                if (_.has(req.body, 'keyword') && req.body.keyword.trim()!='') {
                    and_clauses.push({
                        $or: [
                            { 'category': { $regex: req.body.keyword.trim(), $options: 'i' } }                        
                        ]
                    });
                }
                if (_.has(req.body, 'status') && (req.body.status.trim()=="Active" || req.body.status.trim()=="Inactive")) {
                    and_clauses.push({
                        "status": req.body.status
                    });
                }

                if (_.has(req.body, 'sort_by') && req.body.sort_by.trim()!='' && req.body.sort_by!=null) {
                    var sortField = req.body.sort_by;
                    if (req.body.sort_order == 'desc') {
                        var sortOrder = -1;
                    } else {
                        var sortOrder = 1;
                    }    
                    sortOperator["$sort"][sortField] = sortOrder;
                } else {
                    sortOperator["$sort"]['_id'] = -1;
                }
            }
            
            conditions['$and'] = and_clauses;            
            

            var aggregate = FAQFeedback.aggregate([
                {
                    $project: {
                        _id : "$_id",
                        category : "$category",
                        status : "$status",
                        isDeleted : "$isDeleted"
                    }
                },
                {
                    $match: conditions
                },
                sortOperator
            ]);

            var options = {
                page: req.body.page,
                limit: req.body.per_page
            };
            let allRecord = await FAQFeedback.aggregatePaginate(aggregate, options);

            return allRecord;
        } catch (e) {
            throw (e);
        }
    },


    getById: async (id) => {
        
        try {
            let record = await FAQFeedback.findById(id).lean().exec();
            if (!record) {
                return null;
            }
            return record;

        } catch (e) {
            return e;
        }
    },

    getByField: async (params) => {
                
        try {
            let record = await FAQFeedback.findOne(params).exec();
            if (!record) {
                return null;
            }
            return record;

        } catch (e) {
            return e;
        }
    },

    getAllByField: async (params) => {
        
        try {
            let record = await FAQFeedback.find(params).sort({
                'question': 1
            }).exec();
            
            if (!record) {
                return null;
            }
            return record;

        } catch (e) {
            return e;
        }
    },



    save: async (data) => {
        try {
            let save = await FAQFeedback.create(data);
            if (!save) {
                return null;
            }
            return save;
        } catch (e) {
            return e;
        }
    },

    getDocumentCount: async (params) => {
        try {
            let recordCount = await FAQFeedback.countDocuments(params);
            if (!recordCount) {
                return 0;
            }
            return recordCount;
        } catch (e) {
            return e;
        }
    },

    delete: async (id) => {
        try {
            let record = await FAQFeedback.findById(id);
            if (record) {
                let recordDelete = await FAQFeedback.findByIdAndUpdate(id, {
                    isDeleted: true
                }, {
                        new: true
                    });
                if (!recordDelete) {
                    return null;
                }
                return recordDelete;
            }
        } catch (e) {
            throw e;
        }
    },

    updateById: async (data, id) => {
        try {
            let record = await FAQFeedback.findByIdAndUpdate(id, data, {
                isDeleted: false
            });
            if (!record) {
                return null;
            }
            return record;
        } catch (e) {
            return e;
        }
    },

    updateByField: async (field, fieldValue, data) => {
        //todo: update by field
    },
    findAll:async()=>{

        try{
            let record = await FAQFeedback.find({
                "status" : "Active",
                "isDeleted": false
            });
            
            if (!record) {
                return null;
            }
            return record;
        }catch(e){
            return e;
        }

    }
};

module.exports = faqFeedbackRepository;