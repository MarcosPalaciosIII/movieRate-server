const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true; });
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
    type: [{type: Schema.Types.ObjectId, ref: "Comment"}]
  },
  movies: {
    type: [{ type: Schema.Types.ObjectId, ref: "Movies" }]
  },
  bio: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const ActorModel = mongoose.model('Actor', actorSchema);
module.exports = ActorModel;
