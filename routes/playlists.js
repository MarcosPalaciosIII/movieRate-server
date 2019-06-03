const express = require('express');
const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Movie = require('../models/Movies');
const Playlist = require('../models/MoviePlaylist');
const Comment = require('../models/Comments');



router.get('/list', (req, res, next) => {
  if (req.user === undefined) {
    res.redirect("/auth/login");
    return;
  }

  Playlist.find({publicPlaylist: true})
  .then(playlistsFromDb => {
    let publicArray = [];
    // playlistsFromDb.forEach(oneList => {
    //   console.log("one list ---------- ", oneList.publicPlaylist);
    //   if(oneList.publicPlaylist) {
    //     publicArray.push(oneList);
    //   }
    // });
    data = {
      playlist: playlistsFromDb,
      pageTitle: "Playlists"
    };
    // console.log("playlists from DB =======>> ", playlistsFromDb);
    res.render('playlist/list.hbs', data);
  })
  .catch(err => {
    next(err);
  });
});



router.post('/create', (req, res, next) => {
  // console.log("this is the req.body of the playlist >>>>>>>>>>>>>>>>> ", typeof(req.body.titleInput));

  if(req.body.titleInput === "" || req.body.publicInput === undefined) {
    User.findById(req.user._id).populate("playlists")
    .then(userFromDb => {
      data = {
        pageTitle: `${userFromDb.username}'s playlists`,
        userPlaylists: userFromDb.playlists,
        errorMessage: "Fields with * are required"
      };
      // console.log("these are the users playlists ------------------ ", userFromDb.playlists);
      res.render('playlist/userPlaylist.hbs', data);
    })
    .catch(err => {
      next(err);
    });
  } else {
    const newPlaylist = new Playlist({
      author: req.user._id,
      title: req.body.titleInput,
      movieList: [],
      description: req.body.descriptionInput,
      comments: [],
      publicPlaylist: req.body.publicInput
    });

    newPlaylist.save()
    .then(newPlaylistFromDb => {
      // console.log("the newly created playlist ---------- ", newPlaylistFromDb);
      req.user.playlists.push(newPlaylistFromDb._id);
      req.user.save()
      .then(() => {
        res.redirect(`/user/playlists/${req.user.username}`);
      })
      .catch(err => {
        next(err);
      });
    })
    .catch(err =>  {
      next(err);
    });
  }
});


router.get('/details/:playlistId', (req, res, next) => {
  Playlist.findById(req.params.playlistId).populate('moviesList').populate({path : 'comments', populate : {path : 'author'}})
  .then(playlistFromDb => {
    var theUserRating = 0;
    playlistFromDb.comments.forEach(oneComment => {
      theUserRating += Number(oneComment.rating);
      console.log("the user rating ============== ", oneComment, playlistFromDb);
    });
    data = {
      playlist: playlistFromDb,
      pageTitle: playlistFromDb.title,
      userRating: (theUserRating / playlistFromDb.comments.length).toFixed(1)
    };
    res.render('playlist/details', data);
  })
  .catch(err => {
    next(err);
  });
});



router.post('/delete/:playlistId', (req, res, next) => {
  // console.log("deleting movie ========= ", req.params.playlistId);
  req.user.playlists.pull(req.params.playlistId);
  req.user.save()
  .then(updatedUser => {
    Playlist.findByIdAndRemove(req.params.playlistId)
    .then(() => {
      res.redirect(`/user/playlists/${req.user.username}`);
    })
    .catch(err => {
      next(err);
    });
  })
  .catch(err => {
    next(err);
  });
});



router.post('/addToPlaylist/:playlistId/:movieId', (req, res, next) => {
  Movie.findOne({'tmdbId': `${req.params.movieId}`})
  .then(movieFromDb => {
    if(movieFromDb) {
      console.log("1 found movie in db ------------ ", movieFromDb);
      Playlist.findById(req.params.playlistId)
      .then(playlistFromDb => {
        console.log("2 playlist found in db ------------ >>>> ", playlistFromDb, movieFromDb._id);
        var contains = false;
        playlistFromDb.moviesList.forEach(oneMovie => {
          if(JSON.stringify(oneMovie) === JSON.stringify(movieFromDb._id)) {
            contains = true;
          }
        });
        if(contains) {
          console.log("3 playist includes the movie already <<<<<<<<<<<<<<<<<<<<");
          res.redirect('back');
        } else {
          console.log("4 this movie was not found in the playlist <<<<<<<<<<<<<<<<<<", movieFromDb);
          playlistFromDb.moviesList.push(movieFromDb._id);
          playlistFromDb.save()
          .then(updatedPlaylist => {
            console.log("5 the playlist has been updated ================== ", updatedPlaylist);
            res.redirect('back');
          }).catch(err => next(err));
        }
      }).catch(err => next(err));
    } else {
      console.log("1.5 movie not found in DB, preparing to create <<<<<<<<<<<<<<<<<<<< ");
      Movie.create(req.body)
      .then(newMovie => {
        console.log("2.5 Movie has been created and added to db >>>>>>>>>>>>>>>>>>>>>> ", newMovie);
        Playlist.findById(req.params.playlistId)
        .then(playlistFromDb => {
          console.log("3.5 playlist found and adding new movie to it after adding movie to db <<<<<<<<<<<<<<<<<<<< ", playlistFromDb);
          playlistFromDb.moviesList.push(newMovie._id);
          playlistFromDb.save()
          .then(updatedPlaylist => {
            console.log("4.5 Playlist updated with newly created movie <<<<<<<<<<<<<<<<< >>>>>>>>>>>>>>>> ", updatedPlaylist);
            res.redirect('back');
          }).catch(err => next(err));
        }).catch(err => next(err));
      }).catch(err => next(err));
    }
  }).catch(err => next(err));
});



router.post('/addComment/:playlistId', (req, res, next) => {
  console.log("this is the req body when adding a comment to a playlist >>>>>>>>>>>>>>>>>>>>>> ", req.body, "the playlist id -------- ", req.params.playlistId);
  const newComment = new Comment(req.body);
  newComment.author = req.user._id;
  newComment.forPlaylist = req.params.playlistId;
  newComment.save()
  .then(newComment => {
    Playlist.findById(req.params.playlistId)
    .then(playlistFromDB => {
      playlistFromDB.comments.push(newComment._id);
      playlistFromDB.save()
      .then(updatedPlaylist => {
        console.log("the updated playlist after adding comment <<><<><><>><>><<><><>><><>< ", updatedPlaylist);
        res.redirect('back');
      }).catch(err => next(err));
    }).catch(err => next(err));
  }).catch(err => next(err));
});


module.exports = router;
