memberLookup = require '../../services/memberLookup'
assert = require 'chai'
  .assert


describe 'Member Lookup Tests', () ->
  it 'Lookup by ISO', (done) ->
    memberLookup.lookupByIso '6015899400214891', (err, member) ->
      assert.equal member.first_name, 'Jonah', 'First name should be Jonah'
      assert.equal member.last_name, 'Back', 'Last name should be Back'
      done(err)