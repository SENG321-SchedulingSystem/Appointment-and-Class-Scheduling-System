'use strict';

// US-03 (#21): Instructor calendar availability management.
// Covers POST /availability, GET /availability (instructor view), and DELETE /availability/{id}
// according to SRS §3.3 (FR-05, FR-06, FR-07), docs/UML_Diagrams.md §3, and docs/QA_Strategy.md.

const request = require('supertest');
const { createApp } = require('../src/app');
const { signToken } = require('../src/middleware/auth');
const { createMemoryUserRepository } = require('./helpers/memoryUserRepository');
const { createMemoryAssignmentRepository } = require('./helpers/memoryAssignmentRepository');
const { createMemoryAvailabilityRepository } = require('./helpers/memoryAvailabilityRepository');

const bearer = (id, role) => `Bearer ${signToken({ id, role })}`;
const INSTRUCTOR_1 = bearer('inst_1', 'INSTRUCTOR');
const INSTRUCTOR_2 = bearer('inst_2', 'INSTRUCTOR');
const STUDENT = bearer('stu_1', 'STUDENT');
const ADMIN = bearer('adm_1', 'ADMIN');

function expectProblem(res, status, code) {
  expect(res.status).toBe(status);
  expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
  expect(res.body).toMatchObject({ status, code });
}

let userRepo;
let assignmentRepo;
let availabilityRepo;
let app;

// Future timestamp helpers (relative to test execution time)
const hoursFromNow = (h) => new Date(Date.now() + h * 3600 * 1000).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

beforeEach(async () => {
  userRepo = createMemoryUserRepository();
  assignmentRepo = createMemoryAssignmentRepository();
  availabilityRepo = createMemoryAvailabilityRepository();
  app = createApp({ userRepo, assignmentRepo, availabilityRepo });
});

describe('POST /availability (US-03: Add availability)', () => {
  test('201 creates availability with status AVAILABLE', async () => {
    const startTime = hoursFromNow(2);
    const endTime = hoursFromNow(3);

    const res = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({ startTime, endTime });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      instructorId: 'inst_1',
      startTime,
      endTime,
      status: 'AVAILABLE',
    });
    expect(typeof res.body.id).toBe('string');

    // Persisted in repository
    const saved = await availabilityRepo.findById(res.body.id);
    expect(saved).toMatchObject({
      id: res.body.id,
      instructorId: 'inst_1',
      startTime,
      endTime,
      status: 'AVAILABLE',
    });
  });

  test('400 when startTime is in the past', async () => {
    const startTime = hoursAgo(2);
    const endTime = hoursFromNow(1);

    const res = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({ startTime, endTime });

    expectProblem(res, 400, 'PAST_START_TIME');
  });

  test('400 when endTime is not after startTime (endTime <= startTime)', async () => {
    const t = hoursFromNow(5);

    const resEqual = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({ startTime: t, endTime: t });
    expectProblem(resEqual, 400, 'INVALID_TIME_RANGE');

    const resEarlier = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({ startTime: hoursFromNow(6), endTime: hoursFromNow(5) });
    expectProblem(resEarlier, 400, 'INVALID_TIME_RANGE');
  });

  test('400 when slot overlaps an existing slot of the same instructor', async () => {
    const t1 = hoursFromNow(10);
    const t2 = hoursFromNow(12);

    // Initial slot: 10h -> 12h
    const first = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({ startTime: t1, endTime: t2 });
    expect(first.status).toBe(201);

    // Overlapping slot: 11h -> 13h
    const overlapRes = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({ startTime: hoursFromNow(11), endTime: hoursFromNow(13) });
    expectProblem(overlapRes, 400, 'SLOT_OVERLAP');
  });

  test('adjacent slots for the same instructor are allowed (no overlap)', async () => {
    const t1 = hoursFromNow(20);
    const t2 = hoursFromNow(21);
    const t3 = hoursFromNow(22);

    const first = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({ startTime: t1, endTime: t2 });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({ startTime: t2, endTime: t3 });
    expect(second.status).toBe(201);
  });

  test('identical time slots for different instructors are allowed', async () => {
    const t1 = hoursFromNow(30);
    const t2 = hoursFromNow(31);

    const first = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({ startTime: t1, endTime: t2 });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_2)
      .send({ startTime: t1, endTime: t2 });
    expect(second.status).toBe(201);
  });

  test('400 for missing fields or invalid date format', async () => {
    const resEmpty = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({});
    expectProblem(resEmpty, 400, 'VALIDATION_ERROR');

    const resInvalidDate = await request(app)
      .post('/availability')
      .set('Authorization', INSTRUCTOR_1)
      .send({ startTime: 'not-a-date', endTime: '2026-12-01T10:00:00Z' });
    expectProblem(resInvalidDate, 400, 'VALIDATION_ERROR');
  });

  test('401 without Authorization token', async () => {
    const res = await request(app)
      .post('/availability')
      .send({ startTime: hoursFromNow(1), endTime: hoursFromNow(2) });
    expectProblem(res, 401, 'UNAUTHORIZED');
  });

  test('403 for non-instructor roles (STUDENT or ADMIN)', async () => {
    const payload = { startTime: hoursFromNow(1), endTime: hoursFromNow(2) };

    const studentRes = await request(app)
      .post('/availability')
      .set('Authorization', STUDENT)
      .send(payload);
    expectProblem(studentRes, 403, 'FORBIDDEN');

    const adminRes = await request(app)
      .post('/availability')
      .set('Authorization', ADMIN)
      .send(payload);
    expectProblem(adminRes, 403, 'FORBIDDEN');
  });
});

