const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Response} = require('../models/response');

var toniToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Y2Y4ZWE5ODZlZDA2YTEyMjc0OTlmNDkiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTU5ODE2ODU2fQ.--k8jlLccirC4QVoWch8KI2UrdSk6o7CBdcOPaKDT3w';
var eventId = '5cf8fd2191422217be955d43';
var userId = '5cf8ea986ed06a1227499f49';
var responseId = '';

describe('POST /response', () => {
  it('should create a response to an event', (done) => {
    request(app)
      .post('/response')
      .set('x-auth', toniToken)
      .send({
        "status": "yes",
        "event": eventId
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe("yes");
        expect(res.body._event).toBe(eventId);
        expect(res.body._user).toBe(userId);
        responseId = res.body._id;

      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Response.find({'_event': eventId, "_user": userId}).then((response) => {
          expect(response.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a response with invalid body data', (done) => {
    request(app)
      .post('/response')
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
      .post('/response')
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

describe('GET /response', () => {
  it('should get all responses answered with coming(yes)', (done) => {
    request(app)
      .get('/response')
      .set('x-auth', toniToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.response.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /response/:id', () => {
  it('should return one response', (done) => {
    request(app)
      .get(`/response/${responseId}`)
      .set('x-auth', toniToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.response._id).toBe(responseId);
        expect(res.body.response._user).toBe(userId);
        expect(res.body.response._event).toBe(eventId);
        expect(res.body.response.status).toBe("yes");
      })
      .end(done);
  });

  it('should not return response created by other user', (done) => {
    request(app)
      .get(`/response/5cfa3d75cc347d117bfab439`)
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });

  it('should return 404 if response not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/response/${hexId}`)
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/response/123abc')
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /response/:id', () => {
  it('should update the response', (done) => {

    var status = {'status': 'no'};

    request(app)
      .patch(`/response/${responseId}`)
      .set('x-auth', toniToken)
      .send(status)
      .expect(200)
      .expect((res) => {
        expect(res.body.response.status).toBe(status.status);
      })
      .end(done);
  });

  it('should not update the response created by other user', (done) => {

    var status = {'status': 'no'};

    request(app)
      .patch(`/response/5cfa3d75cc347d117bfab439`)
      .set('x-auth', toniToken)
      .send(status)
      .expect(404)
      .end(done);
  });

});


describe('DELETE /response/:id', () => {
  it('should remove an response', (done) => {

    request(app)
      .delete(`/response/${responseId}`)
      .set('x-auth', toniToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.response._id).toBe(responseId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Response.findById(responseId).then((response) => {
          expect(response).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('shouldnt remove an response created by another user', (done) => {

    request(app)
      .delete(`/response/5cfa3d75cc347d117bfab439`)
      .set('x-auth', toniToken)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Response.findById('5cfa3d75cc347d117bfab439').then((event) => {
          expect(event).toBeTruthy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if response not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/response/${hexId}`)
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/response/123abc')
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });
});
