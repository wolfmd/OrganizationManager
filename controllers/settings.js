var Settings = require('../models/Settings')
var gCal = require('google-calendar')
var app = require('../app');

var Member = require('../models/Member');
var Event = require('../models/Event');
var Meeting = require('../models/Meeting');


exports.getSettings = function(req, res) {
  Settings.findOne(function(err, settings){
    res.render('settings', {
      title: req.app.locals.organization,
      settings: settings
    });
  });
}

exports.postSettings = function(req, res) {
  Settings.findOne(function(err, settings) {
    console.log(req.body);
    settings.organizationName = req.body.organizationName;
    settings.eventsEnabled = req.body.eventsEnabled == undefined ? false : true;
    settings.save();
    req.app.locals.organization = req.body.organizationName;
    req.app.locals.eventsEnabled = req.body.eventsEnabled;
    console.log(req.app.locals);
    res.redirect('/settings');
  })
}

exports.resetData = function(req, res) {
  res.send(200);

  Member.find({}, function(err, members) {
    members.forEach(function(member) {
      member.events = [];
      member.save();
    })
  });
  Event.find({}).remove().exec();
  Meeting.find({}).remove().exec();
}
