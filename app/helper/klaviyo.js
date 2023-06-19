const axios = require('axios');

class klaviyoController {


    /**
     * @Method Send Data
     * @Description Send Data to klaviyo
    */
    async createProfileListAdd(data) {
        try {
            var config = {
                method: 'post',
                url: 'https://a.klaviyo.com/api/profiles/',
                headers: {
                    'Authorization': 'Klaviyo-API-Key ' + process.env.KLAVIYO_API_KEY,
                    'revision': '2023-02-22',
                    'Content-Type': 'application/json'
                },
                data: data
            };

            let res = await axios(config);
            // console.log(res, "KLA RES");
            if (res.status == 201) { // if res 201 then add user to a list
                var config2 = {
                    method: 'post',
                    url: 'https://a.klaviyo.com/api/lists/' + process.env.KLAVIO_LIST_ID + '/relationships/profiles/',
                    headers: {
                        'Authorization': 'Klaviyo-API-Key ' + process.env.KLAVIYO_API_KEY,
                        'revision': '2023-02-22',
                        'Content-Type': 'application/json'
                    },
                    data: {
                        "data": [
                            {
                                "type": "profile",
                                "id": res.data.data.id
                            }
                        ]
                    }
                };

                let res2 = await axios(config2);

                if (res2.status == 204) {
                    return {
                        stat: true,
                        id: res.data.data.id
                    };
                } else {
                    return {
                        stat: false,
                    };
                }
            } else {
                return {
                    stat: false,
                };
            }
        } catch (err) {
            // console.log(err);
            return {
                stat: false,
                err: err.response
            };
        }
    }


    /**
     * @Method Update profile
     * @Description Update profile from klaviyo
    */
    async updateProfile(data) {
        try {
            var config = {
                method: 'patch',
                url: 'https://a.klaviyo.com/api/profiles/' + data.data.id,
                headers: {
                    'Authorization': 'Klaviyo-API-Key ' + process.env.KLAVIYO_API_KEY,
                    'revision': '2023-02-22',
                    'Content-Type': 'application/json'
                },
                data: data
            };

            let res = await axios(config);
            if (res.status == 200) {
                return {
                    stat: true
                };
            } else {
                return {
                    stat: false
                };
            }
        } catch (err) {
            return {
                stat: false,
                err: err
            };
        }
    }


    async findByPhone(phone) {
        try {
            var config = {
                method: 'get',
                url: 'https://a.klaviyo.com/api/profiles/?filter=equals(phone_number,%22%2B'+phone+'%22)',
                headers: {
                    'Authorization': 'Klaviyo-API-Key ' + process.env.KLAVIYO_API_KEY,
                    'revision': '2023-02-22',
                    'Content-Type': 'application/json'
                }
            };

            let res = await axios(config);
            if (res.status == 200 && res.data.data.length > 0) {
                return res.data.data[0];
            } else {
                console.log("Klaviyo unable to find data.");
            }
        } catch (err) {
            return {
                stat: false,
                err: err
            };
        }
    }



}



module.exports = new klaviyoController();