var {authenticate} = require('../middleware/authenticate');
const {ObjectID} = require('mongodb');
var {mongoose} = require('../db/mongoose');
var {Event} = require('../models/event');
const _ = require('lodash');

module.exports = (app) => {

  //ruta za izradu novih evenata
  app.post('/events', authenticate, (req, res) => {
    var event = new Event({
      title: req.body.title,
      text: req.body.text,
      gender: req.body.gender,
      country: req.body.country,
      subcountry: req.body.subcountry,
      city: req.body.city,
      datetime: req.body.datetime,
      peopleNum: req.body.peopleNum,
      playground: req.body.playground,
      level: req.body.level,
      sport: req.body.sport,
      _creator: req.user._id
    });

    event.save().then((doc) => {
      res.send(doc);
    }, (e) => {
      res.status(400).send(e);
    });
  });

  //ruta zs dohvaćanje svih evenata koje je korisnik napravio
  app.get('/events', authenticate, (req, res) => {
    Event.find({
      _creator: req.user._id
    }).then((events) => {
      res.send({
        events
      });
    }, (e) => {
      res.status(400).send(e);
    });
  });

  //ruta dohvaćanje jednog eventa
  app.get('/events/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    Event.findOne({
      _id: id,
      _creator: req.user._id
    }).then((event) => {
      if (!event) {
        return res.status(404).send();
      }

      res.send({
        event
      });
    }).catch((e) => {
      res.status(400).send();
    });
  });

  //ruta za brisanje evenata
  app.delete('/events/:id', authenticate, async (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    try {
      const event = await Event.findOneAndRemove({
        _id: id,
        _creator: req.user._id
      });
      if (!event) {
        return res.status(404).send();
      }
      res.send({
        event
      });
    } catch (e) {
      res.status(400).send();
    }
  });

  //ruta za update evenata
  app.patch('/events/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['title', 'text', 'city', 'gender', 'level', 'country', 'subcountry', 'datetime', 'playground', 'peopleNum', 'sport']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    Event.findOneAndUpdate({
      _id: id,
      _creator: req.user._id
    }, {
      $set: body
    }, {
      new: true
    }).then((event) => {
      if (!event) {
        return res.status(404).send();
      }
      res.send({
        event
      });
    }).catch((e) => {
      res.status(400).send();
    })
  });

  //ruta za dohvaćanje svih evenata svih korisnika
  app.get('/events/filter/:country/:subcountry?/:city?/:sport?', (req, res) => {

    var query = {};

    if (req.params.country && req.params.country!='undefined') {
      query.country = req.params.country;
    }

    if (req.params.subcountry && req.params.subcountry!='undefined') {
      query.subcountry = req.params.subcountry;
    }

    if (req.params.city && req.params.city!='undefined') {
      query.city = req.params.city;
    }

    if (req.params.sport && req.params.sport!='undefined') {
      query.sport = req.params.sport;
    }


    Event.find(query).sort([['datetime', 'ascending']]).then((events) => {
      res.send({
        events
      });
    }, (e) => {
      res.status(400).send(e);
    });
  });

}
