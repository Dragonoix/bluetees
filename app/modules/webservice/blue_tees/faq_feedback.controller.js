const mongoose = require('mongoose');
const faqFeedbackRepo = require('faq_feedback/repositories/faq_feedback.repository');
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);


class FaqFeedbackController {
    constructor() { }

    /**
     * @Method submit
     * @Description to submit a faq feedback
     * 
    */
    async submit(req, res) {
        try {
            if (!_.has(req.body, 'faq_id') || ((_.has(req.body, 'faq_id') && (_.isUndefined(req.body.faq_id)) || _.isNull(req.body.faq_id) || _.isEmpty(req.body.faq_id)))) {
                requestHandler.throwError(400, 'Bad Request', 'Faq id is required')();
            }
            if (!mongoose.isValidObjectId(req.body.faq_id)) {
                requestHandler.throwError(400, 'Bad Request', 'Faq id should be an object id')();
            }


            if (!_.has(req.body, 'feedback_type')) {
                requestHandler.throwError(400, 'Bad Request', 'Feedback type is required')();
            }

            let faq_feedback_status;

            let is_faq_exists = await faqFeedbackRepo.getByField({ faq_id: req.body.faq_id, user_id: req.user._id });

            if (_.isEmpty(is_faq_exists)) {
                let save_obj = {
                    faq_id: req.body.faq_id,
                    feedback_type: req.body.feedback_type,
                    user_id: req.user._id
                }

                faq_feedback_status = await faqFeedbackRepo.save(save_obj);
            } else {
                let update_obj = {
                    feedback_type: req.body.feedback_type,
                }
                faq_feedback_status = await faqFeedbackRepo.updateById(update_obj, is_faq_exists._id); 
            }

            if (!_.isEmpty(faq_feedback_status) && faq_feedback_status._id) {
                requestHandler.sendSuccess(res, 'Feedback submitted successfully!')();
            } else {
                requestHandler.throwError(403, 'Bad Request', 'Something went wrong, feedback not submitted!')();
            }


        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }



}

module.exports = new FaqFeedbackController();