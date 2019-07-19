const express = require('express');
const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const Movie = require('../models/Movies');
const Comment = require('../models/Comments');
const apiKey = process.env.API_KEY;
const Playlist = require('../models/MoviePlaylist');
const User = require('../models/User');

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
  var movieComments = false;
  var theMovieInDb;
  var movieFoundInDb = false;
  var theUserRating = 0;
  var commentAdd = true;
  Movie.findOne({tmdbId: req.params.movieId}).populate('comments').populate({path : 'comments', populate : {path : 'author'}})
  .then(movieFromDb => {
    theMovieInDb = movieFromDb;
    // var userRatingResults = 0;
    var counter = 0;


    // console.log("checking for movie in db =========================== ", movieFromDb, movieFromDb.length);
    if(movieFromDb) {

      console.log("the movie info is not null >>>>>>>>>>>>>>> ", movieFromDb);
      movieFoundInDb = true;
      // if(movieFromDb.comments.length > 0) {
      if(movieFromDb.comments) {
        // console.log("found comments for the movie -------------------- ", movieFromDb.comments[0].rating);
        // movieComments = movieFromDb.comments;
        // for(let i = 0; i < movieComments.length; i++) {
        //   // if (movieComments[i].rating) {
        //   theUserRating += movieComments[i].rating;
        //   counter += 1;
        //   // } else {
        //   //   continue;
        //   // }
        // }
      // } else {
      //   userRatingResults = false;
      // }


        if(movieFromDb.comments.length > 0) {
          console.log("the length of the comments array for the movie >>>>--------------- >>>>> ", movieFromDb.comments.length);
          movieComments = true;
          movieFromDb.comments.forEach(oneComment => {
            theUserRating += Number(oneComment.rating);

            console.log("the author info for the comment >>>>>>>>>>>>>>>>>>>>> ", oneComment);
            if(req.user) {
              if(String(oneComment.author._id) === String(req.user._id)) {
                oneComment.editable = true;
                commentAdd = false;
              } else {
                oneComment.editable = false;
              }
            }
            // console.log("the user rating ============== ", oneComment, "------- movie -------- ", movieFromDb);
          });

          // console.log("checking the remainder ---------------------------------------------- ", (theUserRating / movieFromDb.comments.length) % 1 === 0);
          if((theUserRating / movieFromDb.comments.length) === 10 || (theUserRating / movieFromDb.comments.length) % 1 === 0) {
            theUserRating = (theUserRating / movieFromDb.comments.length);
          } else {
            theUserRating = (theUserRating / movieFromDb.comments.length).toFixed(1);
          }
        } else {
          userRatingResults = false;
        }
      }

    }
    // console.log("checking the user ratings result if one exists ................... ", userRatingResults);
    // if(userRatingResults) {
    //   theUserRatings = userRatingResults / counter;
    // }
    console.log("going to the next step after finding movie in db ((((((((((((((((()))))))))))))))))");

  }).catch(err => {
    console.log("got an error looking for movie in db <<<<<<<<<<<<<<<<<<<<< ");
    next(err);
  });

  // console.log("the type of the the id from the movie -------------- ", typeof(req.params.movieId));
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

            var theMovieRating = "Unknown";
            for(let i = 0; i < movieRating.data.results.length; i++) {
              if(movieRating.data.results[i].iso_3166_1 === "US") {
                theMovieRating = movieRating.data.results[i];
              } else {
                continue;
              }
            }

            // console.log("the movie rate object :::::::::::::::::::: ", theMovieRating);
            // console.log("movie rating ---------------- >", movieRating.data.results);
            var mpaaRating = [];
            var writers = [];
            var directors = [];
            // if(movieRating.data.results.filter(rating => rating.iso_3166_1 === "US").iso_3166_1 === "US") {
            //   mpaaRating = movieRating.data.results.filter(rating => rating.iso_3166_1 === "US")[0].release_dates[0].certification;
            // } else {
            //   mpaaRating = "Unknown";
            // }
            if(theMovieRating !== "Unknown") {
              for(let i = 0; i < theMovieRating.release_dates.length; i++) {
                if(!mpaaRating.includes(theMovieRating.release_dates[i].certification) && theMovieRating.release_dates[i].certification !== '') {
                  mpaaRating.push(theMovieRating.release_dates[i].certification);
                }
              }
            } else {
              mpaaRating.push("Unknown");
            }
            var vidDetails = [];
            // var crewArray = [];
            // console.log("mpaaRating rating >>>>>>>>>>>>>>>> ", mpaaRating);
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
                  // console.log("------------- ", oneCast);
                  castDetails.data.cast[i].profile_path = "/images/movies-oscar-icon.png";
                } else {
                  castDetails.data.cast[i].profile_path = `https://image.tmdb.org/t/p/w200${castDetails.data.cast[i].profile_path}`;
                }
              });
              castDetails.data.crew.forEach((oneCast,i) => {
                if(!oneCast.profile_path) {
                  // console.log("------------- ", oneCast);
                  castDetails.data.crew[i].profile_path = "/images/movies-oscar-icon.png";
                } else {
                  castDetails.data.crew[i].profile_path = `https://image.tmdb.org/t/p/w200${castDetails.data.crew[i].profile_path}`;
                }
                if(castDetails.data.crew[i].department === "Directing" && castDetails.data.crew[i].job === "Director") {
                  directors.push(castDetails.data.crew[i]);
                } else if (castDetails.data.crew[i].department === "Writing") {
                  writers.push(castDetails.data.crew[i]);
                }
              });
              directors.forEach((oneDirector, index) => {
                for(let i = 0; i < directors.length; i++) {
                  if(directors[i] === undefined) break;
                  if(index !== i && oneDirector.name === directors.name) {
                    directors[i].splice(i, 1);
                  }
                }
              });

              writers.forEach((oneWriter, index) => {
                for(let i = 0; i < writers.length; i++) {
                  // console.log("the writers info >>>>>>>>>>>>>> ", index, i, oneWriter.name, writers[i].name);
                  if(writers[i] === undefined) {
                    // console.log("break condition triggered ::::::::::::::: ");
                    break;
                  } else if(index === i) {
                    // console.log("continue condition triggered <<<<<<<<<<<<<---------");
                    continue;
                  } else if(oneWriter.name === writers[i].name) {
                    // console.log("If condition triggered <<<<<<<<<<< ");
                    writers.splice(i, 1);
                  }
                }
              });
              // for(let i = 0; i < castDetails.data.cast.length; i++) {
              //   if(castDetails.data.cast[i].department) {
              //     crewArray.push(castDetails.data.cast[i]);
              //   }
              // }

              // castArray.sort((a, b) => {
              //
              // });
              // console.log("======================= ", movieDetails.data);
              // console.log(">>>>>>>>>>>>>>>>>>>>>>> ", videoDetails.data);
              // console.log("----------------------- ", castDetails.data.crew);
              // console.log("the cast array >>>>>>>>>>>>>>>>>> ", crewArray);
              // console.log("the data getting passed for movie >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", data);
              // console.log("the writers ----------------------- >>>>>>>>>> ", writers);
              // console.log("the directors ====================== >>>>>>>>>>> ", directors);

              if(!movieFoundInDb) {
                Movie.create({title: movieDetails.data.title, tmdbId:movieDetails.data.id, imageUrl:`https://image.tmdb.org/t/p/w200${movieDetails.data.poster_path}`})
                .then(newlyCreatedMovie => {
                  console.log("created new movie in DB ================ ", newlyCreatedMovie);

                }).catch(err => next(err));
              }

              data = {
                movieDetail: movieDetails.data,
                videoDetail: vidDetails,
                recommended: recommendedList.data.results,
                cast: castDetails.data.cast.splice(0, 5),
                director: directors.splice(0, 1),
                writer: writers.splice(0, 4),
                crew: castDetails.data.crew,
                movieRating: mpaaRating,
                userPlaylists: false,
                theComments: movieComments,
                theMovieInDb: theMovieInDb,
                userRating: theUserRating,
                canAddComment: commentAdd
              };

              var posterPath = data.movieDetail.poster_path;

              if(!data.movieDetail.poster_path) {
                data.movieDetail.poster_path = "/images/movie-reel.png";
              } else {
                data.movieDetail.poster_path = `https://image.tmdb.org/t/p/w200${posterPath}`;
              }

              // console.log("the data for the movie getting passed to the view page =============>>>> ", data);

              if(req.user) {
                User.findById(req.user._id).populate('playlists')
                .then(theUser => {
                  // console.log("found the user ------ ", theUser);
                  console.log("the movie details from data ========== ", data.userRating);
                  data.userPlaylists = theUser.playlists;
                  res.render('movies/details.hbs', data);
                })
                .catch(err => {
                  // log("finding user for movie details page error ====== ", err);
                  next(err);
                });
              } else {
                // console.log("-------------------- ", data);
                res.render('movies/details.hbs', data);
              }
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
router.get('/cast/:movieId/:movieTitle/cast', (req, res, next) => {
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



// route for full crew from movie
router.get('/crew/:movieId/:movieTitle/cast', (req, res, next) => {
  axios.get(`https://api.themoviedb.org/3/movie/${req.params.movieId}/credits?api_key=${apiKey}&language=en-US`)
  .then(castDetails => {

    castDetails.data.crew.forEach((oneCast,i) => {
      if(!oneCast.profile_path) {
        console.log("------------- ", oneCast, i);
        castDetails.data.crew[i].profile_path = "/images/movies-oscar-icon.png";
      } else {
        castDetails.data.crew[i].profile_path = `https://image.tmdb.org/t/p/w200${castDetails.data.crew[i].profile_path}`;
      }
    });

    data = {
      pageTitle: req.params.movieTitle,
      movieId: req.params.movieId,
      cast: castDetails.data.crew
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



// add comment to movie route
router.post('/addComment/:movieId', (req, res, next) => {
  console.log("Creating comment");
  if(!req.user) {
    res.redirect('/auth/login');
  }
  const newComment = new Comment(req.body);
  newComment.author = req.user._id;
  newComment.forPlaylist = req.params.playlistId;
  newComment.save()
  .then(newComment => {
    console.log("the new comment ----- ", newComment);
    Movie.findById(req.params.movieId)
    .then(movieFromDb => {
      console.log("the movie form db when adding comment =========== ", movieFromDb);
      movieFromDb.comments.push(newComment._id);
      movieFromDb.save()
      .then(updatedMovie => {
        console.log("the updated movie with the new comment >>>>>>>> ", updatedMovie);
        res.redirect('back');
      }).catch(err => next(err));
    }).catch(err => next(err));
  }).catch(err => next(err));
});


// route to edit the comment from a movie
router.post('/editComment/:commentId', (req, res, next) => {
  Comment.findByIdAndUpdate(req.params.commentId, req.body)
  .then(commentFromDb => {
    res.redirect('back');
  }).catch(err => next(err));
});



// route to delete comment from movie and from database
router.post('/deleteCommentFromMoive/:theCommentId/:theMovieId', (req, res, next) => {
  Movie.findById(req.params.theMovieId)
  .then(movieFromDb => {
    movieFromDb.comments.pull(req.params.theCommentId);
    movieFromDb.save()
    .then(updatedMovie => {
      Comment.findByIdAndRemove(req.params.theCommentId)
      .then(() => {
        res.redirect('back');
      }).catch(err => next(err));
    }).catch(err => next(err));
  }).catch(err => next(err));
});



module.exports = router;
