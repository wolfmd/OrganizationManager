var mongoose = require('mongoose');
var _ = require('underscore');
var moment = require('moment');
var memberSchema = new mongoose.Schema({
  email: { type: String, unique: true },

  profile: {
    firstName: {type: String, default: ''},
    lastName: { type: String, default: '' },
    major: { type: String, default: '' },
    year: { type: Number, default: '' },
    mnum: {type: String, default: '', unique: true},
    iso: {type: String, default: ''}
  },

  meetings: {type: Number, default: 0},
  events: Array,
  service: {type: Number, default: 0}
});

memberSchema.pre('save', function(next) {
  var member = this;
  if(member.isModified('events')) {
    member.service = _.reduce(member.events, function(num, evt){
      var diff = moment(evt.endtime).diff(moment(evt.starttime));
      diff = diff/60000
      console.log("diff is " + diff);
      return num + diff;
    }, 0);
  }
  return next();
})

module.exports = mongoose.model('Member', memberSchema);
