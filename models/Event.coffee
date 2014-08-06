mongoose = require("mongoose")
eventSchema = new mongoose.Schema(
  starttime:
    type: Date

  endtime:
    type: Date

  location:
    type: String
    default: "407 ERC"

  summary:
    type: String
    default: ""

  title:
    type: String
    default: ""

  attendees: Array
  confirmed: Array
)
module.exports = mongoose.model("Event", eventSchema)
