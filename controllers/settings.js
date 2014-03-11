var Settings = require('../models/Settings')
var gCal = require('google-calendar')
exports.getSettings = function(req, res) {
  Settings.findOne(function(err, settings){
    console.log(settings.calendarKey);
    var google_calendar = new gCal.GoogleCalendar(settings.calendarKey);
    google_calendar.calendarList.list(function(err, calendarList) {
      console.log(calendarList);
      console.log(err);

      google_calendar.events.list(calendarList.items[0].id, function(err, events) {
        console.log(events);
      });
    });
  });


  res.render('settings', {
    title: 'Settings'
  });
}
