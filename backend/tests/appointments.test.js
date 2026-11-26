'use strict';

// US-05 (#23): Student appointment booking with concurrency prevention.
// Tests POST /appointments according to SRS FR-08, docs/UML_Diagrams.md §2, and docs/QA_Strategy.md.

const request = require('supertest');
const { createApp } = require('../src/app');
const { signToken } = require('../src/middleware/auth');
const { createMemoryUserRepository } = require('./helpers/memoryUserRepository');
const { createMemoryAssignmentRepository } = require('./helpers/memoryAssignmentRepository');
const { createMemoryAvailabilityRepository } = require('./helpers/memoryAvailabilityRepository');
const { createMemoryAppointmentRepository } = require('./helpers/memoryAppointmentRepository');

const bearer = (id, role) => `Bearer ${signToken({ id, role })}`;
const STUDENT_1 = bearer('stu_1', 'STUDENT');
const STUDENT_2 = bearer('stu_2', 'STUDENT');
const UNASSIGNED_STUDENT = bearer('stu_unassigned', 'STUDENT');
const INSTRUCTOR = bearer('inst_1', 'INSTRUCTOR');
const ADMIN = bearer('adm_1', 'ADMIN');

function expectProblem(res, status, code) {
  expect(res.status).toBe(status);
  expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
  expect(res.body).toMatchObject({ status, code });
}

let userRepo;
let assignmentRepo;
let availabilityRepo;
let appointmentRepo;
let app;

const hoursFromNow = (h) => new Date(Date.now() + h * 3600 * 1000).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

beforeEach(async () => {
  userRepo = createMemoryUserRepository();
  assignmentRepo = createMemoryAssignmentRepository();
  availabilityRepo = createMemoryAvailabilityRepository();
  appointmentRepo = createMemoryAppointmentRepository({ availabilityRepo, assignmentRepo });

  app = createApp({
    userRepo,
    assignmentRepo,
    availabilityRepo,
    appointmentRepo,
  });

  // Assign Student 1 and Student 2 to Instructor A
  await assignmentRepo.upsert({ studentId: 'stu_1', instructorId: 'inst_A', assignedBy: 'adm_1' });
  await assignmentRepo.upsert({ studentId: 'stu_2', instructorId: 'inst_A', assignedBy: 'adm_1' });

  // Create an available slot for Instructor A
  await availabilityRepo.create({
    id: 'avail_101',
    instructorId: 'inst_A',
    startTime: hoursFromNow(2),
    endTime: hoursFromNow(3),
    status: 'AVAILABLE',
  });

  // Create an available slot for Instructor B (different instructor)
  await availabilityRepo.create({
    id: 'avail_202',
    instructorId: 'inst_B',
    startTime: hoursFromNow(4),
    endTime: hoursFromNow(5),
    status: 'AVAILABLE',
  });
});

