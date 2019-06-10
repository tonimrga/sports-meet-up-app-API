//mongoose model koji se koristi za stavke todo liste

//import mongoose modula
var mongoose = require('mongoose');

//kreiranje moonguse todo modela
var Comment = mongoose.model('Comment', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  createdAt: {
    type: Date,
     default: Date.now
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
module.exports = {Comment};
