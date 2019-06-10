const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Comment} = require('../models/comments');

var toniToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Y2Y4ZWE5ODZlZDA2YTEyMjc0OTlmNDkiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTU5ODE2ODU2fQ.--k8jlLccirC4QVoWch8KI2UrdSk6o7CBdcOPaKDT3w';
var eventId = '5cf8fd2191422217be955d43';
var userId = '5cf8ea986ed06a1227499f49';
var commentId = '';

describe('POST /comments/:event', () => {
  it('should create a comment to an event', (done) => {
    request(app)
      .post(`/comments/${eventId}`)
      .set('x-auth', toniToken)
      .send({
        "text": "Hello world"
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe("Hello world");
        expect(res.body._event).toBe(eventId);
        expect(res.body._user).toBe(userId);
        commentId = res.body._id;

      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Comment.find({'_event': eventId, "_user": userId}).then((response) => {
          expect(response.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a comment with invalid body data', (done) => {
    request(app)
      .post(`/comments/${eventId}`)
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
      .post(`/comments/${eventId}`)
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

describe('GET /comments', () => {
  it('should get all comments by one user', (done) => {
    request(app)
      .get('/comments')
      .set('x-auth', toniToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.comments.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /comments/event/:event', () => {
  it('should get all comments in one event', (done) => {
    request(app)
      .get(`/comments/event/${eventId}`)
      .set('x-auth', toniToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.comments.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /comments/:id', () => {
  it('should return one comment', (done) => {
    request(app)
      .get(`/comments/${commentId}`)
      .set('x-auth', toniToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.comment._id).toBe(commentId);
        expect(res.body.comment._user).toBe(userId);
        expect(res.body.comment._event).toBe(eventId);
        expect(res.body.comment.text).toBe("Hello world");
      })
      .end(done);
  });

  it('should not return a comment created by other user', (done) => {
    request(app)
      .get(`/comments/5cfa47a4cf16c6160e904b3f`)
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });

  it('should return 404 if comment not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/comments/${hexId}`)
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/comments/123abc')
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /comments/:id', () => {
  it('should update a comment', (done) => {

    var update = {'text': 'Hello world update'};

    request(app)
      .patch(`/comments/${commentId}`)
      .set('x-auth', toniToken)
      .send(update)
      .expect(200)
      .expect((res) => {
        expect(res.body.comment.text).toBe(update.text);
      })
      .end(done);
  });

  it('should not update a comment created by other user', (done) => {

    var update = {'text': 'Hello world no update'};

    request(app)
      .patch(`/comments/5cfa47a4cf16c6160e904b3f`)
      .set('x-auth', toniToken)
      .send(update)
      .expect(404)
      .end(done);
  });

});


describe('COMMENTS /comment/:id', () => {
  it('should remove a comment', (done) => {

    request(app)
      .delete(`/comments/${commentId}`)
      .set('x-auth', toniToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.comment._id).toBe(commentId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Comment.findById(commentId).then((comment) => {
          expect(comment).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('shouldnt remove a comment created by another user', (done) => {

    request(app)
      .delete(`/comments/5cfa47a4cf16c6160e904b3f`)
      .set('x-auth', toniToken)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Comment.findById('5cfa47a4cf16c6160e904b3f').then((comment) => {
          expect(comment).toBeTruthy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if response not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/comments/${hexId}`)
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/comments/123abc')
      .set('x-auth', toniToken)
      .expect(404)
      .end(done);
  });
});