describe('POST /appointments (US-05: Book appointment)', () => {
  test('201 atomically creates SCHEDULED appointment and marks slot BOOKED', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', STUDENT_1)
      .send({ availabilityId: 'avail_101' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      availabilityId: 'avail_101',
      studentId: 'stu_1',
      status: 'SCHEDULED',
    });

    // Slot is now BOOKED
    const slot = await availabilityRepo.findById('avail_101');
    expect(slot.status).toBe('BOOKED');

    // Appointment is persisted
    const appt = await appointmentRepo.findById(res.body.id);
    expect(appt).toMatchObject({
      id: res.body.id,
      availabilityId: 'avail_101',
      studentId: 'stu_1',
      status: 'SCHEDULED',
    });
  });

  test('studentId sent in request body is ignored; JWT user id is stored', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', STUDENT_1)
      .send({ availabilityId: 'avail_101', studentId: 'forged_student_id' });

    expect(res.status).toBe(201);
    expect(res.body.studentId).toBe('stu_1');
  });

  test('409 SLOT_UNAVAILABLE when slot is already BOOKED', async () => {
    // First booking succeeds
    await request(app)
      .post('/appointments')
      .set('Authorization', STUDENT_1)
      .send({ availabilityId: 'avail_101' });

    // Second booking attempt on the same slot fails with 409
    const resConflict = await request(app)
      .post('/appointments')
      .set('Authorization', STUDENT_2)
      .send({ availabilityId: 'avail_101' });

    expectProblem(resConflict, 409, 'SLOT_UNAVAILABLE');
  });

  test('403 INSTRUCTOR_NOT_ASSIGNED when student has no assigned instructor', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', UNASSIGNED_STUDENT)
      .send({ availabilityId: 'avail_101' });

    expectProblem(res, 403, 'INSTRUCTOR_NOT_ASSIGNED');
  });

  test('403 INSTRUCTOR_NOT_ASSIGNED when slot belongs to another instructor', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', STUDENT_1)
      .send({ availabilityId: 'avail_202' }); // avail_202 belongs to inst_B

    expectProblem(res, 403, 'INSTRUCTOR_NOT_ASSIGNED');
  });

  test('404 SLOT_NOT_FOUND when availabilityId does not exist', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', STUDENT_1)
      .send({ availabilityId: 'avail_nonexistent' });

    expectProblem(res, 404, 'SLOT_NOT_FOUND');
  });

  test('400 PAST_START_TIME when attempting to book a slot that has already started', async () => {
    await availabilityRepo.create({
      id: 'avail_past',
      instructorId: 'inst_A',
      startTime: hoursAgo(2),
      endTime: hoursAgo(1),
      status: 'AVAILABLE',
    });

    const res = await request(app)
      .post('/appointments')
      .set('Authorization', STUDENT_1)
      .send({ availabilityId: 'avail_past' });

    expectProblem(res, 400, 'PAST_START_TIME');
  });

  test('400 for missing availabilityId or invalid payload format', async () => {
    const resEmpty = await request(app)
      .post('/appointments')
      .set('Authorization', STUDENT_1)
      .send({});
    expectProblem(resEmpty, 400, 'VALIDATION_ERROR');

    const resInvalidId = await request(app)
      .post('/appointments')
      .set('Authorization', STUDENT_1)
      .send({ availabilityId: 'invalid/id' });
    expectProblem(resInvalidId, 400, 'VALIDATION_ERROR');

    const resArray = await request(app)
      .post('/appointments')
      .set('Authorization', STUDENT_1)
      .send([{ availabilityId: 'avail_101' }]);
    expectProblem(resArray, 400, 'VALIDATION_ERROR');
  });

  test('401 without token', async () => {
    const res = await request(app)
      .post('/appointments')
      .send({ availabilityId: 'avail_101' });

    expectProblem(res, 401, 'UNAUTHORIZED');
  });

  test('403 for non-STUDENT roles (INSTRUCTOR, ADMIN)', async () => {
    const resInst = await request(app)
      .post('/appointments')
      .set('Authorization', INSTRUCTOR)
      .send({ availabilityId: 'avail_101' });
    expectProblem(resInst, 403, 'FORBIDDEN');

    const resAdmin = await request(app)
      .post('/appointments')
      .set('Authorization', ADMIN)
      .send({ availabilityId: 'avail_101' });
    expectProblem(resAdmin, 403, 'FORBIDDEN');
  });
});

describe('Concurrent Booking Prevention (Scenario 2 & NFR-C1/C2)', () => {
  test('simultaneous booking by two students yields exactly one 201 and one 409', async () => {
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/appointments')
        .set('Authorization', STUDENT_1)
        .send({ availabilityId: 'avail_101' }),
      request(app)
        .post('/appointments')
        .set('Authorization', STUDENT_2)
        .send({ availabilityId: 'avail_101' }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 409]);

    const successRes = res1.status === 201 ? res1 : res2;
    const conflictRes = res1.status === 409 ? res1 : res2;

    expect(successRes.body.status).toBe('SCHEDULED');
    expectProblem(conflictRes, 409, 'SLOT_UNAVAILABLE');

    // Exactly one appointment exists
    expect(appointmentRepo.appointments.size).toBe(1);

    // Slot is BOOKED
    const slot = await availabilityRepo.findById('avail_101');
    expect(slot.status).toBe('BOOKED');
  });

  test('stress concurrency: 5 students competing for 1 slot yields exactly 1 success and 4 conflicts', async () => {
    // Set up 5 students assigned to Instructor A
    for (let i = 1; i <= 5; i++) {
      await assignmentRepo.upsert({ studentId: `stu_stress_${i}`, instructorId: 'inst_A', assignedBy: 'adm_1' });
    }

    const responses = await Promise.all(
      [1, 2, 3, 4, 5].map((i) =>
        request(app)
          .post('/appointments')
          .set('Authorization', bearer(`stu_stress_${i}`, 'STUDENT'))
          .send({ availabilityId: 'avail_101' }),
      ),
    );

    const successes = responses.filter((r) => r.status === 201);
    const conflicts = responses.filter((r) => r.status === 409);

    expect(successes).toHaveLength(1);
    expect(conflicts).toHaveLength(4);

    expect(appointmentRepo.appointments.size).toBe(1);
    const slot = await availabilityRepo.findById('avail_101');
    expect(slot.status).toBe('BOOKED');
  });
});
