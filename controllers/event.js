var Event = require('../models/Event')
var Member = require('../models/Member')
var async = require('async')
exports.getEvents = function(req, res) {
  Event.find(function(err, events) {
    res.render('event/list',{
      title: "Events",
      events:events
    });
  });


};

exports.getEvent = function(req, res) {
  var id = req.params.id;
  Event.findOne({"_id":id}, function(err, event){
      if(err)
        res.render(404);
      else {
        async.parallel([
          function(callback){
              Member.find({'profile.mnum': {$in: event.attendees }}, function(err, members) {

                callback(null, members);
              });
          },
          function(callback){
              Member.find({'profile.mnum': {$in: event.confirmed }}, function(err, members) {

                callback(null, members);
              });
          }
        ],function(err, results){
          // the results array will equal ['one','two'] even though
          // the second function had a shorter timeout.
          res.render('event/detail', {
            title: "Register for Event",
            event: event,
            members: results[0],
            confirmed: results[1]
          });
        });
      }
  });
}

exports.addEvent = function(req, res) {
  res.render('event/add', {
    title: 'Add Event'
  });

}

exports.postEvent = function(req,res) {
  new Event({
    title: req.body.title,
    starttime: new Date(req.body.starttime),
    endtime: new Date(req.body.endtime),
    location: req.body.location,
    summary: req.body.summary,
    attendees: [],
    confirmed: []
  }).save();
  res.redirect('/event');
}

exports.postUpdate = function(req, res) {
  var id = req.params.id;
  var mnum = req.body.mnum;

  Event.findOne({_id:id}, function(err, event) {
    event.attendees.push(mnum);
    event.save();
  });

  res.redirect('/event/' + id);

}

exports.postConfirmation = function(req, res) {
  var id = req.params.id;
  var mnum = req.params.mnum;

  Event.findOne({_id:id}, function(err, event) {
    event.confirmed.push(mnum);
    var index = event.attendees.indexOf(mnum);
    if (index > -1)
      event.attendees.splice(index, 1);

    event.save();
  });

  res.redirect('/event/' + id);

}
