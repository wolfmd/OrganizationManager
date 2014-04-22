/**
 * Module dependencies.
 */

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
var refresh = require('google-refresh-token');
var Settings = require('./models/Settings');

var refreshToken = function() {
  console.log('refresh called');
  Settings.findOne({}, function(err, settings) {
    console.log(settings);

    if(settings.refreshToken) {
      refresh(settings.refreshToken, secrets.google.clientID, secrets.google.clientSecret, function(err, json, res) {
        console.log(err)
        console.log(json.accessToken);
        settings.calendarKey = json.accessToken;
        settings.save();
      });
    }
  });
  setTimeout(refreshToken, 1000*60*30)
};
refreshToken();


/**
 * Load controllers.
 */

var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');
var forgotController = require('./controllers/forgot');
var resetController = require('./controllers/reset');

var memberController = require('./controllers/member');
var meetingController = require('./controllers/meeting');
var eventController = require('./controllers/event');
var settingsController = require('./controllers/settings');

var Settings = require('./models/Settings');

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */

var app = express();

/**
 * Mongoose configuration.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});





/**
 * Express configuration.
 */

var hour = 3600000;
var day = (hour * 24);
var week = (day * 7);
var month = (day * 30);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(connectAssets({
  paths: ['public/css', 'public/js'],
  helperContext: app.locals
}));
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());
app.use(express.session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  })
}));
app.use(express.csrf());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  res.locals.token = req.csrfToken();
  res.locals.secrets = secrets;
  next();
});
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});
app.use(express.errorHandler());

/**
 * Application routes.
 */
app.get('/member', passportConf.isAuthenticated, memberController.getMembers);
app.get('/member/add', passportConf.isAuthenticated, memberController.getAddMember)
app.post('/member/add', passportConf.isAuthenticated, memberController.postMember);
app.get('/member/lookup/:mnum', memberController.postMemberLookup);
app.get('/member/:id', passportConf.isAuthenticated, memberController.getMember);
app.post('/member/:id', passportConf.isAuthenticated, memberController.addEvent)
app.del('/member/:id', passportConf.isAuthenticated, memberController.deleteMember);

app.get('/meeting', meetingController.getMeeting);
app.get('/meeting/add', passportConf.isAuthenticated, meetingController.getAddMeeting);
app.post('/meeting/add', passportConf.isAuthenticated, meetingController.postMeeting);
app.get('/meeting/:id', passportConf.isAuthenticated, meetingController.getMeeting);
app.post('/meeting/:id', passportConf.isAuthenticated, meetingController.postMNum);

app.get('/event', eventController.getEvents);
app.get('/event/add',passportConf.isAuthenticated, eventController.addEvent);
app.post('/event/add', passportConf.isAuthenticated, eventController.postEvent);
app.get('/event/:id', passportConf.isAuthenticated, eventController.getEvent);
app.post('/event/:id', passportConf.isAuthenticated, eventController.postUpdate);
app.get('/event/:id/:mnum', passportConf.isAuthenticated, eventController.postConfirmation);

app.get('/settings',passportConf.isAuthenticated, settingsController.getSettings);
app.post('/settings', passportConf.isAuthenticated, settingsController.postSettings);

app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', forgotController.getForgot);
app.post('/forgot', forgotController.postForgot);
app.get('/reset/:token', resetController.getReset);
app.post('/reset/:token', resetController.postReset);
app.get('/signup',  userController.getSignup);
app.post('/signup',  userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/steam', apiController.getSteam);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
app.get('/api/foursquare', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
app.get('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getVenmo);
app.post('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postVenmo);
app.get('/api/linkedin', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getLinkedin);

/**
 * OAuth routes for sign-in.
 */

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/glass.timeline', accessType: 'offline'}));
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { successRedirect: '/', failureRedirect: '/login' }));

/**
 * OAuth routes for API examples that require authorization.
 */

app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/tumblr');
});
app.get('/auth/venmo', passport.authorize('venmo', { scope: 'make_payments access_profile access_balance access_email access_phone' }));
app.get('/auth/venmo/callback', passport.authorize('venmo', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/venmo');
});

/**
 * Start Express server.
 */

app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

Settings.findOne(function(err, settings) {
  app.locals.organization = settings.organizationName;
  app.locals.eventsEnabled = settings.eventsEnabled ? true : false;
});

app.locals.organization = 'CEAS Amb';

module.exports = app;
