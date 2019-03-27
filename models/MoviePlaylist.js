const mongoose = require('mongoose');
const Schema   = mongoose.Schema;


const playlistSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  title: {
    type: String
  },
  moviesList: {
    type: [Schema.Types.ObjectId],
    ref: "Movie"
  },
  description: {
    type: String
  },
  comments: {
    type: [Schema.Types.ObjectId],
    ref: "Comment"
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Playlist = mongoose.model('Playlist', movieSchema);
module.exports = Playlist;
