//ovaj mogul se koristi kao middleware za autentifikaciju usera za rute, potrebno je imati x-auth
//u post headeru kako bi znali da je user postojec i ulogiran

//import user modula
var {User} = require('./../models/user');

//funkcija za autentifikaciju usera koja traži usera po tokenu
var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send();
  });
};

//export modula
module.exports = {authenticate};
