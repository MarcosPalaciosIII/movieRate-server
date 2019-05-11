const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true; });
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
    type: [{type: Schema.Types.ObjectId, ref: "Movie"}]
  },
  description: {
    type: String
  },
  comments: {
    type: [{type: Schema.Types.ObjectId, ref: "Comment"}]
  },
  publicPlaylist: {
    type: Boolean,
    required: [true, "Is this playlist public or private?"]
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const PlaylistModel = mongoose.model('Playlist', playListSchema);
module.exports = PlaylistModel;
