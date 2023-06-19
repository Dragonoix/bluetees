const mongoose = require('mongoose');


// const URI = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

const URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;


let option = {
 useNewUrlParser: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

module.exports = async () => {
  try {
    const db = await mongoose.connect(URI, option);
    global.dbUrl = db.connections[0].db;
    console.log('DB connected successfully');
  } catch (error) {
    console.error(error);
  }
}

/*
module.exports = async () => {
  try {
    let db = await mongoose.connect('mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_DATABASE, {
      auth: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD
      },
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    global.dbUrl = db.connections[0].db;
    console.log('DB connected successfully');
  } catch (error) {
    console.error(error);
  }
}*/