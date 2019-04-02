const mongoose = require('mongoose');
const Schema   = mongoose.Schema;


const commentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId
  },
  rating: {
    type: Number
  },
  forMovie: {
    type: Schema.Types.ObjectId
  },
  forActor: {
    type: Schema.Types.ObjectId
  },
  forPlaylist: {
    type: Schema.Types.ObjectId
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
