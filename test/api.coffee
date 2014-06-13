  chai = require 'chai'
  should = chai.should()

  Member = require '../models/Member'
  Event = require '../models/Event'

  request = require 'supertest'
  app = require '../app.js'
  chai = require 'chai'
  should = chai.should()

  evtId = null

  describe 'Event', () ->

    testEvent =
      title: "Test Event"
      starttime: ""
      endtime: ""
      location: "ERC"
      summary: "A test meeting"



    it 'Should create an event', (done) ->
      request(app)
        .post '/event/add'
        .send testEvent
        .end (error, res) ->
          Event.findOne {"title": "Test Event"}, (err, evt) ->
            console.log "Event creation"
            console.log evt
            evtId = evt.id
            if evt is null then throw "No event added"
            done()



  describe 'Member', () ->
    it 'should add a new member', (done) ->
      testMem =
        email: 'backjo@mail.uc.edu'
        profile:
          mnum: 'M04297884'
          firstName: 'Jonah'
          lastName: 'Back'
          major: 'Computer Science'

      request(app)
        .post('/member')
        .send(testMem)
        .end (error, res) ->
          console.log 'end called'
          Member.findOne {"email":'backjo@mail.uc.edu'}, (err, member) ->
            if err then throw err
            if member is null then throw 'Not found'
            done()

    it 'Should register member for event', (done) ->
      request app
        .post '/event/' + evtId
        .send {"mnum":'M04297884'}
        .end (error, res) ->
          Event.findOne {"_id": evtId}, (err, evt) ->
            if evt is null then throw "Event does not exist"
            if evt.attendees.length != 1 then throw "Attendees are" + evt.attendees.length
            done()



