const axios = require('axios');

class postscriptController {


    /**
     * @Method Send Data
     * @Description Send Data to Postscript
    */
    async subscribe(data) {
        try {
            var config = {
                method: 'post',
                url: 'https://api.postscript.io/api/v2/subscribers',
                headers: {
                    'Authorization': 'Bearer sk_c7d73df76efc78e496d3673176b58e50',
                    'Content-Type': 'application/json'
                },
                data: data
            };

            let res = await axios(config);
            console.log(res);
            if (res.status == 200) {
                return (res.data);
            } else {
                return false;
            }
        } catch (err) {
            console.log(err, "POSTSCRIPT ERROR");
            return false;
        }
    }


    async updateSubscriber(id, data) {
        try {
            var config = {
                method: 'patch',
                url: 'https://api.postscript.io/api/v2/subscribers/'+id,
                headers: {
                    'Authorization': 'Bearer sk_c7d73df76efc78e496d3673176b58e50',
                    'Content-Type': 'application/json'
                },
                data: data
            };

            let res = await axios(config);
            if (res.status == 200) {
                return (res.data);
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }


    async findSubscriber(phone) {
        try {
            var config = {
                method: 'get',
                url: 'https://api.postscript.io/api/v2/subscribers?phone_number__eq='+phone,
                headers: {
                    'Authorization': 'Bearer sk_c7d73df76efc78e496d3673176b58e50',
                    'Content-Type': 'application/json'
                }
            };

            let res = await axios(config);
            if (res.status == 200 && res.data.subscribers.length > 0) {
                return ({ stat: true, data: res.data.subscribers[0] });
            } else {
                return { stat: false };
            }
        } catch (err) {
            return { stat: false };
        }
    }

}



module.exports = new postscriptController();