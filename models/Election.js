var mongoose = require('mongoose');
var _ = require('underscore')

var electionSchema = new mongoose.Schema({
  title: { type: String, default: "Default Election"},

  ballotItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BallotItem' }]

});

electionSchema.methods.results = function() {
  var ballotItems = [];
  _.each(this.ballotItems, function(ballot) {
    var results = {};
    results.candidates = [];
    results.title = ballot.title;
    _.each(ballot.choices, function(choice) {
      results.candidates.push({votes: choice.votes.length, title: choice.title});
    });
    ballotItems.push(results);
  })
  return ballotItems;
}

module.exports = mongoose.model('Election', electionSchema);
