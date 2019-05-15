const express = require("express");
const passport = require('passport');
const router = express.Router();
const UserModel = require("../models/User");

// Bcrypt to encrypt passwords
const bcrypt = require("bcryptjs");
const bcryptSalt = 10;


router.get("/login", (req, res, next) => {
  if(req.user){
      res.redirect("/");
      // early return to stop the function since there's an error
      //(prevents the rest of the code form running
      return;
    }
  res.render("auth/login", { "message": req.flash("error") });
});


// router.post("/login", passport.authenticate("local", {
//   successRedirect: "/",
//   failureRedirect: "/auth/login",
//   failureFlash: true,
//   passReqToCallback: true
// }));

router.post("/login", (req,res, next) => {
  // console.log("logging in user ===============>", req.body.LoginEmail, req.body.LoginPassword);
  // console.log("the is the info from the form ----------- ", req.body);

  // redirect to home if you are already logged in
  if(req.user){
    res.redirect("/");
    // early return to stop the function since there's an error
    //(prevents the rest of the code form running)
    return;
  }
  // console.log("not logged in");

  // find a user document in the database with that email
  UserModel.findOne({ email: req.body.LoginEmail })
  .then((userFromDb) => {
    if (userFromDb === null) {
      // if we didn't find a user
      res.locals.errorMessage = "Email incorrect.";
      res.render("auth/login.hbs");

      // early return to stop the function since there's an error
      // (prevents the rest of the code from running)
      return;
    }
    // console.log("user found on db >>>>>>>>>> ", userFromDb);

    // if email is correct now we check the password
    const isPasswordGood =
     bcrypt.compareSync(req.body.LoginPassword, userFromDb.password);

     if (isPasswordGood === false) {
       res.locals.errorMessage = "Password incorrect.";
       res.render("auth/login.hbs");

       // early return to stop the function since there's an error
       // (prevents the rest of the code from running)
       return;
     }
     // console.log("no issues with pw");

     // CREDENTIALS ARE GOOD! We need to log the users in


      // Passport defines the "req.login()"
      // for us to specify when to log in a user into the session
      req.login(userFromDb, (err) => {
        if (err) {
          // console.log("something went wrong with login() from passport", err);

          // if it didn't work show the error page
          next(err);
        }
        else {

              console.log("user" + userFromDb);
              userFromDb.set({loggedIn: true});
              userFromDb.save()

              .then(() => {
                // console.log("User has been logged in }}}}}}}}}}}}} ", req.user, "=============", userFromDb);

                req.session.cookie.expires = false;  //this should make cookies last for duration of user.

                //redirect to the home page on successful log in
                res.redirect("/");
              })
              .catch((err) => {
                next(err);
              });

        }
      }); //req.login()
  })// then()
  .catch((err) => {
    next(err);
  });
});


router.get("/signup", (req, res, next) => {
  // redirect to home if you are already logged in
if(req.user){
    res.redirect("/");
    // early return to stop the function since there's an error
    //(prevents the rest of the code form running
    return;
  }

  res.render("auth/signup");
});


router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email    = req.body.email;
  if (username === "" || password === "" || email === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  UserModel.findOne({ email }, "email", (err, user) => {

    if(user !== null) {
      res.render("auth/signup", { message: "The email already exists" });
      return;
    } else {
      UserModel.findOne({ username }, "username", (err, user) => {
        if (user !== null) {
          res.render("auth/signup", { message: "The username already exists" });
          return;
        }

        const salt = bcrypt.genSaltSync(bcryptSalt);
        const hashPass = bcrypt.hashSync(password, salt);
        const hashName = bcrypt.hashSync(username, salt);

        const newUser = new UserModel({
          username,
          email,
          password: hashPass,
          favMovies: [],
          favActors: [],
          playlists: [],
          loggedIn: false,
          confirmCode: hashName,
          negativeMarks: 0,
          strikes: 0,
          reportedBy: [],
          reported: []
        });

        newUser.save()
        .then(() => {
          res.redirect("/");
        })
        .catch(err => {
          res.render("auth/signup", { message: "Something went wrong" });
        });
      });
    }
  });
});



router.get("/logout", (req, res, next) => {
  // console.log("this is the user before the log out ============= ", req.user);
  if(req.user === undefined) {
    res.redirect("/");
    return;
  }

  req.user.set({loggedIn: false});
  req.user.save()

  .then(() => {
    //Passport defines the "req.logout()" method
    // for us to specify when to log out a user (clear them from the session)
    req.logout();

    res.redirect("/");
  })
  .catch((err) => {
    next(err);
  });
});



// Facebook login ROUTES
//-------------------------------------------------

// link to "facebook/login" to initiate the login proces
router.get("/facebook/login", passport.authenticate("facebook"));
//                        |
//            this name comes from the strategy

// Facebook will redirect here after login is successful
router.get("/facebook/success", // no normal callback here
 passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/login"
  })
);



// Google login ROUTES
// ------------------------------------------------

router.get("/google/login", // no normal callback here
passport.authenticate("google", {
  scope: [
     "https://www.googleapis.com/auth/plus.login",
        "https://www.googleapis.com/auth/plus.profile.emails.read"
      ]
  })
);

// Google will redirect here after login is successful
router.get("/google/success",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login"
  })
);


module.exports = router;
