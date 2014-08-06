Event = require("../models/Event")
Member = require("../models/Member")
Settings = require("../models/Settings")
async = require("async")
moment = require("moment")
gcal = require("google-calendar")
secrets = require("../config/secrets")
exports.getEvents = (req, res) ->
  Event.find (err, events) ->
    res.render "event/list",
      title: "Events"
      events: events

    return

  return

exports.getEvent = (req, res) ->
  id = req.params.id
  Event.findOne
    _id: id
  , (err, event) ->
    if err or not event
      res.render 404
      console.log "Error finding event with id:" + id
      console.log "err was:" + err
    else
      async.parallel [
        (callback) ->
          Member.find
            "profile.mnum":
              $in: event.attendees
          , (err, members) ->
            callback null, members
            return

        (callback) ->
          Member.find
            "profile.mnum":
              $in: event.confirmed
          , (err, members) ->
            callback null, members
            return

      ], (err, results) ->
        
        # the results array will equal ['one','two'] even though
        # the second function had a shorter timeout.
        res.render "event/detail",
          title: "Register for Event"
          event: event
          members: results[0]
          confirmed: results[1]

        return

    return

  return

exports.addEvent = (req, res) ->
  res.render "event/add",
    title: "Add Event"

  return

exports.deleteEvent = (req, res) ->
  if req.params.id
    Event.remove
      _id: req.params.id
    , (err, event) ->
      console.log err
      res.send 200
      return

  return

exports.postEvent = (req, res) ->
  newEvent = new Event(
    title: req.body.title
    starttime: new Date(req.body.starttime)
    endtime: new Date(req.body.endtime)
    location: req.body.location
    summary: req.body.summary
    attendees: []
    confirmed: []
  )
  newEvent.save()
  res.redirect "/event"
  return

exports.postUpdate = (req, res) ->
  id = req.params.id
  mnum = req.body.mnum
  Event.findOne
    _id: id
  , (err, event) ->
    event.attendees.push mnum
    event.save()
    return

  res.redirect "/event/" + id
  return

exports.denyAttendance = (req, res) ->
  id = req.params.id
  mnum = req.params.mnum
  Event.findOne
    _id: id
  , (err, evt) ->
    index = evt.attendees.indexOf(mnum)
    evt.attendees.splice index, 1  if index > -1
    evt.save()
    return

  res.redirect "/event/" + id
  return

exports.postConfirmation = (req, res) ->
  id = req.params.id
  mnum = req.params.mnum
  console.log "deny"  if req.body.isDeny
  Event.findOne
    _id: id
  , (err, event) ->
    event.confirmed.push mnum
    Member.findOne
      "profile.mnum": mnum
    , (err, member) ->
      member.events.push
        title: event.title
        starttime: event.starttime
        endtime: event.endtime
        summary: event.summary
        location: event.location

      member.save()
      return

    index = event.attendees.indexOf(mnum)
    event.attendees.splice index, 1  if index > -1
    event.save()
    return

  res.redirect "/event/" + id
  return
