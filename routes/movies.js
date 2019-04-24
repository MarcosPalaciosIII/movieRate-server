const express = require('express');
const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const MovieModel = require('../models/Movies');
const CommentModel = require('../models/Comments');
const apiKey = process.env.API_KEY;

const genres = [
    {id: 28, name: "Action"},
    {id: 12, name: "Adventure"},
    {id: 16, name: "Animation"},
    {id: 35, name: "Comedy"},
    {id: 80, name: "Crime"},
    {id: 99, name: "Documentary"},
    {id: 18, name: "Drama"},
    {id: 10751, name: "Family"},
    {id: 14, name: "Fantasy"},
    {id: 36, name: "History"},
    {id: 27, name: "Horror"},
    {id: 10402, name: "Music"},
    {id: 9648, name: "Mystery"},
    {id: 10749, name: "Romance"},
    {id: 878, name: "Science Fiction"},
    {id: 10770, name: "TV Movie"},
    {id: 53, name: "Thriller"},
    {id: 10752, name: "War"},
    {id: 37, name: "Western"}
  ];


// route for popular list of movies
router.get('/popular/:page', (req, res, next) => {
  console.log(" >>>>> running /movies/popular route <<<<<<");
  axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${req.params.page}`)
  .then(popularMovies => {
    movieArray = [];

    popularMovies.data.results.forEach(oneMovie => {
      genreArray = [];
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>> ", oneMovie.title);
      oneMovie.genre_ids.forEach(genreId => {
        genres.forEach(genre => {
          if(genreId === genre.id) {
            genreArray.push(genre.name);
            return;
          }
        });
      });
      if(!oneMovie.poster_path) {
        oneMovie.poster_path = "/images/movie-reel.png";
      } else {
        oneMovie.poster_path = `https://image.tmdb.org/t/p/w200${oneMovie.poster_path}`;
      }
      oneMovie.genre_ids = genreArray;
      movieArray.push(oneMovie);
    });
    console.log("=========================== ", popularMovies.data.results);
    data = {
      pageTitle: "Popular Movies",
      // theLIst: popularMovies.data.results
      theList: movieArray,
      pageLink: '/movies/popular/',
      previousPage:(parseInt(req.params.page) - 1) > 0 ? parseInt(req.params.page) - 1 : false,
      page: req.params.page,
      nextPageOne:(parseInt(req.params.page) + 1) < popularMovies.data.total_pages ? parseInt(req.params.page) + 1 : false,
      nextPageTwo:(parseInt(req.params.page) + 2) < popularMovies.data.total_pages ? parseInt(req.params.page) + 2 : false,
      nextPageThree: (parseInt(req.params.page) + 3) < popularMovies.data.total_pages ? parseInt(req.params.page) + 3 : false,
      lastPage: popularMovies.data.total_pages
    };
    // console.log(">>>>>>>>>>>>>>>>>>>> ", data, data.theList[0].genre_ids);
    // console.log("================= ", popularMovies.data.total_results, popularMovies.data.total_pages);
    console.log(">>>>>>>>>>>>>>> ", data.previousPage);
    res.render('movies/list.hbs', data );
  })
  .catch(err => {
    next(err);
  });
});



