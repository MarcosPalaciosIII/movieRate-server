const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true; });
const Schema   = mongoose.Schema;


const movieSchema = new Schema({
  title: {
    type: String
  },
  tmdbId: {
    type: String
  },
  comments: {
    type: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
  },
  imageUrl: {
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