describe('GET /availability (US-03: Instructor view)', () => {
  test('200 lists instructor own slots including AVAILABLE and BOOKED', async () => {
    const slot1 = await availabilityRepo.create({
      instructorId: 'inst_1',
      startTime: hoursFromNow(1),
      endTime: hoursFromNow(2),
      status: 'AVAILABLE',
    });
    const slot2 = await availabilityRepo.create({
      instructorId: 'inst_1',
      startTime: hoursFromNow(3),
      endTime: hoursFromNow(4),
      status: 'BOOKED',
    });
    // Another instructor's slot must not be included
    await availabilityRepo.create({
      instructorId: 'inst_2',
      startTime: hoursFromNow(1),
      endTime: hoursFromNow(2),
      status: 'AVAILABLE',
    });

    const res = await request(app)
      .get('/availability')
      .set('Authorization', INSTRUCTOR_1);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((s) => s.id)).toEqual([slot1.id, slot2.id]);
  });

  test('200 filters slots by from and to query parameters', async () => {
    await availabilityRepo.create({
      instructorId: 'inst_1',
      startTime: '2026-12-01T10:00:00Z',
      endTime: '2026-12-01T11:00:00Z',
    });
    const middleSlot = await availabilityRepo.create({
      instructorId: 'inst_1',
      startTime: '2026-12-05T10:00:00Z',
      endTime: '2026-12-05T11:00:00Z',
    });
    await availabilityRepo.create({
      instructorId: 'inst_1',
      startTime: '2026-12-10T10:00:00Z',
      endTime: '2026-12-10T11:00:00Z',
    });

    const res = await request(app)
      .get('/availability')
      .query({ from: '2026-12-04T00:00:00Z', to: '2026-12-06T23:59:59Z' })
      .set('Authorization', INSTRUCTOR_1);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(middleSlot.id);
  });

  test('200 returns empty array when instructor has no slots', async () => {
    const res = await request(app)
      .get('/availability')
      .set('Authorization', INSTRUCTOR_1);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('400 on invalid from/to date format or invalid instructorId query param', async () => {
    const resFrom = await request(app)
      .get('/availability')
      .query({ from: 'bad-date' })
      .set('Authorization', INSTRUCTOR_1);
    expectProblem(resFrom, 400, 'VALIDATION_ERROR');

    const resTo = await request(app)
      .get('/availability')
      .query({ to: 'bad-date' })
      .set('Authorization', INSTRUCTOR_1);
    expectProblem(resTo, 400, 'VALIDATION_ERROR');

    const resId = await request(app)
      .get('/availability')
      .query({ instructorId: 'invalid/id' })
      .set('Authorization', INSTRUCTOR_1);
    expectProblem(resId, 400, 'VALIDATION_ERROR');
  });

  test('200 when instructor explicitly passes their own instructorId query param', async () => {
    const slot = await availabilityRepo.create({
      instructorId: 'inst_1',
      startTime: hoursFromNow(5),
      endTime: hoursFromNow(6),
    });

    const res = await request(app)
      .get('/availability')
      .query({ instructorId: 'inst_1' })
      .set('Authorization', INSTRUCTOR_1);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(slot.id);
  });

  test('403 when instructor queries another instructorId', async () => {
    const res = await request(app)
      .get('/availability')
      .query({ instructorId: 'inst_2' })
      .set('Authorization', INSTRUCTOR_1);

    expectProblem(res, 403, 'FORBIDDEN');
  });

  test('401 without token and 403 for ADMIN', async () => {
    const resNoAuth = await request(app).get('/availability');
    expectProblem(resNoAuth, 401, 'UNAUTHORIZED');

    const resAdmin = await request(app).get('/availability').set('Authorization', ADMIN);
    expectProblem(resAdmin, 403, 'FORBIDDEN');
  });
});

describe('DELETE /availability/:id (US-03: Delete availability slot)', () => {
  test('204 successfully deletes an unbooked (AVAILABLE) slot', async () => {
    const slot = await availabilityRepo.create({
      instructorId: 'inst_1',
      startTime: hoursFromNow(2),
      endTime: hoursFromNow(3),
      status: 'AVAILABLE',
    });

    const res = await request(app)
      .delete(`/availability/${slot.id}`)
      .set('Authorization', INSTRUCTOR_1);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');

    // Slot is removed
    const found = await availabilityRepo.findById(slot.id);
    expect(found).toBeNull();
  });

  test('404 SLOT_NOT_FOUND when slot does not exist', async () => {
    const res = await request(app)
      .delete('/availability/avail_nonexistent')
      .set('Authorization', INSTRUCTOR_1);

    expectProblem(res, 404, 'SLOT_NOT_FOUND');
  });

  test('403 FORBIDDEN when attempting to delete another instructor slot', async () => {
    const slot = await availabilityRepo.create({
      instructorId: 'inst_2',
      startTime: hoursFromNow(2),
      endTime: hoursFromNow(3),
      status: 'AVAILABLE',
    });

    const res = await request(app)
      .delete(`/availability/${slot.id}`)
      .set('Authorization', INSTRUCTOR_1);

    expectProblem(res, 403, 'FORBIDDEN');
  });

  test('409 SLOT_ALREADY_BOOKED when slot status is BOOKED', async () => {
    const bookedSlot = await availabilityRepo.create({
      instructorId: 'inst_1',
      startTime: hoursFromNow(2),
      endTime: hoursFromNow(3),
      status: 'BOOKED',
    });

    const res = await request(app)
      .delete(`/availability/${bookedSlot.id}`)
      .set('Authorization', INSTRUCTOR_1);

    expectProblem(res, 409, 'SLOT_ALREADY_BOOKED');

    // Slot should still exist in repo
    const found = await availabilityRepo.findById(bookedSlot.id);
    expect(found).not.toBeNull();
  });

  test('400 for invalid slot id format', async () => {
    const res = await request(app)
      .delete('/availability/invalid%2Fid')
      .set('Authorization', INSTRUCTOR_1);

    expectProblem(res, 400, 'VALIDATION_ERROR');
  });

  test('401 without token and 403 for non-instructor (STUDENT, ADMIN)', async () => {
    const slot = await availabilityRepo.create({
      instructorId: 'inst_1',
      startTime: hoursFromNow(2),
      endTime: hoursFromNow(3),
      status: 'AVAILABLE',
    });

    const resNoAuth = await request(app).delete(`/availability/${slot.id}`);
    expectProblem(resNoAuth, 401, 'UNAUTHORIZED');

    const resStudent = await request(app)
      .delete(`/availability/${slot.id}`)
      .set('Authorization', STUDENT);
    expectProblem(resStudent, 403, 'FORBIDDEN');

    const resAdmin = await request(app)
      .delete(`/availability/${slot.id}`)
      .set('Authorization', ADMIN);
    expectProblem(resAdmin, 403, 'FORBIDDEN');
  });
});
