var mongoose = require('mongoose');

var memberSchema = new mongoose.Schema({
  email: { type: String, unique: true },

  profile: {
    firstName: {type: String, default: ''},
    lastName: { type: String, default: '' },
    major: { type: String, default: '' },
    year: { type: Number, default: '' },
    mnum: {type: String, default: '', unique: true}
  },

  meetings: {type: Number, default: 0}
});

module.exports = mongoose.model('Member', memberSchema);
