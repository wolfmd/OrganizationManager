var chai = require('chai');
var should = chai.should();
var User = require('../models/User');
var Member = require('../models/Member');
var Election = require('../models/Election');
var BallotItem = require('../models/BallotItem');

describe('User Model', function() {
  it('should create a new user', function(done) {
    var user = new User({
      email: 'test@gmail.com',
      password: 'password'
    });
    user.save(function(err) {
      if (err) return done(err);
      done();
    })
  });

  it('should not create a user with the unique email', function(done) {
    var user = new User({
      email: 'test@gmail.com',
      password: 'password'
    });
    user.save(function(err) {
      if (err) err.code.should.equal(11000);
      done();
    });
  });

  it('should find user by email', function(done) {
    User.findOne({ email: 'test@gmail.com' }, function(err, user) {
      if (err) return done(err);
      user.email.should.equal('test@gmail.com');
      done();
    });
  });

  it('should delete a user', function(done) {
    User.remove({ email: 'test@gmail.com' }, function(err) {
      if (err) return done(err);
      done();
    });
  });

});

describe('Election Model', function(done) {
  it('should create an Election', function(done){

    var president = new BallotItem({
      title: "President",
      choices: [
        {
          title: 'Thad',
          description: 'Thad is prezident',
          votes: []
        },
        {
          title: 'Kerry',
          description: 'Kerry aint prez',
          votes: []
        }
      ]
    });
    president.save(function(err) {
        console.log(err);
        var elect = new Election({
          title: "Test Election",
          ballotItems: [president.id]
        }).save(function(err2) {
            Election.findOne({}).populate('ballotItems').exec(function(err, electionResult) {
              console.log(electionResult.ballotItems[0].choices[0]);
              electionResult.ballotItems[0].vote('Thad', 'hi');
              electionResult.ballotItems[0].save();
              console.log(electionResult.results());
              //console.log(electionResult.ballotItems[0].choices[0]);
              done();
            });
          })
      });
  });
})
