var mongoose = require('mongoose');

var settingsSchema = new mongoose.Schema({
  calendarKey: {type: String, unique: true, default: ''},
  organizationName: {type: String, default: 'Student Organization'}
});

module.exports = mongoose.model('Settings', settingsSchema);