// route for details page for movies
router.get('/details/:movieId', (req, res, next) => {
  axios.get(`https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${apiKey}&language=en-US`)
  .then(movieDetails => {
    axios.get(`https://api.themoviedb.org/3/movie/${req.params.movieId}/videos?api_key=${apiKey}`)
    .then(videoDetails => {
      axios.get(`https://api.themoviedb.org/3/movie/${req.params.movieId}/credits?api_key=${apiKey}&language=en-US`)
      .then(castDetails => {
        axios.get(`https://api.themoviedb.org/3/movie/${req.params.movieId}/recommendations?api_key=${apiKey}&language=en-US`)
        .then(recommendedList => {
          axios.get(`https://api.themoviedb.org/3/movie/${req.params.movieId}/release_dates?api_key=${apiKey}&language=en-US`)
          .then(movieRating => {
            // console.log(">>>>>>>>>>>>> ", castDetails.data.cast);
            console.log("movie rating ---------------- >", movieRating.data.results);
            var mpaaRating;
            if(movieRating.data.results.filter(rating => rating.iso_3166_1 === "US").iso_3166_1 === "US") {
              mpaaRating = movieRating.data.results.filter(rating => rating.iso_3166_1 === "US")[0].release_dates[0].certification;
            } else {
              mpaaRating = "Unknown";
            }
            var vidDetails = [];
            var castArray = [];
            console.log("mpaaRating rating >>>>>>>>>>>>>>>> ", mpaaRating);
            videoDetails.data.results.forEach(oneSite => {
              // console.log(";:::::::::::::::::::::: ", oneSite);
              // if(oneSite.site === "YouTube" && oneSite.type === "Trailer") {
                if(oneSite.site === "YouTube" && oneSite.type === "Trailer" || oneSite.type === "Teaser") {
                  vidDetails.push(oneSite);
                  // vidDetails = oneSite;
                }
              });

              castDetails.data.cast.forEach((oneCast,i) => {
                if(!oneCast.profile_path) {
                  console.log("------------- ", oneCast);
                  castDetails.data.cast[i].profile_path = "/images/movies-oscar-icon.png";
                } else {
                  castDetails.data.cast[i].profile_path = `https://image.tmdb.org/t/p/w200${castDetails.data.cast[i].profile_path}`;
                }
              });
              for(let i = 0; i < 5; i++) {
                castArray.push(castDetails.data.cast[Math.floor(Math.random() * castDetails.data.cast.length)]);
              }
              // console.log("======================= ", movieDetails.data);
              // console.log(">>>>>>>>>>>>>>>>>>>>>>> ", videoDetails.data);
              // console.log("----------------------- ", castDetails.data.cast);

              data = {
                movieDetail: movieDetails.data,
                videoDetail: vidDetails,
                recommended: recommendedList.data.results,
                cast: castArray,
                movieRating: mpaaRating
              };

              // console.log("-------------------- ", data);

              res.render('movies/details.hbs', data);
          })
          .catch(err => {
            next(err);
          });
        })
        .catch(err => {
          next(err);
        });
      })
      .catch(err => {
        next(err);
      });
    })
    .catch(err => {
      next(err);
    });
  })
  .catch(err => {
    next(err);
  });
});



// route for full cast from movie
router.get('/:movieId/:movieTitle/cast', (req, res, next) => {
  axios.get(`https://api.themoviedb.org/3/movie/${req.params.movieId}/credits?api_key=${apiKey}&language=en-US`)
  .then(castDetails => {

    castDetails.data.cast.forEach((oneCast,i) => {
      if(!oneCast.profile_path) {
        console.log("------------- ", oneCast, i);
        castDetails.data.cast[i].profile_path = "/images/movies-oscar-icon.png";
      } else {
        castDetails.data.cast[i].profile_path = `https://image.tmdb.org/t/p/w200${castDetails.data.cast[i].profile_path}`;
      }
    });

    data = {
      pageTitle: req.params.movieTitle,
      movieId: req.params.movieId,
      cast: castDetails.data.cast
    };
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", data);
    res.render('movies/cast.hbs', data);
  })
  .catch(err => {
    next(err);
  });
});




// route for top rated list of movies
router.get('/top-rated/:page', (req, res, next) => {
  console.log(" >>>>> running /movies/top-rated route <<<<<<");
  axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=${req.params.page}`)
  .then(popularMovies => {
    movieArray = [];

    popularMovies.data.results.forEach(oneMovie => {
      genreArray = [];
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>> ", oneMovie.title);
      oneMovie.genre_ids.forEach(genreId => {
        genres.forEach(genre => {
          if(genreId === genre.id) {
            genreArray.push(genre.name);
            return;
          }
        });
      });
      if(!oneMovie.poster_path) {
        oneMovie.poster_path = "/images/movie-reel.png";
      } else {
        oneMovie.poster_path = `https://image.tmdb.org/t/p/w200${oneMovie.poster_path}`;
      }
      oneMovie.genre_ids = genreArray;
      movieArray.push(oneMovie);
    });
    // console.log("=========================== ", popularMovies.data.results);
    data = {
      pageTitle: "Top Rated Movies",
      // theLIst: popularMovies.data.results
      theList: movieArray,
      pageLink: '/movies/top-rated/',
      previousPage: (parseInt(req.params.page) - 1) > 0 ? parseInt(req.params.page) - 1 : false,
      page: req.params.page,
      nextPageOne:(parseInt(req.params.page) + 1) < popularMovies.data.total_pages ? parseInt(req.params.page) + 1 : false,
      nextPageTwo:(parseInt(req.params.page) + 2) < popularMovies.data.total_pages ? parseInt(req.params.page) + 2 : false,
      nextPageThree: (parseInt(req.params.page) + 3) < popularMovies.data.total_pages ? parseInt(req.params.page) + 3 : false,
      lastPage: popularMovies.data.total_pages
    };
    // console.log(">>>>>>>>>>>>>>>>>>>> ", data, data.theList[0].genre_ids);
    // console.log("================= ", popularMovies.data.total_results, popularMovies.data.total_pages);
    console.log(">>>>>>>>>>>>>>> ", data.previousPage);
    res.render('movies/list.hbs', data );
  })
  .catch(err => {
    next(err);
  });
});



