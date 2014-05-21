var mongoose = require('mongoose');
var refresh = require('google-refresh-token');
var secrets = require('../config/secrets');
var settingsSchema = new mongoose.Schema({
  calendarKey: {type: String, unique: true, default: ''},
  refreshToken: {type: String, unique: true, default: ''},
  organizationName: {type: String, default: 'Student Organization'},
  organizationMinutes: {type: Number, default: 0},
  eventsEnabled: {type: Boolean, default: true}
});

settingsSchema.methods.getAccessToken = function(callback) {

refresh(this.refreshToken, secrets.google.clientID, secrets.google.clientSecret, function(err, json, res) {
        callback(json.accessToken)
    });
}

module.exports = mongoose.model('Settings', settingsSchema);
