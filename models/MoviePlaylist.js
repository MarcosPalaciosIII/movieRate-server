const mongoose = require('mongoose');
const Schema   = mongoose.Schema;


const playListSchema = new Schema({
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

const PlaylistModel = mongoose.model('Playlist', playListSchema);
module.exports = PlaylistModel;
