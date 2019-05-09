const mongoose = require('mongoose');
const Schema   = mongoose.Schema;


const commentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  rating: {
    type: Number
  },
  forMovie: {
    type: Schema.Types.ObjectId,
    ref: "Movie"
  },
  forActor: {
    type: Schema.Types.ObjectId,
    ref: "Actor"
  },
  forPlaylist: {
    type: Schema.Types.ObjectId,
    ref: "Playlist"
  },
  comment: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const CommentModel = mongoose.model('Comment', commentSchema);
module.exports = CommentModel;
