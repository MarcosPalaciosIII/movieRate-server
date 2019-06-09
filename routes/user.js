const express = require('express');
// const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Movie = require('../models/Movies');
const Playlist = require('../models/MoviePlaylist');
const Comment = require('../models/Comments');



// route to view user profile
router.get('/profile', (req, res, next) => {

  if(req.user === undefined) {
    res.redirect('/auth/login');
  }
    data = {
      pageTitle: `${req.user.username}'s Profile`
    };

    res.render('user/profile.hbs', data);
});



// route to find playlists belonging to the user
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


// route to add movie to user favorites
router.post('/myFaves/add/:movieId', (req, res, next) => {
  console.log("0 adding to fave list <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ", req.params.movieId, "---------------", req.user);
  Movie.findOne({'tmdbId': `${req.params.movieId}`})
  .then(movieFromDb => {
    if(movieFromDb) {
      console.log("1 found movie in db ------------ ", movieFromDb);
      // Playlist.findById(req.params.playlistId)
      // .then(playlistFromDb => {
        // console.log("2 playlist found in db ------------ >>>> ", playlistFromDb, movieFromDb._id);
        var contains = false;
        req.user.favMovies.forEach(oneMovie => {
          if(JSON.stringify(oneMovie) === JSON.stringify(movieFromDb._id)) {
            contains = true;
          }
        });
        if(contains) {
          console.log("2 playist includes the movie already <<<<<<<<<<<<<<<<<<<<");
          res.redirect('back');
        } else {
          console.log("3 this movie was not found in the playlist <<<<<<<<<<<<<<<<<<", movieFromDb, ">>>>>>>>>>>>>> ", req.user);
          req.user.favMovies.push(movieFromDb._id);
          req.user.save()
          .then(updatedUser => {
            console.log("4 the playlist has been updated ================== ", updatedUser);
            res.redirect('back');
          }).catch(err => next(err));
        }
      // }).catch(err => next(err));
    } else {
      console.log("1.5 movie not found in DB, preparing to create <<<<<<<<<<<<<<<<<<<< ");
      Movie.create(req.body)
      .then(newMovie => {
        console.log("2.5 Movie has been created and added to db >>>>>>>>>>>>>>>>>>>>>> ", newMovie);
        // Playlist.findById(req.params.playlistId)
        // .then(playlistFromDb => {
          // console.log("3.5 playlist found and adding new movie to it after adding movie to db <<<<<<<<<<<<<<<<<<<< ", playlistFromDb);
          req.user.favMovies.push(newMovie._id);
          req.user.save()
          .then(updatedUser => {
            console.log("3.5 Playlist updated with newly created movie <<<<<<<<<<<<<<<<< >>>>>>>>>>>>>>>> ", updatedUser);
            res.redirect('back');
          }).catch(err => next(err));
        // }).catch(err => next(err));
      }).catch(err => next(err));
    }
  }).catch(err => next(err));
});



module.exports = router;
