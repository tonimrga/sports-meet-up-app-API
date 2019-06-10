//mongoose model koji se koristi za usere

//import modula
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

//kreiranje moonguse scheme za usera
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 4
  },
  username: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    minlength: 1
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

//OVAJ 6788 TREBA ZAMJENITI SA ENVIROMENT VARIJABLOM
//ova funkcija pretvara mongoose model u json objekt
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email', 'username', 'country']);
};

//funkcija za generiranje autorizacijskog tokena
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';

  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.TOKEN).toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
     return token;
  });
};

//funkcija za brisanje autorizacijskog tokena
UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

//funkcija za traženje usera po autorizacijskom tokenu
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.TOKEN);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

//funkcija za traženje usera po emailu i passwordu prilikom logina
UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

//funkcija koja definira da će se prije svakog save-a usera hashirat password
UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

//pretvaranje scheme u model
var User = mongoose.model('User', UserSchema);

//export modula
module.exports = {User}
