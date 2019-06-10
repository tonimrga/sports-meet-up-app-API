const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {User} = require('../models/user');

var email = 'example@example.com';
var password = '123mnb!';
var username = 'example';
var country = 'Croatia';
var token = '';
var id = '';

describe('POST /users/register', () => {
  it('should create a user', (done) => {

    request(app)
      .post('/users/register')
      .send({email, password, username, country})
      .expect(200)
      .expect((res) => {
        expect(res.body.token).toBeTruthy();
        expect(res.body.user._id).toBeTruthy();
        expect(res.body.user.email).toBe(email);
        expect(res.body.user.username).toBe(username);
        expect(res.body.user.country).toBe(country);
        token = res.body.token;
        id = res.body.user._id;
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users/register')
      .send({
        email: 'and',
        password: '123',
        username: username,
        country: country
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users/register')
      .send({
        email: email,
        password: 'Password123!',
        username: 'test',
        country: country
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if username in use', (done) => {
    request(app)
      .post('/users/register')
      .send({
        email: 'test@test.com',
        password: 'Password123!',
        username: username,
        country: country
      })
      .expect(400)
      .end(done);
  });

});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(id);
        expect(res.body.email).toBe(email);
        expect(res.body.username).toBe(username);
        expect(res.body.country).toBe(country);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('DELETE /users/logout', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/logout')
      .set('x-auth', token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: email,
        password: password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        token = res.body.token;
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: email,
        password: password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});

describe('UPDATE /users/update', () => {
  it('should update users COUNTRY if authenticated', (done) => {
    request(app)
      .patch('/users/update')
      .set('x-auth', token)
      .send({
        country: 'Serbia'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(id);
        expect(res.body.user.email).toBe(email);
        expect(res.body.user.username).toBe(username);
        expect(res.body.user.country).toBe('Serbia');
        country = 'Serbia'
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .patch('/users/update')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});


describe('UPDATE /users/password', () => {
  it('should update users PASSWORD if authenticated', (done) => {
    request(app)
      .patch('/users/password')
      .set('x-auth', token)
      .send({
        password: 'test123'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(id);
        password = 'test123'
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .patch('/users/password')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('DELETE /users/delete', () => {
  it('should delete user if authenticated', (done) => {
    request(app)
      .delete('/users/delete')
      .set('x-auth', token)
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(id);
        expect(res.body.user.email).toBe(email);
        expect(res.body.user.username).toBe(username);
        expect(res.body.user.country).toBe(country);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .delete('/users/delete')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});
