const express = require('express');
const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const ActorModel = require('../models/Actors');
const CommentModel = require('../models/Comments');
const apiKey = process.env.API_KEY;



// popular actor route
router.get('/popular/:page', (req, res, next) => {
  axios.get(`https://api.themoviedb.org/3/person/popular?api_key=${apiKey}&language=en-US&page=${req.params.page}`)
  .then(actorList => {
    var actorArray = [];
    console.log(">>>>>>>>>>>> ", actorList.data.results);
    actorList.data.results.forEach(oneCast => {
      if(!oneCast.profile_path) {
        console.log("------------- ", oneCast);
        oneCast.profile_path = "/images/movies-oscar-icon.png";
      } else {
        oneCast.profile_path = `https://image.tmdb.org/t/p/w200${oneCast.profile_path}`;
      }
      actorArray.push(oneCast);
    });

    data = {
      pageTitle: `Popular Actors`,
      actorList: actorArray,
      pageLink: '/actors/popular/',
      previousPage: (parseInt(req.params.page) - 1) > 0 ? parseInt(req.params.page) - 1 : false,
      page: req.params.page,
      nextPageOne:(parseInt(req.params.page) + 1) < actorList.data.total_pages ? parseInt(req.params.page) + 1 : false,
      nextPageTwo:(parseInt(req.params.page) + 2) < actorList.data.total_pages ? parseInt(req.params.page) + 2 : false,
      nextPageThree: (parseInt(req.params.page) + 3) < actorList.data.total_pages ? parseInt(req.params.page) + 3 : false,
      lastPage: actorList.data.total_pages
    };
    res.render('actors/list.hbs', data);
  })
  .catch(err => {
    next(err);
  });
});



// detail route for actors
router.get('/details/:actorId', (req, res, next) => {
  axios.get(`https://api.themoviedb.org/3/person/${req.params.actorId}?api_key=${apiKey}&language=en-US`)
  .then(actorDetail => {
    axios.get(`https://api.themoviedb.org/3/person/${req.params.actorId}/movie_credits?api_key=${apiKey}&language=en-US`)
    .then(actorMovieList => {
      console.log("===========>>>>>>>>>> ", actorDetail.data);
      actorMovieList.data.cast.forEach((oneCast,i) => {
        if(!oneCast.poster_path) {
          actorMovieList.data.cast[i].poster_path = "/images/movie-reel.png";
        } else {
          actorMovieList.data.cast[i].poster_path = `https://image.tmdb.org/t/p/w200${actorMovieList.data.cast[i].poster_path}`;
        }
        // console.log("------------- ", oneCast);
      });

      if(!actorDetail.data.profile_path){
        actorDetail.data.profile_path = '/images/movies-oscar-icon.png';
      } else {
        actorDetail.data.profile_path = `https://image.tmdb.org/t/p/w200${actorDetail.data.profile_path}`;
      }

      data = {
        actor: actorDetail.data,
        movies: actorMovieList.data.cast
      };
      console.log("::::::::::::::::::::::::::: ", data);
      res.render('actors/details.hbs', data);
    })
    .catch(err => {
      next(err);
    });
  })
  .catch(err => {
    next(err);
  });
});



// search route for actors
router.post('/search/:page', (req, res, next) => {
  axios.get(`https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${req.body.searchInput}&language=en-US&page=${req.params.page}&include_adult=false`)
  .then(searchResults => {
    var actorArray = [];
    console.log(">>>>>>>>>>>> ", searchResults.data.results);
    searchResults.data.results.forEach(oneCast => {
      if(!oneCast.profile_path) {
        console.log("------------- ", oneCast);
        oneCast.profile_path = "/images/movies-oscar-icon.png";
      } else {
        oneCast.profile_path = `https://image.tmdb.org/t/p/w200${oneCast.profile_path}`;
      }
      actorArray.push(oneCast);
    });

    data = {
      pageTitle: `Results for: ${req.body.searchInput}`,
      actorList: actorArray,
      pageLink: '/actors/search/',
      searchQuery: `${req.body.searchInput}/`,
      previousPage: (parseInt(req.params.page) - 1) > 0 ? parseInt(req.params.page) - 1 : false,
      page: req.params.page,
      nextPageOne:(parseInt(req.params.page) + 1) < searchResults.data.total_pages ? parseInt(req.params.page) + 1 : false,
      nextPageTwo:(parseInt(req.params.page) + 2) < searchResults.data.total_pages ? parseInt(req.params.page) + 2 : false,
      nextPageThree: (parseInt(req.params.page) + 3) < searchResults.data.total_pages ? parseInt(req.params.page) + 3 : false,
      lastPage: searchResults.data.total_pages
    };
    res.render('actors/list.hbs', data);
  })
  .catch(err => {
    next(err);
  });
});



// search route for actors when switching pages
router.get('/search/:query/:page', (req, res, next) => {
  axios.get(`https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${req.params.query}&language=en-US&page=${req.params.page}&include_adult=false`)
  .then(searchResults => {
    var actorArray = [];
    console.log(">>>>>>>>>>>> ", searchResults.data.results);
    searchResults.data.results.forEach(oneCast => {
      if(!oneCast.profile_path) {
        console.log("------------- ", oneCast);
        oneCast.profile_path = "/images/movies-oscar-icon.png";
      } else {
        oneCast.profile_path = `https://image.tmdb.org/t/p/w200${oneCast.profile_path}`;
      }
      actorArray.push(oneCast);
    });

    data = {
      pageTitle: `Results for: ${req.params.query}`,
      actorList: actorArray,
      pageLink: '/actors/search/',
      searchQuery: `${req.params.query}/`,
      previousPage: (parseInt(req.params.page) - 1) > 0 ? parseInt(req.params.page) - 1 : false,
      page: req.params.page,
      nextPageOne:(parseInt(req.params.page) + 1) < searchResults.data.total_pages ? parseInt(req.params.page) + 1 : false,
      nextPageTwo:(parseInt(req.params.page) + 2) < searchResults.data.total_pages ? parseInt(req.params.page) + 2 : false,
      nextPageThree: (parseInt(req.params.page) + 3) < searchResults.data.total_pages ? parseInt(req.params.page) + 3 : false,
      lastPage: searchResults.data.total_pages
    };
    res.render('actors/list.hbs', data);
  })
  .catch(err => {
    next(err);
  });
});


module.exports = router;
