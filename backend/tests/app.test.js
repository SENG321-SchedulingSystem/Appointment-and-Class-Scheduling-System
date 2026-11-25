'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');
const { signToken } = require('../src/middleware/auth');
const { config } = require('../src/config/env');
const { createMemoryUserRepository } = require('./helpers/memoryUserRepository');

const app = createApp({ userRepo: createMemoryUserRepository() });

const tokenFor = (role, id = `${role.toLowerCase()}_1`) => `Bearer ${signToken({ id, role })}`;

function expectProblem(res, status, code) {
  expect(res.status).toBe(status);
  expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
  expect(res.body).toMatchObject({ status, code });
  expect(typeof res.body.title).toBe('string');
}

describe('health endpoints', () => {
  test('GET /health reports liveness and Firestore mode without touching the database', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(['emulator', 'cloud']).toContain(res.body.firestore.mode);
  });
});

describe('RFC 7807 error handling', () => {
  test('unknown route returns 404 problem+json', async () => {
    const res = await request(app).get('/does-not-exist');
    expectProblem(res, 404, 'ROUTE_NOT_FOUND');
  });

  test('malformed JSON body returns 400 problem+json', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expectProblem(res, 400, 'VALIDATION_ERROR');
  });
});

describe('authentication (401)', () => {
  test('missing Authorization header', async () => {
    const res = await request(app).post('/appointments').send({ availabilityId: 'avail_789' });
    expectProblem(res, 401, 'UNAUTHORIZED');
  });

  test('token signed with a different secret', async () => {
    const forged = jwt.sign({ role: 'ADMIN' }, 'not-the-server-secret', { subject: 'adm_1' });
    const res = await request(app).get('/users').set('Authorization', `Bearer ${forged}`);
    expectProblem(res, 401, 'UNAUTHORIZED');
  });

  test('expired token', async () => {
    const expired = signToken({ id: 'adm_1', role: 'ADMIN' }, { expiresIn: -10 });
    const res = await request(app).get('/users').set('Authorization', `Bearer ${expired}`);
    expectProblem(res, 401, 'UNAUTHORIZED');
  });

  test('token with an unknown role claim', async () => {
    const odd = jwt.sign({ role: 'SUPERUSER' }, config.jwt.secret, { subject: 'x_1' });
    const res = await request(app).get('/users').set('Authorization', `Bearer ${odd}`);
    expectProblem(res, 401, 'UNAUTHORIZED');
  });
});

describe('role authorization matrix (docs/UML_Diagrams.md §4.1)', () => {
  const matrix = [
    ['get', '/users', ['ADMIN']],
    ['post', '/users', ['ADMIN']],
    ['post', '/assignments', ['ADMIN']],
    ['get', '/availability', ['INSTRUCTOR', 'STUDENT']],
    ['post', '/availability', ['INSTRUCTOR']],
    ['delete', '/availability/avail_789', ['INSTRUCTOR']],
    ['post', '/appointments', ['STUDENT']],
  ];
  const roles = ['ADMIN', 'INSTRUCTOR', 'STUDENT'];

  for (const [method, path, allowed] of matrix) {
    for (const role of roles) {
      const isAllowed = allowed.includes(role);
      test(`${role} ${method.toUpperCase()} ${path} -> ${isAllowed ? 'passes guard' : '403'}`, async () => {
        const res = await request(app)[method](path).set('Authorization', tokenFor(role));
        if (isAllowed) {
          // Guard passed; whatever the handler answers, it is not an auth error.
          expect([401, 403]).not.toContain(res.status);
        } else {
          expectProblem(res, 403, 'FORBIDDEN');
        }
      });
    }
  }

  test('POST /auth/login is public (no token needed to reach validation)', async () => {
    const res = await request(app).post('/auth/login').send({});
    expectProblem(res, 400, 'VALIDATION_ERROR');
  });
});
