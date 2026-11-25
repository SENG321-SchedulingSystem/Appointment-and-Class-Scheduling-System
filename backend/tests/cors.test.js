'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const { loadConfig } = require('../src/config/env');
const { createMemoryUserRepository } = require('./helpers/memoryUserRepository');
const { createMemoryAssignmentRepository } = require('./helpers/memoryAssignmentRepository');

const FRONTEND = 'http://localhost:5173';

const appWith = (corsOrigins) =>
  createApp({
    userRepo: createMemoryUserRepository(),
    assignmentRepo: createMemoryAssignmentRepository(),
    corsOrigins,
  });

describe('CORS', () => {
  const app = appWith([FRONTEND]);

  test('preflight from an allowed origin answers 204 with the allowed methods and headers', async () => {
    const res = await request(app)
      .options('/users')
      .set('Origin', FRONTEND)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(FRONTEND);
    expect(res.headers['access-control-allow-methods']).toMatch(/POST/);
    expect(res.headers['access-control-allow-methods']).toMatch(/DELETE/);
    expect(res.headers['access-control-allow-headers']).toMatch(/Authorization/);
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
  });

  test('preflight is answered before the auth guard (no token needed)', async () => {
    const res = await request(app)
      .options('/appointments')
      .set('Origin', FRONTEND)
      .set('Access-Control-Request-Method', 'POST');
    expect(res.status).toBe(204);
  });

  test('normal and error responses carry the header for an allowed origin', async () => {
    const ok = await request(app).get('/health').set('Origin', FRONTEND);
    const unauthorized = await request(app).get('/users').set('Origin', FRONTEND);

    expect(ok.headers['access-control-allow-origin']).toBe(FRONTEND);
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.headers['access-control-allow-origin']).toBe(FRONTEND);
    expect(unauthorized.headers.vary).toMatch(/Origin/);
  });

  test('an unknown origin gets no CORS headers', async () => {
    const res = await request(app)
      .options('/users')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.status).not.toBe(204);
  });

  test('requests without an Origin header (curl, server-to-server) are unaffected', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('"*" allows any origin', async () => {
    const res = await request(appWith(['*'])).get('/health').set('Origin', 'https://anything.example');
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });
});

describe('CORS_ORIGINS configuration', () => {
  test('development defaults to the Vite dev server', () => {
    expect(loadConfig({}).corsOrigins).toEqual(['http://localhost:5173', 'http://127.0.0.1:5173']);
  });

  test('production has no default origins', () => {
    expect(loadConfig({ NODE_ENV: 'production', JWT_SECRET: 's' }).corsOrigins).toEqual([]);
  });

  test('parses a comma-separated list, trimming spaces and trailing slashes', () => {
    const cfg = loadConfig({ CORS_ORIGINS: ' https://app.vercel.app/ , http://localhost:5173 ,' });
    expect(cfg.corsOrigins).toEqual(['https://app.vercel.app', 'http://localhost:5173']);
  });

  test('an empty CORS_ORIGINS disables CORS even in development', () => {
    expect(loadConfig({ CORS_ORIGINS: '' }).corsOrigins).toEqual([]);
  });
});
