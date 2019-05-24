const express = require('express');
const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Movie = require('../models/Movies');
const Playlist = require('../models/MoviePlaylist');
const CommentModel = require('../models/Comments');



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
  Playlist.findById(req.params.playlistId)
  .then(playlistFromDb => {
    data = {
      playlist: playlistFromDb,
      pageTitle: playlistFromDb.title
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






module.exports = router;
