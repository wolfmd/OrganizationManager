mongoose = require("mongoose")
_ = require("underscore")
moment = require("moment")
memberSchema = new mongoose.Schema(
  email:
    type: String
    unique: true

  profile:
    firstName:
      type: String
      default: ""

    lastName:
      type: String
      default: ""

    major:
      type: String
      default: ""

    year:
      type: Number
      default: ""

    mnum:
      type: String
      default: ""
      unique: true

    iso:
      type: String
      default: ""

  meetings:
    type: Number
    default: 0

  events: Array
  service:
    type: Number
    default: 0
)
memberSchema.pre "save", (next) ->
  member = this
  if member.isModified("events")
    member.service = _.reduce(member.events, (num, evt) ->
      diff = moment(evt.endtime).diff(moment(evt.starttime))
      diff = diff / 60000
      console.log "diff is " + diff
      num + diff
    , 0)
  next()

module.exports = mongoose.model("Member", memberSchema)
