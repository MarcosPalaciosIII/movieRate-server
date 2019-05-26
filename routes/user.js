const express = require('express');
// const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Movie = require('../models/Movies');
const Playlist = require('../models/MoviePlaylist');
const Comment = require('../models/Comments');



router.get('/profile', (req, res, next) => {

  if(req.user === undefined) {
    res.redirect('/auth/login');
  }
    data = {
      pageTitle: `${req.user.username}'s Profile`
    };

    res.render('user/profile.hbs', data);
});



router.get('/playlists/:username', (req, res, next) => {
  // console.log("the user and username ======>>> ", req.params.username, "=====", req.user.username);
  // this conditional statement is working backwards (reading both usernames as not the same when they are the same)
  if(req.params.useranme === req.user.username) {
    data = {
      wrongUser: `You do not have access to this users playlists`
    };
    res.render('playlist/userPlaylist.hbs', data);
  } else {
    User.findById(req.user._id).populate("playlists")
    .then(userFromDb => {
      data = {
        pageTitle: `${req.params.username}'s playlists`,
        userPlaylists: userFromDb.playlists
      };
      // console.log("these are the users playlists ------------------ ", userFromDb.playlists);
      res.render('playlist/userPlaylist.hbs', data);
    })
    .catch(err => {
      next(err);
    });
  }
});



router.post('/myFaves/add/:movieId', (req, res, next) => {

});



module.exports = router;
