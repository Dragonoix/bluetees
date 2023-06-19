// index..js
module.exports = {
    app: {
		port: process.env.PORT || 1608,
		appName: process.env.APP_NAME || 'Blue Tees',
		env: process.env.NODE_ENV || 'development',
        isProd:(process.env.NODE_ENV === 'prod'),
        getAdminApiFolderName: process.env.ADMIN_API_FOLDER_NAME || 'admin',
        getApiFolderName: process.env.API_FOLDER_NAME || 'api'
	},
	db: {
		port: process.env.DB_PORT || 27117,
		database: process.env.DB_NAME || 'bluetees',
		password: process.env.DB_PASS || 'bluetees@&3011',
		username: process.env.DB_USER || 'bluetees',
		host: process.env.DB_HOST || 'mongo1.webskitters.in',
		dialect: 'mongodb'
	},
	winiston: {
		logpath: '/iLrnLogs/logs/',
	},
	auth: {
		jwtSecret: process.env.JWT_SECRET || 'MyS3cr3tK3Y',
		jwt_expiresin: process.env.JWT_EXPIRES_IN || '2d', //'60s'
		saltRounds: process.env.SALT_ROUND || 10,
		refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || 'VmVyeVBvd2VyZnVsbFNlY3JldA==',
		refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d', // '120s'
	},
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_BUCKET
    },
	sendgrid: {
		api_key: process.env.SEND_GRID_API_KEY,
		from_email: process.env.FROM_EMAIL || 'nodejs_developer_wdc@yopmail.com',
	},
	twilio: {
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
        twilioFromNumber: process.env.TWILIO_FROM_NUMBER
    },
	// magiclink: {
    //     blueteesapp: 'https://golf-app-staging.bluetees.com/', //'https://blueteesapp-ui.dedicateddevelopers.us/',
    //     web_bluetees: 'https://bluetees-web-ui.dedicateddevelopers.us/',
	// 	linkLimit: 5,
	// 	lockHour : 24
    // },
	otpSend: {
        linkLimit: 5,
		lockHour : 24
    },
	// shopify: {
    //     shopifyUserName: process.env.SHOPIFY_USER_NAME,
    //     shopifyPassword: process.env.SHOPIFY_PASSWORD
    // },
	other: {
        pageLimit: 10,
        clubArr: ['dr','3w','4w','5w','7w','2h','3h','4h','5h','6h',
		'1i','2i','3i','4i','5i','6i','7i','8i','9i',
		'pw','sw','gw','lw','50w','52w','54w','56w','58w','60w','62w','64w'
	   ]
    },	
};
