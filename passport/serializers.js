const passport = require('passport');
const FbStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const User = require('../models/User');

// serialize (what user info do we save to the session)
//---------------------------------------------
// gets called when a user logs in (on our POST /process-login)
passport.serializeUser((userFromDb, cb) => {
  // null is for saying "no errors occurred durring the serialize process"
  cb(null, userFromDb._id);
  // saves only the "_id" of the user
});

// deserialize (how do we retrieve the user details from the session)
//----------------------------------------------
// gets called EVERY TIME you visit a page on the site while you are logged in
// (that's so we can potentially personalize all pages)


passport.deserializeUser((idFromSession, cb) => {
  // find the user's document by the ID we saved in the session
  UserModel.findById(idFromSession)
  .then((userFromDb) => {
    // null is saying "no errors occurred" durring the deserialize process
    cb(null, userFromDb);
    // send Passport the logged in user's info
  })
  .catch((err) => {
    cb(err);
  });
});



// STRATEGIES (npm package that enables other methods of logging)



// Login With facebook
passport.use(
  new FbStrategy (
    // 1st arg of fbStrategy -> settings object
    {
      // Facebook credentials
      // App ID
      clientID: process.env.FACEBOOK_ID,
      // App Secret
      clientSecret: process.env.FACEBOOK_SECRET,


      // URL: where to go after log in is successful (one of our routes)
      callbackURL: "/facebook/success",

      proxy: true
    },

    // 2nd arg of fbStrategy -> callback
    (accessToken, refreshToken, profile, callback) => {
      console.log("FACEBOOK profile -----------");
      console.log(profile);
      // what happens when a user logs in with facebook
      // (create a new user document OR use an existing)

      // Check if there's already a document in the database for this user
      UserModel.findOne({ facebookID: profile.id })
      .then((userFromDb) => {
        if (userFromDb) {
          callback(null, userFromDb);
          return;
        }

        // create a user account if there's none
        const theUser = new UserModel({
          facebookID: profile.id,
          fullName: profile.displayName
        });
        return theUser.save();
      })
      .then((newUser) => {
        // tell Passport to use the new user account
        callback(null, newUser);

      })
      .catch((err) => {
        // tell Passport there was an error in the login process
        callback(err);
      });
    }
  ) // new FbStrategy()
);// passport.use()


// Login with Google
passport.use(
  new GoogleStrategy(
    // 1st arg of GoogleStrategy -> settings object
    {
      // Google credentials
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,

      // Where to go after log in is successful (one of our routes)
      callbackURL: "/google/success",

      // fixes Google log in for production
      proxy: true
    },

    // 2nd arg of GoogleStrategy -> callback
    (accessToken, refreshToken, profile, callback) => {
      console.log("GOOGLE profile -----------");
      console.log(profile);

      // Check if there's already a document in the database for this user
      UserModel.findOne({ googleID: profile.id})
      .then((userFromDb)=> {
        if (userFromDb) {
          callback(null, userFromDb);
          return;
        }
        const theUser = new UserModel({
          googleID: profile.id,
          // use the email as their name "cause Google doesn't give names"
          //fullName: profile.emails[0].value
          fullName: profile.displayName
        });
        return theUser.save();
      })
      .then((newUser) => {
        // tell Passport to use the new user account
        callback(null, newUser);
      })
      // tell Passport there was an error in the login process
      .catch((err) => {
        callback(err);
      });
    }
  ) // new GoogleStrategy()
); // passport.use()
