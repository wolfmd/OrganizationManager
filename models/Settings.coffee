mongoose = require("mongoose")
refresh = require("google-refresh-token")
secrets = require("../config/secrets")
settingsSchema = new mongoose.Schema
  calendarKey:
    type: String
    unique: true
    default: ""

  refreshToken:
    type: String
    unique: true
    default: ""

  organizationName:
    type: String
    default: "Student Organization"

  organizationMinutes:
    type: Number
    default: 0

  eventsEnabled:
    type: Boolean
    default: true

settingsSchema.methods.getAccessToken = (callback) ->
  refresh @refreshToken, secrets.google.clientID, secrets.google.clientSecret, (err, json, res) ->
    callback json.accessToken
    return

  return

module.exports = mongoose.model "Settings", settingsSchema
