###
Module dependencies.
###
express = require("express")
MongoStore = require("connect-mongo")(express)
flash = require("express-flash")
path = require("path")
mongoose = require("mongoose")
passport = require("passport")
expressValidator = require("express-validator")
connectAssets = require("connect-assets")
refresh = require("google-refresh-token")
Settings = require("./models/Settings")
moment = require("moment")
refreshToken = ->
  console.log "refresh called"
  Settings.findOne {}, (err, settings) ->
    if settings and settings.refreshToken
      refresh settings.refreshToken, secrets.google.clientID, secrets.google.clientSecret, (err, json, res) ->
        settings.calendarKey = json.accessToken
        settings.save()
        return

    return

  setTimeout refreshToken, 1000 * 60 * 30
  return

refreshToken()

###
Load controllers.
###
homeController = require("./controllers/home")
userController = require("./controllers/user")
forgotController = require("./controllers/forgot")
resetController = require("./controllers/reset")
memberController = require("./controllers/member")
meetingController = require("./controllers/meeting")
eventController = require("./controllers/event")
settingsController = require("./controllers/settings")
Settings = require("./models/Settings")

###
API keys + Passport configuration.
###
secrets = require("./config/secrets")
passportConf = require("./config/passport")

###
Create Express server.
###
app = express()

###
Mongoose configuration.
###
mongoose.connect secrets.db
mongoose.connection.on "error", ->
  console.error "✗ MongoDB Connection Error. Please make sure MongoDB is running."
  return


###
Express configuration.
###
hour = 3600000
day = (hour * 24)
week = (day * 7)
month = (day * 30)
app.set "port", process.env.PORT or 3000
app.set "views", path.join(__dirname, "views")
app.set "view engine", "jade"
app.use connectAssets(
  paths: [
    "public/css"
    "public/js"
  ]
  helperContext: app.locals
)
app.use express.compress()
app.use express.favicon()
app.use express.logger("dev")
app.use express.cookieParser()
app.use express.json()
app.use express.urlencoded()
app.use expressValidator()
app.use express.methodOverride()
app.use express.session(
  secret: secrets.sessionSecret
  store: new MongoStore(
    url: secrets.db
    auto_reconnect: true
  , (e) ->
    app.listen app.get("port"), ->
      console.log "✔ Express server listening on port %d in %s mode", app.get("port"), app.settings.env
      return

    app.isReady = true
    return
  )
)
app.use express.csrf()
app.use passport.initialize()
app.use passport.session()
app.use (req, res, next) ->
  res.locals.user = req.user
  res.locals.token = req.csrfToken()
  res.locals.secrets = secrets
  res.locals.moment = moment
  next()
  return

app.use flash()
app.use app.router
app.use express.static(path.join(__dirname, "public"),
  maxAge: week
)
app.use (req, res) ->
  res.status 404
  res.render "404"
  return

if process.env.NODE_ENV isnt "production"
  console.log "not production"
  app.get "/csrf", (req, res, next) ->
    res.json csrf: req.csrfToken()
    return

  app.use express.errorHandler()

###
Application routes.
###
app.get "/member", memberController.getMembers
app.get "/member/add", passportConf.isAuthenticated, memberController.getAddMember
app.post "/member/add", passportConf.isAuthenticated, memberController.postMember
app.get "/member/lookup/:mnum", memberController.postMemberLookup
app.get "/member/:id", passportConf.isAuthenticated, memberController.getMember
app.post "/member/:id", passportConf.isAuthenticated, memberController.addEvent
app.del "/member/:id", passportConf.isAuthenticated, memberController.deleteMember
app.get "/meeting", meetingController.getMeeting
app.get "/meeting/add", passportConf.isAuthenticated, meetingController.getAddMeeting
app.post "/meeting/add", passportConf.isAuthenticated, meetingController.postMeeting
app.get "/meeting/:id", passportConf.isAuthenticated, meetingController.getMeeting
app.post "/meeting/:id", passportConf.isAuthenticated, meetingController.postMNum
app.get "/event", eventController.getEvents
app.get "/event/add", passportConf.isAuthenticated, eventController.addEvent
app.post "/event/add", passportConf.isAuthenticated, eventController.postEvent
app.get "/event/:id", eventController.getEvent
app.post "/event/:id", eventController.postUpdate
app.del "/event/:id", passportConf.isAuthenticated, eventController.deleteEvent
app.get "/event/:id/:mnum/deny", passportConf.isAuthenticated, eventController.denyAttendance
app.get "/event/:id/:mnum", passportConf.isAuthenticated, eventController.postConfirmation
app.get "/settings", passportConf.isAuthenticated, settingsController.getSettings
app.post "/settings", passportConf.isAuthenticated, settingsController.postSettings
app.post "/reset", passportConf.isAuthenticated, settingsController.resetData
app.get "/", homeController.index
app.get "/apply", (req, res) ->
  res.render "apply",
    title: "Apply"

  return

app.get "/login", userController.getLogin
app.post "/login", userController.postLogin
app.get "/logout", userController.logout
app.get "/forgot", forgotController.getForgot
app.post "/forgot", forgotController.postForgot
app.get "/reset/:token", resetController.getReset
app.post "/reset/:token", resetController.postReset
app.get "/user/add", passportConf.isAuthenticated, userController.getSignup
app.post "/user/add", passportConf.isAuthenticated, userController.postSignup
app.get "/account", passportConf.isAuthenticated, userController.getAccount
app.post "/account/profile", passportConf.isAuthenticated, userController.postUpdateProfile
app.post "/account/password", passportConf.isAuthenticated, userController.postUpdatePassword
app.post "/account/delete", passportConf.isAuthenticated, userController.postDeleteAccount

app.get "/user", passportConf.isAuthenticated, userController.getUsers

#app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
app.get "/auth/google", passport.authenticate("google",
  scope: "profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/glass.timeline"
  accessType: "offline"
)
app.get "/auth/google/callback", passport.authenticate("google",
  successRedirect: "/"
  failureRedirect: "/login"
)

###
Start Express server.
###
Settings.findOne (err, settings) ->
  if settings
    app.locals.organization = settings.organizationName
    app.locals.eventsEnabled = (if settings.eventsEnabled then true else false)
    app.locals.minimumMinutes = settings.organizationMinutes
  else
    app.locals.organization = "Test Organization"
    app.locals.eventsEnabled = true
    app.locals.minimumMinutes = 360
  return

app.locals.organization = "CEAS Amb"
module.exports = app
