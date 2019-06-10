var {authenticate} = require('../middleware/authenticate');
const {ObjectID} = require('mongodb');
var {mongoose} = require('../db/mongoose');
var {Comment} = require('../models/comments');
const _ = require('lodash');

module.exports = (app) => {

  //ruta za izradu novih komentara
  app.post('/comments/:event', authenticate, (req, res) => {

    var event = req.params.event;

    if (!ObjectID.isValid(event)) {
      return res.status(404).send();
    }

    var comment = new Comment({
      text: req.body.text,
      _user: req.user._id,
      _event: event
    });

    comment.save().then((doc) => {
      res.send(doc);
    }, (e) => {
      res.status(400).send(e);
    });
  });

  //ruta zs dohvaćanje svih komentara koje je korisnik objavio
  app.get('/comments', authenticate, (req, res) => {
    Comment.find({
      _user: req.user._id
    }).then((comments) => {
      res.send({
        comments
      });
    }, (e) => {
      res.status(400).send(e);
    });
  });

  //ruta zs dohvaćanje svih komentara jednog eventa
  app.get('/comments/event/:event', authenticate, (req, res) => {

    var event = req.params.event;

    if (!ObjectID.isValid(event)) {
      return res.status(404).send();
    }

    Comment.find({
      _event: event
    }).then((comments) => {
      res.send({
        comments
      });
    }, (e) => {
      res.status(400).send(e);
    });
  });

  //ruta dohvaćanje jednog komentara
  app.get('/comments/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    Comment.findOne({
      _id: id,
      _user: req.user._id
    }).then((comment) => {
      if (!comment) {
        return res.status(404).send();
      }

      res.send({
        comment
      });
    }).catch((e) => {
      res.status(400).send();
    });
  });

  //ruta za brisanje komentara
  app.delete('/comments/:id', authenticate, async (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    try {
      const comment = await Comment.findOneAndRemove({
        _id: id,
        _user: req.user._id
      });
      if (!comment) {
        return res.status(404).send();
      }
      res.send({
        comment
      });
    } catch (e) {
      res.status(400).send();
    }
  });

  //ruta za update komentara
  app.patch('/comments/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    Comment.findOneAndUpdate({
      _id: id,
      _user: req.user._id
    }, {
      $set: body
    }, {
      new: true
    }).then((comment) => {
      if (!comment) {
        return res.status(404).send();
      }
      res.send({
        comment
      });
    }).catch((e) => {
      res.status(400).send();
    })
  });

}
