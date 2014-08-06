request = require("supertest")
app = require("../app")
server = request.agent("http://localhost:3000")
assert = require("chai").assert
Event = require("../models/Event")
Meeting = require("../models/Meeting")
csrf = ""
memberLookup = require("../services/memberLookup")

describe "GET /", ->
  before (done) ->
    setTimeout done, 4000
    return

  it "should return 200 OK", (done) ->
    server.get("/").expect 200, done
    return

  return

describe "GET /csrf", ->
  it "should get CSRF Token", (done) ->
    server.get("/csrf").end (err, res) ->
      return done(err)  if err
      console.log res.body
      csrf = res.body.csrf
      done()
      return

    return

  return

describe "Authentication", ->
  it "should get signup page", (done) ->
    server.get("/signup").expect 200, done
    return

  it "should register user", (done) ->
    server.post("/signup").send(
      _csrf: csrf
      email: "backjo@mail.uc.edu"
      password: "jonaback2334"
      confirmPassword: "jonaback2334"
    ).expect 302, done
    return

  it "should logout user", (done) ->
    server.get("/logout").expect 302, done
    return

  it "should get login page", (done) ->
    server.get("/login").expect 200, done
    return

  it "should login successfully", (done) ->
    server.post("/login").send(
      _csrf: csrf
      email: "backjo@mail.uc.edu"
      password: "jonaback2334"
    ).expect 302, done
    return

  return

describe "Member CRUD tests", ->
  it "should add a new member", (done) ->
    server.post("/member/add").send(
      _csrf: csrf
      mnum: "M04297884"
      email: "backjo@mail.uc.edu"
      firstName: "Jonah"
      lastName: "Back"
      major: "Computer Science"
    ).expect 302, done
    return

  return

describe "Event CRUD tests", ->
  eventID = ""
  it "should GET event page", (done) ->
    server.get("/event/add").expect 200, done
    return

  it "should POST event", (done) ->
    server.post("/event/add").send(
      _csrf: csrf
      title: "debugTour"
      starttime: "31 December 1999 1:00 PM"
      endtime: "31 December 1999 2:00 PM"
      location: "407 ERC"
      summary: "TEST"
    ).end (err, res) ->
      Event.findOne
        title: "debugTour"
      , (err, evt) ->
        return done(err)  if err or not evt
        eventID = evt.id
        done()
        return

      return

    return

  it "should DELETE event", (done) ->
    server.del("/event/" + eventID).send(_csrf: csrf).end (err, res) ->
      Event.findOne
        _id: eventID
      , (err, evt) ->
        return done(err)  if err or evt
        done()
        return

      return

    return

  return

describe "Meeting CRUD tests", ->
  meetingID = ""
  it "should GET meeting page", (done) ->
    server.get("/meeting/add").expect 200, done
    return

  it "should POST meeting", (done) ->
    summary = "Unit Test Meeting"
    server.post("/meeting/add").send(
      _csrf: csrf
      date: new Date()
      room: "407 ERC"
      summary: summary
    ).end (err, res) ->
      Meeting.findOne
        summary: summary
      , (err, meeting) ->
        return done(err)  if err or not meeting
        meetingID = meeting.id
        done()
        return

      return

    return

  it "Should sign into meeting using cardswipe", (done) ->
    ISO = "6015899400214891"
    mnum = "M04297884"
    server.post("/meeting/" + meetingID).send(
      _csrf: csrf
      iso: ISO
    ).end (err, res) ->
      Meeting.findOne
        _id: meetingID
      , (err, meeting) ->
        return done(err)  if not meeting or err
        assert.lengthOf meeting.attendees, 1, "Should be one attendee"
        assert.equal meeting.attendees[0], mnum, "Attendee should be swiper"
        done()
        return

      return

    return

  it "Should delete meeting", (done) ->
    Meeting.remove
      _id: meetingID
    , (err, meeting) ->
      return done(err)  if err
      done()
      return

    return

  return

describe "Lookup Service Tests", ->
  it "Lookup by ISO", (done) ->
    memberLookup.lookupByIso "6015899400214891", (err, member) ->
      assert.equal member.first_name, "Jonah", "First name should be Jonah"
      assert.equal member.last_name, "Back", "Last name should be Back"
      done err
      return

    return

  it "Lookup by UCID", (done) ->
    memberLookup.lookupByUcid "M04297884", (err, member) ->
      assert.equal member.first_name, "Jonah", "First name should be Jonah"
      assert.equal member.last_name, "Back", "Last name should be Back"
      done err
      return

    return

  return

