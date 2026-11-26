'use strict';

// US-04 (#22): GET /availability as a STUDENT (SRS FR-07 rule 1).
// The student sees only future AVAILABLE slots of their single assigned instructor.

const request = require('supertest');
const { createApp } = require('../src/app');
const { signToken } = require('../src/middleware/auth');
const { createMemoryUserRepository } = require('./helpers/memoryUserRepository');
const { createMemoryAssignmentRepository } = require('./helpers/memoryAssignmentRepository');
const { createMemoryAvailabilityRepository } = require('./helpers/memoryAvailabilityRepository');

const bearer = (id, role) => `Bearer ${signToken({ id, role })}`;
const STUDENT = bearer('stu_1', 'STUDENT');
const UNASSIGNED_STUDENT = bearer('stu_2', 'STUDENT');

const hoursFromNow = (h) => new Date(Date.now() + h * 3600 * 1000).toISOString();

function expectProblem(res, status, code) {
  expect(res.status).toBe(status);
  expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
  expect(res.body).toMatchObject({ status, code });
}

let assignmentRepo;
let availabilityRepo;
let app;

const slot = (id, instructorId, startH, status = 'AVAILABLE') =>
  availabilityRepo.create({ id, instructorId, startTime: hoursFromNow(startH), endTime: hoursFromNow(startH + 1), status });

beforeEach(async () => {
  assignmentRepo = createMemoryAssignmentRepository();
  availabilityRepo = createMemoryAvailabilityRepository();
  app = createApp({ userRepo: createMemoryUserRepository(), assignmentRepo, availabilityRepo });

  await assignmentRepo.upsert({ studentId: 'stu_1', instructorId: 'inst_A', assignedBy: 'adm_1' });

  await slot('a_past', 'inst_A', -5); // already started: hidden
  await slot('a_open_2', 'inst_A', 48);
  await slot('a_open_1', 'inst_A', 2);
  await slot('a_booked', 'inst_A', 24, 'BOOKED'); // booked by someone else: hidden
  await slot('b_open', 'inst_B', 3); // another instructor: hidden
});

const get = (auth, query = '') => request(app).get(`/availability${query}`).set('Authorization', auth);

describe('GET /availability as STUDENT', () => {
  test('200 with only future AVAILABLE slots of the assigned instructor, sorted by start time', async () => {
    const res = await get(STUDENT);

    expect(res.status).toBe(200);
    expect(res.body.map((s) => s.id)).toEqual(['a_open_1', 'a_open_2']);
    for (const s of res.body) {
      expect(s).toEqual({
        id: expect.any(String),
        instructorId: 'inst_A',
        startTime: expect.any(String),
        endTime: expect.any(String),
        status: 'AVAILABLE',
      });
    }
  });

  test('from / to narrow the result', async () => {
    const res = await get(STUDENT, `?from=${hoursFromNow(24)}&to=${hoursFromNow(72)}`);
    expect(res.body.map((s) => s.id)).toEqual(['a_open_2']);
  });

  test('instructorId equal to the assigned instructor is accepted', async () => {
    const res = await get(STUDENT, '?instructorId=inst_A');
    expect(res.body.map((s) => s.id)).toEqual(['a_open_1', 'a_open_2']);
  });

  test('200 with [] when the assigned instructor has no open slots', async () => {
    await availabilityRepo.availabilities.clear();
    await slot('a_booked', 'inst_A', 24, 'BOOKED');

    const res = await get(STUDENT);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('403 INSTRUCTOR_NOT_ASSIGNED for a student without an instructor', async () => {
    expectProblem(await get(UNASSIGNED_STUDENT), 403, 'INSTRUCTOR_NOT_ASSIGNED');
  });

  test('403 INSTRUCTOR_NOT_ASSIGNED when asking for another instructor', async () => {
    expectProblem(await get(STUDENT, '?instructorId=inst_B'), 403, 'INSTRUCTOR_NOT_ASSIGNED');
  });

  test.each([
    ['malformed from', '?from=yesterday'],
    ['malformed to', '?to=2026-13-45'],
    ['malformed instructorId', '?instructorId=a/b'],
  ])('400 VALIDATION_ERROR for %s', async (_label, query) => {
    expectProblem(await get(STUDENT, query), 400, 'VALIDATION_ERROR');
  });

  test('401 without a token, 403 FORBIDDEN for an ADMIN', async () => {
    expectProblem(await request(app).get('/availability'), 401, 'UNAUTHORIZED');
    expectProblem(await get(bearer('adm_1', 'ADMIN')), 403, 'FORBIDDEN');
  });

  test('re-assignment switches the visible calendar immediately', async () => {
    await assignmentRepo.upsert({ studentId: 'stu_1', instructorId: 'inst_B', assignedBy: 'adm_1' });

    const res = await get(STUDENT);
    expect(res.body.map((s) => s.id)).toEqual(['b_open']);
  });
});