// Search route for movies
router.post("/search/:page", (req, res, next) => {
  // if(req.params.query === "trigger123") {
  //   res.redirect(`/movies/search/1/${req.body.searchInput}`);
  // }
  axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${req.body.searchInput}&language=en-US&page=${req.params.page}&include_adult=false`)
  .then(searchResults => {
    movieArray = [];

    console.log("=========================== ", searchResults.data.results);
    searchResults.data.results.forEach(oneMovie => {
      genreArray = [];
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>> ", oneMovie.title);
      oneMovie.genre_ids.forEach(genreId => {
        genres.forEach(genre => {
          if(genreId === genre.id) {
            genreArray.push(genre.name);
            return;
          }
        });
      });
      if(!oneMovie.poster_path) {
        oneMovie.poster_path = "/images/movie-reel.png";
      } else {
        oneMovie.poster_path = `https://image.tmdb.org/t/p/w200${oneMovie.poster_path}`;
      }
      oneMovie.genre_ids = genreArray;
      movieArray.push(oneMovie);
    });

    // var searchQuery = req.body.searchInput;
    data = {
      pageTitle: `Results for: ${req.body.searchInput}`,
      // theLIst: searchResults.data.results
      theList: movieArray,
      pageLink: '/movies/search/',
      searchQuery: `${req.body.searchInput}/`,
      previousPage: (parseInt(req.params.page) - 1) > 0 ? parseInt(req.params.page) - 1 : false,
      page: req.params.page,
      nextPageOne:(parseInt(req.params.page) + 1) < searchResults.data.total_pages ? parseInt(req.params.page) + 1 : false,
      nextPageTwo:(parseInt(req.params.page) + 2) < searchResults.data.total_pages ? parseInt(req.params.page) + 2 : false,
      nextPageThree: (parseInt(req.params.page) + 3) < searchResults.data.total_pages ? parseInt(req.params.page) + 3 : false,
      lastPage: searchResults.data.total_pages
    };
    // console.log(">>>>>>>>>>>>>>>>>>>> ", data, data.theList[0].genre_ids);
    // console.log("================= ", popularMovies.data.total_results, popularMovies.data.total_pages);
    console.log(">>>>>>>>>>>>>>> ", data.previousPage);
    res.render('movies/list.hbs', data );
  })
  .catch(err => {
    next(err);
  });
});



// Search route for movies when switching pages
router.get("/search/:query/:page", (req, res, next) => {
  // if(req.params.query === "trigger123") {
  //   res.redirect(`/movies/search/1/${req.body.searchInput}`);
  // }
  axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${req.params.query}&language=en-US&page=${req.params.page}&include_adult=false`)
  .then(searchResults => {
    movieArray = [];

    console.log("=========================== ", searchResults.data.results);
    searchResults.data.results.forEach(oneMovie => {
      genreArray = [];
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>> ", oneMovie.title);
      oneMovie.genre_ids.forEach(genreId => {
        genres.forEach(genre => {
          if(genreId === genre.id) {
            genreArray.push(genre.name);
            return;
          }
        });
      });
      if(!oneMovie.poster_path) {
        oneMovie.poster_path = "/images/movie-reel.png";
      } else {
        oneMovie.poster_path = `https://image.tmdb.org/t/p/w200${oneMovie.poster_path}`;
      }
      oneMovie.genre_ids = genreArray;
      movieArray.push(oneMovie);
    });

    // var searchQuery = req.body.searchInput;
    data = {
      pageTitle: `Results for: ${req.params.query}`,
      // theLIst: searchResults.data.results
      theList: movieArray,
      pageLink: '/movies/search/',
      searchQuery: `${req.params.query}/`,
      previousPage: (parseInt(req.params.page) - 1) > 0 ? parseInt(req.params.page) - 1 : false,
      page: req.params.page,
      nextPageOne:(parseInt(req.params.page) + 1) < searchResults.data.total_pages ? parseInt(req.params.page) + 1 : false,
      nextPageTwo:(parseInt(req.params.page) + 2) < searchResults.data.total_pages ? parseInt(req.params.page) + 2 : false,
      nextPageThree: (parseInt(req.params.page) + 3) < searchResults.data.total_pages ? parseInt(req.params.page) + 3 : false,
      lastPage: searchResults.data.total_pages
    };
    // console.log(">>>>>>>>>>>>>>>>>>>> ", data, data.theList[0].genre_ids);
    // console.log("================= ", popularMovies.data.total_results, popularMovies.data.total_pages);
    console.log(">>>>>>>>>>>>>>> ", data.previousPage);
    res.render('movies/list.hbs', data );
  })
  .catch(err => {
    next(err);
  });
});



module.exports = router;