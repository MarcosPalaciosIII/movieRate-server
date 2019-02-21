const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const Movies   = require('./Movies');
const Actors   = require('./Actors');
const PlayList = require('./MoviePlaylist');

const userSchema = new Schema({
  username: {type: String},
  password: {type: String},
  loggedIn: {type: Boolean},
  email: {type: String},
  avatar: {type: String},
  favMovie: {type: [Schema.Types.ObjectId], ref: 'Movies'},
  favActors: {type: [Schema.Types.ObjectId], ref: 'Actors'},
  playlist: {type: [Schema.Types.ObjectId], ref: 'PlayList'},
  hashedConfirm: {type: String},
  status: {type: String, enum: ["Pending", "Confirmed"]}
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
