Meeting = require("../models/Meeting")
Member = require("../models/Member")
request = require("request")
lookupService = require("../services/memberLookup")
exports.getMeeting = (req, res) ->
  
  #new Meeting({
  #    date: new Date(),
  #    room: "407 ERC",
  #    summary: "Business as usual"
  #  }).save();
  if req.params.id
    Meeting.findOne
      _id: req.params.id
    , (err, meeting) ->
      Member.find
        "profile.mnum":
          $in: meeting.attendees
      , (err, members) ->
        res.render "meeting/detail",
          title: "Meeting Details"
          meeting: meeting
          members: members

        return

      return

  else
    Meeting.find (err, meetings) ->
      res.render "meeting/list",
        title: "Meetings"
        meetings: meetings

      return

  return

exports.getAddMeeting = (req, res) ->
  res.render "meeting/add",
    title: "Add Meeting"

  return

exports.postMeeting = (req, res) ->
  if req.body.date and req.body.summary and req.body.room
    new Meeting(
      room: req.body.room
      date: new Date(req.body.date)
      summary: req.body.summary
      attendees: []
    ).save()
  res.redirect "/meeting"
  return

exports.postMNum = (req, res) ->
  id = req.params.id
  mnum = req.body.mnum
  iso = req.body.iso
  errorOccurred = false
  saveMember = (err, body) ->
    if err
      res.json
        error: true
        message: err

    if body and not err
      Member.findOne
        "profile.firstName": body.first_name
        "profile.lastName": body.last_name
      , (err, member) ->
        if member
          Meeting.findOne
            _id: id
          , (err, meeting) ->
            if meeting.attendees.indexOf(member.profile.mnum) is -1
              member.meetings = member.meetings + 1
              member.iso = iso
              member.save()
              meeting.attendees.push member.profile.mnum
              meeting.save()
            res.redirect "/meeting/" + id
            return

        else
          res.json
            error: true
            message: "Member failed"

        return

    else
      res.json
        error: true
        message: "Could not lookup ISO number"

    return

  if iso
    lookupService.lookupByIso iso, saveMember
  else if mnum
    lookupService.lookupByUcid mnum, saveMember
  else
    res.json
      error: true
      message: "No ISO number given"

  return
