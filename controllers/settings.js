var Settings = require('../models/Settings')
var gCal = require('google-calendar')
var app = require('../app');


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
    settings.eventsEnabled = req.body.eventsEnabled == true ? true : false;
    settings.save();
    req.app.locals.organization = req.body.organizationName;
    req.app.locals.eventsEnabled = req.body.eventsEnabled;
    console.log(req.app.locals);
    res.redirect('/settings');
  })
}
