const mongoose = require('mongoose');

// Use native Javascript promise in Mongoose commands
mongoose.Promise = Promise;

// connect Mongoose to our app's local database
mongoose
  .connect('mongodb://localhost/movierate-server', {useNewUrlParser: true})
  .then(x => {
    console.log(`👽 👽 Connected to Mongo! 👽 Database name: "${x.connections[0].name}" 👽 👽`);
  })
  .catch(err => {
    console.error('Error connecting to mongo 🚨🚨🚨🚨🚨🚨🚨🚨🚨', err);
  });
