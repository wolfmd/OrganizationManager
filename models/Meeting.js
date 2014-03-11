var mongoose = require('mongoose');

var meetingSchema = new mongoose.Schema({
  date: { type: Date, unique: true },
  room: { type: String, default: "407 ERC"},
  summary: {type: String, default: ""},

  attendees: Array

});

module.exports = mongoose.model('Meeting', meetingSchema);
