const mongoose = require('mongoose');
const Schema   = mongoose.Schema;


const actorSchema = new Schema({
  firstName: {
    type: String
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String
  },
  reviews: {
    type: [Schema.Types.ObjectId],
    ref: "Comment"
  },
  movies: [
    { type: Schema.Types.ObjectId }
  ],
  bio: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Actor = mongoose.model('Actor', movieSchema);
module.exports = Actor;
