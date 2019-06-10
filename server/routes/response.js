var {authenticate} = require('../middleware/authenticate');
const {ObjectID} = require('mongodb');
var {mongoose} = require('../db/mongoose');
var {Response} = require('../models/response');
const _ = require('lodash');

module.exports = (app) => {

  //ruta za izradu novih odgovora na evente
  app.post('/response', authenticate, (req, res) => {
    var response = new Response({
      status: req.body.status,
      _user: req.user._id,
      _event: req.body.event
    });

    response.save().then((doc) => {
      res.send(doc);
    }, (e) => {
      res.status(400).send(e);
    });
  });

  //ruta zs dohvaćanje svih evenata na koje je korisnik rekao da dolazi
  app.get('/response', authenticate, (req, res) => {
    Response.find({
      _user: req.user._id,
      status: 'yes'
    }).then((response) => {
      res.send({
        response
      });
    }, (e) => {
      res.status(400).send(e);
    });
  });

  //ruta dohvaćanje jednog responsa
  app.get('/response/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    Response.findOne({
      _id: id,
      _user: req.user._id
    }).then((response) => {
      if (!response) {
        return res.status(404).send();
      }

      res.send({
        response
      });
    }).catch((e) => {
      res.status(400).send();
    });
  });

  //ruta za update responsea
  app.patch('/response/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['status']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    Response.findOneAndUpdate({
      _id: id,
      _user: req.user._id
    }, {
      $set: body
    }, {
      new: true
    }).then((response) => {
      if (!response) {
        return res.status(404).send();
      }
      res.send({
        response
      });
    }).catch((e) => {
      res.status(400).send();
    })
  });

  //ruta za brisanje responsa
  app.delete('/response/:id', authenticate, async (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    try {
      const response = await Response.findOneAndRemove({
        _id: id,
        _user: req.user._id
      });
      if (!response) {
        return res.status(404).send();
      }
      res.send({
        response
      });
    } catch (e) {
      res.status(400).send();
    }
  });

}
