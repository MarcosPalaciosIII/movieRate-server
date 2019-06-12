const express = require('express');
const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Movie = require('../models/Movies');
const Playlist = require('../models/MoviePlaylist');
const Comment = require('../models/Comments');



// route to view list of all playlists
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



// route to create a playlist
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



// route to view playlist details
router.get('/details/:playlistId', (req, res, next) => {
  Playlist.findById(req.params.playlistId).populate('author').populate('moviesList').populate({path : 'comments', populate : {path : 'author'}})
  .then(playlistFromDb => {
    var theUserRating = 0;
    var isDeletable = false;
    playlistFromDb.comments.forEach(oneComment => {
      theUserRating += Number(oneComment.rating);
      if(String(oneComment.author._id) === String(req.user._id)) {
        oneComment.editable = true;
      } else {
        oneComment.editable = false;
      }
      // console.log("the user rating ============== ", oneComment, "------- playlist -------- ", playlistFromDb);
    });

    if(playlistFromDb.comments.length !== 0) {
      theUserRating = (theUserRating / playlistFromDb.comments.length).toFixed(1);
    }

    console.log("the playlist info in the details page >>>>>>>>>>>>>>>>>>>>>> ", playlistFromDb.author._id, req.user._id);
    if(String(playlistFromDb.author._id) === String(req.user._id)) {
      isDeletable = true;
    }

    data = {
      playlist: playlistFromDb,
      pageTitle: playlistFromDb.title,
      userRating: theUserRating,
      deletable: isDeletable
    };
    // console.log("the rating info _____  theUserRating >> ", theUserRating, typeof(theUserRating), "playlist comment length >>>> ", playlistFromDb.comments.length, typeof(playlistFromDb.comments.length), "the results >>>>>>>>>>>>>>>>>>>> ", (theUserRating / playlistFromDb.comments.length).toFixed(1));
    console.log("the data for the playlist being passed for details page ====================== ", data);
    res.render('playlist/details', data);
  })
  .catch(err => {
    next(err);
  });
});


// route to delete a playlist
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


// route to add movie to playlist
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


// route to add comment to playlist
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



// route to remove a movie from Playlist
router.post('/deleteFromPlaylist/:movieId/:playlistId', (req,res, next) => {
  console.log("the info being passed from the req. params, movie id >>>>>>>>>>>>>>>> ", req.params.movieId, "playlist id >>>>>> ", req.params.playlistId);
    Playlist.findById(req.params.playlistId)
    .then(playlistFromDb => {
      console.log("the playlist prior to deleting movie -------------------- ", playlistFromDb);
      playlistFromDb.moviesList.pull(req.params.movieId);
      playlistFromDb.save()
      .then(updatedPlaylist => {
        console.log("Saved playlist after deleting a movie ================= ", updatedPlaylist);
        res.redirect('back');
      }).catch(err => next(err));
    }).catch(err => next(err));
});



// delete comment from playlist route
router.post('/deleteCommentFromPlaylist/:commentId/:playlistId', (req, res, next) => {
  Playlist.findById(req.params.playlistId)
  .then(playlistFromDb => {
    playlistFromDb.comments.pull(req.params.commentId);
    playlistFromDb.save()
    .then(updatedPlaylist => {
      Comment.findByIdAndRemove(req.params.commentId)
      .then(() => {
        res.redirect('back');
      }).catch(err => next(err));
    }).catch(err => next(err));
  }).catch(err => next(err));
});



// route to edit a comment in the playlist
router.post('/editComment/:commentId/', (req, res, next) => {
  console.log("updated playlist comment ------------------ ", req.body);
  Comment.findByIdAndUpdate(req.params.commentId, req.body)
  .then(updatedComment => {
    console.log("this is the playlist comment after updating it >>>>>>>>>>>>>> ", updatedComment);
    res.redirect('back');
  }).catch(err => next(err));
});



module.exports = router;
