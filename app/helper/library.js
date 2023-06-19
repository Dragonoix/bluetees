const userBlueteesRepo = require('user_golf_round/repositories/user_golf_round.repository');
const userBlueteesDataRepo = require('user_golf_round_data/repositories/user_golf_round_data.repository')
const mongoose = require('mongoose');
const _ = require('underscore');

class Library {
    constructor() {
    }

    /* @Method: deleteIncompleteJunkCourse
    // @Description: For sendmail
    */
    async deleteIncompleteJunkCourse(param) {
        try {
            let incompleteRounds = await userBlueteesRepo.getAllByField({ "userId": mongoose.Types.ObjectId(param.user_id), "isRoundComplete": false });
            
            if(!_.isEmpty(incompleteRounds) && !_.isNull(incompleteRounds) && _.isArray(incompleteRounds)){

                 for(var i=0;i<incompleteRounds.length;i++){
                    console.log("delete incompleteRounds[i]._id",incompleteRounds[i]._id);
                    let deleteRound = await userBlueteesRepo.delete(incompleteRounds[i]._id);
                    if (deleteRound) {
                        await userBlueteesDataRepo.bulkDelete({ "roundId": incompleteRounds[i]._id });
                    }
                }
            }
            return true;           
            
        } catch (error) {
            console.error(error);    
            // logger.log(`error ,Error during previous incomplete round at : ${new Date()} details message: ${error}`, 'error');
            return false;
        }
    };
}
module.exports = new Library();