var mongoose = require('mongoose');

var settingsSchema = new mongoose.Schema({
  calendarKey: {type: String, unique: true, default: ''}
});

module.exports = mongoose.model('Settings', settingsSchema);
