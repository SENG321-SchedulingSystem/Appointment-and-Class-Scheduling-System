'use strict';

// US-01 (#19): POST /auth/login, POST /users, GET /users.
// Covers the 200, 201, 400, 401, 403 and 409 cases from the issue's
// acceptance criteria, against an in-memory user repository.

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');
const { signToken } = require('../src/middleware/auth');
const { config } = require('../src/config/env');
const { hashPassword } = require('../src/services/password');
const { createMemoryUserRepository } = require('./helpers/memoryUserRepository');

const bearer = (id, role) => `Bearer ${signToken({ id, role })}`;
const ADMIN = bearer('adm_1', 'ADMIN');

function expectProblem(res, status, code) {
  expect(res.status).toBe(status);
  expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
  expect(res.body).toMatchObject({ status, code });
}

let repo;
let app;

beforeEach(async () => {
  repo = createMemoryUserRepository();
  app = createApp({ userRepo: repo });
  await repo.create({
    name: 'Eren Okat',
    email: 'eren@example.com',
    passwordHash: await hashPassword('password123'),
    role: 'STUDENT',
  });
});

const newUser = (overrides = {}) => ({
  name: 'Ayse Hoca',
  email: 'ayse@example.com',
  password: 'secret123',
  role: 'INSTRUCTOR',
  ...overrides,
});

describe('POST /auth/login', () => {
  test('200 with a signed token, userId, name and role', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'eren@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: expect.any(String), userId: 'usr_1', name: 'Eren Okat', role: 'STUDENT' });

    const claims = jwt.verify(res.body.token, config.jwt.secret);
    expect(claims).toMatchObject({ sub: 'usr_1', role: 'STUDENT' });
  });

  test('email is matched case-insensitively', async () => {
    const res = await request(app).post('/auth/login').send({ email: '  Eren@Example.COM ', password: 'password123' });
    expect(res.status).toBe(200);
  });

  test('the issued token works on a protected route', async () => {
    const admin = await request(app)
      .post('/users')
      .set('Authorization', ADMIN)
      .send(newUser({ email: 'boss@example.com', role: 'ADMIN' }));
    const login = await request(app).post('/auth/login').send({ email: 'boss@example.com', password: 'secret123' });
    const res = await request(app).get('/users').set('Authorization', `Bearer ${login.body.token}`);

    expect(admin.status).toBe(201);
    expect(res.status).toBe(200);
  });

  test('401 for a wrong password', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'eren@example.com', password: 'wrong-pass' });
    expectProblem(res, 401, 'UNAUTHORIZED');
  });

  test('401 for an unknown email, with the same message as a wrong password', async () => {
    const unknown = await request(app).post('/auth/login').send({ email: 'nobody@example.com', password: 'password123' });
    const wrong = await request(app).post('/auth/login').send({ email: 'eren@example.com', password: 'nope-nope' });
    expectProblem(unknown, 401, 'UNAUTHORIZED');
    expect(unknown.body.detail).toBe(wrong.body.detail);
  });

  test.each([
    ['missing email', { password: 'password123' }],
    ['missing password', { email: 'eren@example.com' }],
    ['malformed email', { email: 'not-an-email', password: 'password123' }],
    ['non-string password', { email: 'eren@example.com', password: 12345678 }],
    ['array body', [1, 2]],
  ])('400 for %s', async (_label, body) => {
    const res = await request(app).post('/auth/login').send(body);
    expectProblem(res, 400, 'VALIDATION_ERROR');
  });
});

describe('POST /users', () => {
  test('201 returns id, name, email, role and never the password', async () => {
    const res = await request(app).post('/users').set('Authorization', ADMIN).send(newUser());

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: expect.any(String), name: 'Ayse Hoca', email: 'ayse@example.com', role: 'INSTRUCTOR' });
    expect(JSON.stringify(res.body)).not.toMatch(/password|secret123/i);
  });

  test('stores a bcrypt hash, not the plain password', async () => {
    const res = await request(app).post('/users').set('Authorization', ADMIN).send(newUser());
    const stored = repo.users.get(res.body.id);

    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(stored.passwordHash).not.toContain('secret123');
  });

  test('normalizes email and trims name', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', ADMIN)
      .send(newUser({ name: '  Ayse Hoca ', email: ' AYSE@Example.com ' }));
    expect(res.body).toMatchObject({ name: 'Ayse Hoca', email: 'ayse@example.com' });
  });

  test('409 EMAIL_ALREADY_EXISTS for a duplicate email (any case)', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', ADMIN)
      .send(newUser({ email: 'EREN@example.com' }));
    expectProblem(res, 409, 'EMAIL_ALREADY_EXISTS');
  });

  test.each([
    ['missing name', { name: undefined }],
    ['blank name', { name: '   ' }],
    ['missing email', { email: undefined }],
    ['malformed email', { email: 'ayse@nowhere' }],
    ['missing password', { password: undefined }],
    ['weak password (< 8 chars)', { password: 'short' }],
    ['missing role', { role: undefined }],
    ['unknown role', { role: 'SUPERUSER' }],
  ])('400 for %s', async (_label, overrides) => {
    const res = await request(app).post('/users').set('Authorization', ADMIN).send(newUser(overrides));
    expectProblem(res, 400, 'VALIDATION_ERROR');
  });

  test('401 without a token', async () => {
    const res = await request(app).post('/users').send(newUser());
    expectProblem(res, 401, 'UNAUTHORIZED');
  });

  test.each(['INSTRUCTOR', 'STUDENT'])('403 for a %s token', async (role) => {
    const res = await request(app).post('/users').set('Authorization', bearer('x_1', role)).send(newUser());
    expectProblem(res, 403, 'FORBIDDEN');
  });
});

describe('GET /users', () => {
  beforeEach(async () => {
    for (const [name, role] of [['Zeynep', 'INSTRUCTOR'], ['Ali', 'INSTRUCTOR'], ['Mert', 'ADMIN']]) {
      await request(app)
        .post('/users')
        .set('Authorization', ADMIN)
        .send(newUser({ name, role, email: `${name.toLowerCase()}@example.com` }));
    }
  });

  test('200 lists all users sorted by name, without password hashes', async () => {
    const res = await request(app).get('/users').set('Authorization', ADMIN);

    expect(res.status).toBe(200);
    expect(res.body.map((u) => u.name)).toEqual(['Ali', 'Eren Okat', 'Mert', 'Zeynep']);
    for (const u of res.body) expect(Object.keys(u).sort()).toEqual(['email', 'id', 'name', 'role']);
  });

  test('filters by role', async () => {
    const res = await request(app).get('/users?role=INSTRUCTOR').set('Authorization', ADMIN);
    expect(res.body.map((u) => u.name)).toEqual(['Ali', 'Zeynep']);
  });

  test('400 for an invalid role filter', async () => {
    const res = await request(app).get('/users?role=teacher').set('Authorization', ADMIN);
    expectProblem(res, 400, 'VALIDATION_ERROR');
  });

  test('401 without a token and 403 for a non-admin', async () => {
    expectProblem(await request(app).get('/users'), 401, 'UNAUTHORIZED');
    expectProblem(await request(app).get('/users').set('Authorization', bearer('s_1', 'STUDENT')), 403, 'FORBIDDEN');
  });
});
