const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const Actors   = require('./Actors');
const Comments = require('./Comments');

const movieSchema = new Schema({
  title: {
    type: String
  },
  runtime: {
    type: Number
  },
  description: {
    type: String
  },
  rating: {
    type: Number
  },
  userRating: {
    type: Number
  },
  mpaaRating: {
    type: String
  },
  cast: {
    type: [{type: Schema.Types.ObjectId}],
    ref: 'Actors'
  },
  genre: {
    type: String
  },
  reviews: {
    type: [Schema.Types.ObjectId],
    ref: 'Comments'
  },
  previewLink: {
    type: [String]
  },
  director: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
