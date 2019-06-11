const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Event} = require('../models/event');

var body = {
  "title": "Košarka na vojnom",
  "text": "Pozdrav ljudi meni se igra košarka",
  "city": "Rijeka",
  "gender": "Male",
  "country": "Croatia",
  "subcountry": "Primorska",
  "level": "High",
  "gameType": "5vs5",
  "datetime": "14141",
  "playground": "Vojno igralište",
  "peopleNum": 10,
  "sport": "0"
}

var toniToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Y2Y4ZWE5ODZlZDA2YTEyMjc0OTlmNDkiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTU5ODE2ODU2fQ.--k8jlLccirC4QVoWch8KI2UrdSk6o7CBdcOPaKDT3w';
var eventId = '';

describe('POST /events', () => {
  it('should create a new event', (done) => {
    request(app)
      .post('/events')
      .set('x-auth', toniToken)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.title).toBe(body.title);
        expect(res.body.text).toBe(body.text);
        expect(res.body.city).toBe(body.city);
        expect(res.body.country).toBe(body.country);
        expect(res.body.subcountry).toBe(body.subcountry);
        expect(res.body.level).toBe(body.level);
        expect(res.body.gender).toBe(body.gender);
        expect(res.body.gameType).toBe(body.gameType);
        expect(res.body.playground).toBe(body.playground);
        expect(res.body.peopleNum).toBe(body.peopleNum);
        expect(res.body.sport).toBe(body.sport);
        eventId = res.body._id;
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Event.find({'title': body.title}).then((events) => {
          expect(events.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create event with invalid body data', (done) => {
    request(app)
      .post('/events')
      .set('x-auth', toniToken)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it('should not create event without user authenticated', (done) => {
    request(app)
      .post('/events')
      .set('x-auth', 'noToken')
      .send({})
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

});

describe('GET /events', () => {
  it('should get all events created by a user', (done) => {
    request(app)
      .get('/events')
      .set('x-auth', toniToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.events.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /events/:id', () => {
  it('should return one event', (done) => {
    request(app)
      .get(`/events/${eventId}`)
      .set('x-auth', toniToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.event.title).toBe(body.title);
        expect(res.body.event.text).toBe(body.text);
        expect(res.body.event.city).toBe(body.city);
        expect(res.body.event.level).toBe(body.level);
        expect(res.body.event.gender).toBe(body.gender);
        expect(res.body.event.gameType).toBe(body.gameType);
        expect(res.body.event.country).toBe(body.country);
        expect(res.body.event.subcountry).toBe(body.subcountry);
        expect(res.body.event.playground).toBe(body.playground);
        expect(res.body.event.peopleNum).toBe(body.peopleNum);
        expect(res.body.event.sport).toBe(body.sport);
      })
      .end(done);
  });

  it('should not return event created by other user', (done) => {
    request(app)
      .get(`/events/5cf8fd2191422217be955d43`)
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });

  it('should return 404 if event not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/events/${hexId}`)
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/events/123abc')
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /events/:id', () => {
  it('should update the event', (done) => {

    var newTitle = {'title': 'This should be the new title'};

    request(app)
      .patch(`/events/${eventId}`)
      .set('x-auth', toniToken)
      .send(newTitle)
      .expect(200)
      .expect((res) => {
        expect(res.body.event.title).toBe(newTitle.title);
      })
      .end(done);
  });

  it('should not update the todo created by other user', (done) => {

    var newTitle = {'title': 'This should be the new title'};

    request(app)
      .patch(`/todos/5cf8fd2191422217be955d43`)
      .set('x-auth', toniToken)
      .send(newTitle)
      .expect(404)
      .end(done);
  });

});


describe('DELETE /events/:id', () => {
  it('should remove an event', (done) => {

    request(app)
      .delete(`/events/${eventId}`)
      .set('x-auth', toniToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.event._id).toBe(eventId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Event.findById(eventId).then((event) => {
          expect(event).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('shouldnt remove an event created by another user', (done) => {

    request(app)
      .delete(`/events/5cf8fd2191422217be955d43`)
      .set('x-auth', toniToken)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Event.findById('5cf8fd2191422217be955d43').then((event) => {
          expect(event).toBeTruthy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if event not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/events/${hexId}`)
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/events/123abc')
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });
});
