var Meeting = require("../models/Meeting");
var Member = require("../models/Member")

exports.getMeeting = function(req, res) {

  /*new Meeting({
    date: new Date(),
    room: "407 ERC",
    summary: "Business as usual"
  }).save();*/
  if(req.params.id) {
    console.log(req.params.id);
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
  console.log(req.body);
  if(req.body.date && req.body.summary && req.body.room) {
    new Meeting({
      room: req.body.room,
      date: new Date(req.body.date),
      summary: req.body.summary,
      attendees: []
    }).save();
  }
}

exports.postMNum = function(req, res) {
  var id = req.params.id;
  var mnum = req.body.mnum;

  Meeting.findOne({_id:id}, function(err, meeting) {
    meeting.attendees.push(mnum);
    meeting.save();
  });

  res.redirect('/meeting/' + id);

  Member.findOne({"profile.mnum": mnum}, function(err, member) {
    if(member) {
      member.meetings = member.meetings + 1;
      member.save();
    }
  })

}
