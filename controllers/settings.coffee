Settings = require("../models/Settings")
gCal = require("google-calendar")
Member = require("../models/Member")
Event = require("../models/Event")
Meeting = require("../models/Meeting")

exports.getSettings = (req, res) ->
  Settings.findOne (err, settings) ->
    res.render "settings",
      title: settings.organizationName
      settings: settings

exports.postSettings = (req, res) ->
  Settings.findOne (err, settings) ->
    settings.organizationName = req.body.organizationName
    settings.organizationMinutes = req.body.organizationMinutes
    settings.eventsEnabled = (if req.body.eventsEnabled is `undefined` then false else true)
    settings.save (err) ->
      req.app.locals.organization = req.body.organizationName
      req.app.locals.eventsEnabled = req.body.eventsEnabled
      req.app.locals.minimumMinutes = req.body.organizationMinutes
      console.log req.app.locals
      res.redirect "/settings"

exports.resetData = (req, res) ->
  res.send 200
  Member.find {}, (err, members) ->
    members.forEach (member) ->
      member.events = []
      member.save()
      return

    return

  Event.find({}).remove().exec()
  Meeting.find({}).remove().exec()
