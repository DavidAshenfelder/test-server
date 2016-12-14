var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  gender: String
});

module.exports = mongoose.model('User', userSchema);
