###
GET /
Home page.
###
Event = require("../models/Event")
Meeting = require("../models/Meeting")
async = require("async")
exports.index = (req, res) ->
  start = new Date()
  end = new Date(+new Date + 6048e5)
  console.log end
  async.parallel [
    (callback) ->
      Event.find
        $query:
          starttime:
            $gte: start
            $lt: end

        $orderby:
          starttime: 1
      , (err, events) ->
        callback null, events
        return

    (callback) ->
      Meeting.find
        $query:
          date:
            $gte: start

        $orderby:
          date: 1
      , (err, meetings) ->
        console.log err  if err
        meetings = []  unless meetings
        callback null, meetings[0]
        return

  ], (err, results) ->
    
    # the results array will equal ['one','two'] even though
    # the second function had a shorter timeout.
    res.render "home",
      title: "Home"
      events: results[0] or []
      meeting: results[1] or []

    return

  return
