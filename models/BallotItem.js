/**
 * Created by jonahback on 6/18/14.
 */
var mongoose = require('mongoose');
var _ = require('underscore');

var ballotItemSchema = new mongoose.Schema({
  title: {type: String, default: "President"},
  choices: {type: Array, default: []}, //{title: "", description: '', votes:[]}

});

ballotItemSchema.methods.vote = function(title, ucid){
  console.log('vote called');
  var entry = _.findWhere(this.choices, {title: title});
  console.log(entry);
  entry.votes.push(ucid);
};
module.exports = mongoose.model('BallotItem', ballotItemSchema);