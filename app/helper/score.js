const querystring = require('querystring');

class Score {

	constructor() {
		
	}
	
	async calculateScore(par,strokes, putts){
		try{
			var returnData = {};
			var total_shots = parseInt(strokes) + parseInt(putts);
			var strokeDiff = parseInt(par) - parseInt(strokes); 

			if(parseInt(strokeDiff) == 0){
				console.log('1');
				returnData.ace = 0;
				returnData.albatross = 0;
				returnData.eagle = 0;
				returnData.birdie = 0;
				returnData.par = 1;
				returnData.bogey = 0;
				returnData.double_bogey = 0;
				returnData.triple_bogey = 0;
				returnData.over = 0;
			}
			else if(parseInt(total_shots) == 1 ){ console.log('2');
				returnData.ace = 1;
				returnData.albatross = 0;
				returnData.eagle = 0;
				returnData.birdie = 0;
				returnData.par = 0;
				returnData.bogey = 0;
				returnData.double_bogey = 0;
				returnData.triple_bogey = 0;
				returnData.over = 0;
			} 
			else if(parseInt(strokeDiff) == 3 ){ console.log('3');
				returnData.ace = 0;
				returnData.albatross = 1;
				returnData.eagle = 0;
				returnData.birdie = 0;
				returnData.par = 0;
				returnData.bogey = 0;
				returnData.double_bogey = 0;
				returnData.triple_bogey = 0;
				returnData.over = 0;
			}
			else if(parseInt(strokeDiff) == 2 ){ console.log('4');
				returnData.ace = 0;
				returnData.albatross = 0;
				returnData.eagle = 1;
				returnData.birdie = 0;
				returnData.par = 0;
				returnData.bogey = 0;
				returnData.double_bogey = 0;
				returnData.triple_bogey = 0;
				returnData.over = 0;
			}
			else if(parseInt(strokeDiff) == 1 ){ console.log('5');
				returnData.ace = 0;
				returnData.albatross = 0;
				returnData.eagle = 0;
				returnData.birdie = 1;
				returnData.par = 0;
				returnData.bogey = 0;
				returnData.double_bogey = 0;
				returnData.triple_bogey = 0;
				returnData.over = 0;
			}
			else if(parseInt(strokeDiff) == -1 ){ console.log('6');
				returnData.ace = 0;
				returnData.albatross = 0;
				returnData.eagle = 0;
				returnData.birdie = 0;
				returnData.par = 0;
				returnData.bogey = 1;
				returnData.double_bogey = 0;
				returnData.triple_bogey = 0;
				returnData.over = 0;
			}
			else if(parseInt(strokeDiff) == -2 ){ console.log('7');
				returnData.ace = 0;
				returnData.albatross = 0;
				returnData.eagle = 0;
				returnData.birdie = 0;
				returnData.par = 0;
				returnData.bogey = 0;
				returnData.double_bogey = 1;
				returnData.triple_bogey = 0;
				returnData.over = 0;
			}
			else if(parseInt(strokeDiff) == -3 ){ console.log('8');
				returnData.ace = 0;
				returnData.albatross = 0;
				returnData.eagle = 0;
				returnData.birdie = 0;
				returnData.par = 0;
				returnData.bogey = 0;
				returnData.double_bogey = 0;
				returnData.triple_bogey = 1;
				returnData.over = 0;
			} else { console.log('9');
				returnData.ace = 0;
				returnData.albatross = 0;
				returnData.eagle = 0;
				returnData.birdie = 0;
				returnData.par = 0;
				returnData.bogey = 0;
				returnData.double_bogey = 0;
				returnData.triple_bogey = 0;
				returnData.over = 1;
			}
			
			return returnData;
		}
		catch(e){
			throw e;
		}
	}

}

module.exports = new Score();

