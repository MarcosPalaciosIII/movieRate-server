const mongoose = require('mongoose');
const session    = require("express-session");
const MongoStore = require('connect-mongo')(session);

// Use native Javascript promise in Mongoose commands
mongoose.Promise = Promise;

// connect Mongoose to our app's local database
mongoose
  .connect('mongodb://localhost/movierate-server', {useNewUrlParser: true})
  .then(x => {
    // console.log("============ ", x);
    // console.log(`👽 👽 Connected to Mongo! 👽 Database name: "${x.connections[0].name}" 👽 👽`);
    console.log("Mongoose is connected! 👽 👽 👽 👽");
  })
  .catch(err => {
    console.error('Error connecting to mongo 🚨🚨🚨🚨🚨🚨🚨🚨🚨', err);
  });
