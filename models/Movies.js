const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true; });
const Schema   = mongoose.Schema;


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
  // cast: {
  //   type: [{type: Schema.Types.ObjectId, ref: 'Actor'}]
  // },
  genre: {
    type: String
  },
  reviews: {
    type: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
  },
  previewLink: {
    type: [String]
  },
  // director: {
  //   type: [{type: Schema.Types.ObjectId, ref: 'Actor'}]
  // }
  tmdbId: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const MovieModel = mongoose.model('Movie', movieSchema);
module.exports = MovieModel;
