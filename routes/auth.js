const express = require("express");
const passport = require('passport');
const router = express.Router();
const User = require("../models/User");

// Bcrypt to encrypt passwords
const bcrypt = require("bcryptjs");
const bcryptSalt = 10;


router.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});


router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));


router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});


router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass
    });

    newUser.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      res.render("auth/signup", { message: "Something went wrong" });
    });
  });
});


router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
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
