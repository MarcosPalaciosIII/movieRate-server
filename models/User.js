const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const Movies   = require('./Movies');
const Actors   = require('./Actors');
const PlayList = require('./MoviePlaylist');

const userSchema = new Schema({

  username: {
    type: String,
    required: [true, "Must choose a username"],
    unique: true
  },
  // user made password is stored here
  password: {
    type: String,
    required: [true, "Password is required for an account"]
  },
  // additional assurance when checking if a user is logged in
  loggedIn: {
    type: Boolean
  },
  // to store the users email
  email: {
    type: String,
    required: [true, "A valid email address is required"],
    match: [/.+@.+/, "Email's require an @ sign"]
  },
  // avatar the user can set by url
  avatar: {
    type: String
  },
  // keep track of favorite movies that the user has
  favMovie: {
    type: [{type: Schema.Types.ObjectId}],
    ref: 'Movies'
  },
  // keep track of the users favorite actors
  favActors: {
    type: [{type: Schema.Types.ObjectId}],
    ref: 'Actors'
  },
  // list of playlist of movies the user wishes to keep track of
  playlist: {
    type: [{type: Schema.Types.ObjectId}],
    ref: 'PlayList'
  },
  // code created to authenticate user (will be used in future to be able to change password if needed)
  confirmCode: {
    type: String
  },
  // user can receive a TempBan if too many negative marks which will require review by admin, of PermaBan if too many strikes for negativeMarks (will also require review by admin).
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "PermaBan", "TempBan"]
  },
  // used to keep track of users who get flagged by other users
  negativeMarks: {
    type: Number
  },
  // to keep track of how many strikes a user has before having to PermaBan for repeat offenses
  strikes: {
    type: Number
  },
  // keep track of users that report other users to see if ban is legit or just trolling (at which point the user that reported would get a negativeMark)
  reportedBy: {
    type: [Schema.Types.ObjectId, Number],
    ref: 'User'
  },
  // to also keep track of which users the currentUser is reporting to establish if account should be flagged for trolling (which would result in TempBan or PermaBan)
  reported: {
    type: [Schema.Types.ObjectId, Number],
    ref: 'User'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
