//mongoose model koji se koristi za stavke todo liste

//import mongoose modula
var mongoose = require('mongoose');

//kreiranje moonguse todo modela
var Event = mongoose.model('Event', {
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  subcountry: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  datetime: {
    type: Date,
    required: true
  },
  playground: {
    type: String,
    required: true,
    trim: true
  },
  peopleNum: {
    type: Number,
    required: true
  },
  sport: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    trim: true
  },
  gameType: {
    type: String,
    required: true,
    trim: true
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

//export modula
module.exports = {Event};
