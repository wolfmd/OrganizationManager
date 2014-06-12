var Meeting = require("../models/Meeting");
var Member = require("../models/Member");
var request = require('request');
var lookupService = require('../services/memberLookup');


exports.getMeeting = function(req, res) {

  /*new Meeting({
    date: new Date(),
    room: "407 ERC",
    summary: "Business as usual"
  }).save();*/
  if(req.params.id) {
    Meeting.findOne({_id: req.params.id}, function(err, meeting) {
      Member.find({'profile.mnum': {$in: meeting.attendees }}, function(err, members) {
        res.render('meeting/detail', {
          title: 'Meeting Details',
          meeting: meeting,
          members: members
        });
      });
    })
  } else {

    Meeting.find(function(err, meetings) {
      res.render('meeting/list', {
        title: 'Meetings',
        meetings: meetings
      });
    });

  }


};

exports.getAddMeeting = function(req, res) {
  res.render('meeting/add', {
    title: 'Add Meeting'
  })
}

exports.postMeeting = function(req,res) {
  if(req.body.date && req.body.summary && req.body.room) {
    new Meeting({
      room: req.body.room,
      date: new Date(req.body.date),
      summary: req.body.summary,
      attendees: []
    }).save();
  }
  res.redirect('/meeting');
}

exports.postMNum = function(req, res) {
  var id = req.params.id;
  var mnum = req.body.mnum;
  var iso = req.body.iso;
  var errorOccurred = false;
  if(iso) {
    lookupService.lookupByIso(iso, function(err, body) {
      if (body && !body.error) {
        Member.findOne({'profile.firstName': body.first_name, 'profile.lastName': body.last_name}, function (err, member) {

          if (member) {
            member.meetings = member.meetings + 1;
            member.iso = iso;
            member.save();

            Meeting.findOne({_id: id}, function (err, meeting) {
              meeting.attendees.push(member.profile.mnum);
              meeting.save();
              res.redirect('/meeting/' + id);
            });
          } else {
            res.json({error: true, message: 'Member failed'});
          }
        })
      } else {
        res.json({error: true, message: 'Could not lookup ISO number'});
      }
    });
  } else if(mnum) {

  } else {
    res.json({error:true, message: 'No ISO number given'});
  }
};
