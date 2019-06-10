var {authenticate} = require('../middleware/authenticate');
var {mongoose} = require('../db/mongoose');
var {User} = require('../models/user');
const _ = require('lodash');

module.exports = (app) => {

  // ruta za REGISTRACIJU usera
  app.post('/users/register', async (req, res) => {
    try {
      const body = _.pick(req.body, ['email', 'password', 'username', 'country']);
      const user = new User(body);
      await user.save();
      const token = await user.generateAuthToken();
      res.header('x-auth', token).send({
        user,
        token
      });
    } catch (e) {
      res.status(400).send(e);
    }
  });

  //vraća trenutno logirano usera
  app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
  });

  //login usera koji vraća novi auth token
  app.post('/users/login', async (req, res) => {
    try {
      const body = _.pick(req.body, ['email', 'password']);
      const user = await User.findByCredentials(body.email, body.password);

      const token = await user.generateAuthToken();

      res.header('x-auth', token).send({
        user,
        token
      });
    } catch (e) {
      res.status(400).send();
    }
  });

  //logout usera koji briše token
  app.delete('/users/logout', authenticate, async (req, res) => {
    try {
      await req.user.removeToken(req.token);
      res.status(200).send();
    } catch (e) {
      res.status(400).send();
    }
  });

  //logout usera koji briše korisnički račun
  app.delete('/users/delete', authenticate, async (req, res) => {
    try {
      const user = await User.findOneAndRemove({
        _id: req.user._id,
      });
      if (!user) {
        return res.status(404).send();
      }
      res.send({
        user
      });
    } catch (e) {
      res.status(400).send();
    }
  });

  //ruta za update države
  app.patch('/users/update', authenticate, (req, res) => {
    var id = req.user._id;
    var body = _.pick(req.body, ['country']);

    User.findOneAndUpdate({
      _id: id
    }, {
      $set: body
    }, {
      new: true
    }).then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send({
        user
      });
    }).catch((e) => {
      res.status(400).send();
    })
  });

  //ruta za update PASSORDA
  app.patch('/users/password', authenticate, (req, res) => {
    var id = req.user._id;
    var body = _.pick(req.body, ['password']);

    User.findById(id, function(err, user) {
      if (err) return false;

      user.password = body.password;
      user.save();

      res.send({
        user
      });
    });
  });

}
