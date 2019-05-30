const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true; });
const Schema   = mongoose.Schema;


const actorSchema = new Schema({
  // firstName: {
  //   type: String
  // },
  // middleName: {
  //   type: String
  // },
  // lastName: {
  //   type: String
  // },
  name: {
    type: String
  },
  reviews: {
    type: [{type: Schema.Types.ObjectId, ref: "Comment"}]
  },
  tmdbId: {
    type: String
  }
  // movies: {
  //   type: [{ type: Schema.Types.ObjectId, ref: "Movies" }]
  // },
  // bio: {
  //   type: String
  // }
}, {
  timestamps: true
});

const ActorModel = mongoose.model('Actor', actorSchema);
module.exports = ActorModel;
