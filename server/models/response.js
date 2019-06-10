//mongoose model koji se koristi za stavke todo liste

//import mongoose modula
var mongoose = require('mongoose');

//kreiranje moonguse todo modela
var Response = mongoose.model('Response', {
  status: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  _event: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

//export modula
module.exports = {Response};
