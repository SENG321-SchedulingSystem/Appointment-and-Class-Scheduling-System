'use strict';

// US-02 (#20): POST /assignments. Covers the 201, 400, 401, 403 and 404 cases
// from the issue's acceptance criteria and SRS FR-04 (one instructor per student).

const request = require('supertest');
const { createApp } = require('../src/app');
const { signToken } = require('../src/middleware/auth');
const { createMemoryUserRepository } = require('./helpers/memoryUserRepository');
const { createMemoryAssignmentRepository } = require('./helpers/memoryAssignmentRepository');
const { createMemoryAvailabilityRepository } = require('./helpers/memoryAvailabilityRepository');

const bearer = (id, role) => `Bearer ${signToken({ id, role })}`;
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
let ids;

beforeEach(async () => {
  userRepo = createMemoryUserRepository();
  assignmentRepo = createMemoryAssignmentRepository();
  availabilityRepo = createMemoryAvailabilityRepository();
  app = createApp({ userRepo, assignmentRepo, availabilityRepo });

  const make = (name, role) => userRepo.create({ name, email: `${name}@example.com`, passwordHash: 'h', role });
  ids = {
    student: (await make('stu', 'STUDENT')).id,
    student2: (await make('stu2', 'STUDENT')).id,
    instructor: (await make('inst', 'INSTRUCTOR')).id,
    instructor2: (await make('inst2', 'INSTRUCTOR')).id,
    admin: (await make('adm', 'ADMIN')).id,
  };
});

const assign = (body, auth = ADMIN) => {
  const req = request(app).post('/assignments');
  return (auth ? req.set('Authorization', auth) : req).send(body);
};

describe('POST /assignments', () => {
  test('201 persists the pairing and records the admin', async () => {
    const res = await assign({ studentId: ids.student, instructorId: ids.instructor });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ studentId: ids.student, instructorId: ids.instructor });
    expect(assignmentRepo.assignments.get(ids.student)).toEqual({
      studentId: ids.student,
      instructorId: ids.instructor,
      assignedBy: 'adm_1',
    });
  });

  test('re-assigning a student replaces the previous instructor (one active instructor)', async () => {
    await assign({ studentId: ids.student, instructorId: ids.instructor });
    const res = await assign({ studentId: ids.student, instructorId: ids.instructor2 });

    expect(res.status).toBe(201);
    expect(assignmentRepo.assignments.size).toBe(1);
    expect(await assignmentRepo.findByStudentId(ids.student)).toEqual({
      studentId: ids.student,
      instructorId: ids.instructor2,
    });
  });

  test('one instructor can have several students', async () => {
    await assign({ studentId: ids.student, instructorId: ids.instructor });
    await assign({ studentId: ids.student2, instructorId: ids.instructor });
    expect(assignmentRepo.assignments.size).toBe(2);
  });

  test.each([
    ['missing studentId', () => ({ instructorId: ids.instructor })],
    ['missing instructorId', () => ({ studentId: ids.student })],
    ['empty body', () => ({})],
    ['non-string id', () => ({ studentId: 42, instructorId: ids.instructor })],
    ['id with a path separator', () => ({ studentId: 'users/x', instructorId: ids.instructor })],
    ['array body', () => [ids.student, ids.instructor]],
  ])('400 VALIDATION_ERROR for %s', async (_label, body) => {
    expectProblem(await assign(body()), 400, 'VALIDATION_ERROR');
  });

  test.each([
    ['student assigned to another student', () => ({ studentId: ids.student, instructorId: ids.student2 })],
    ['instructor in the studentId field', () => ({ studentId: ids.instructor, instructorId: ids.instructor2 })],
    ['ids swapped', () => ({ studentId: ids.instructor, instructorId: ids.student })],
    ['admin as instructor', () => ({ studentId: ids.student, instructorId: ids.admin })],
  ])('400 ROLE_MISMATCH for %s', async (_label, body) => {
    expectProblem(await assign(body()), 400, 'ROLE_MISMATCH');
    expect(assignmentRepo.assignments.size).toBe(0);
  });

  test.each([
    ['unknown student', () => ({ studentId: 'stu_missing', instructorId: ids.instructor })],
    ['unknown instructor', () => ({ studentId: ids.student, instructorId: 'inst_missing' })],
  ])('404 RESOURCE_NOT_FOUND for %s', async (_label, body) => {
    const res = await assign(body());
    expectProblem(res, 404, 'RESOURCE_NOT_FOUND');
    expect(res.body.detail).toMatch(/_missing/);
  });

  test('401 without a token', async () => {
    expectProblem(await assign({ studentId: ids.student, instructorId: ids.instructor }, null), 401, 'UNAUTHORIZED');
  });

  test.each(['STUDENT', 'INSTRUCTOR'])('403 for a %s token', async (role) => {
    const res = await assign({ studentId: ids.student, instructorId: ids.instructor }, bearer('x_1', role));
    expectProblem(res, 403, 'FORBIDDEN');
    expect(assignmentRepo.assignments.size).toBe(0);
  });
});

describe('GET /users for the pairing dropdowns', () => {
  test.each([
    ['STUDENT', ['stu', 'stu2']],
    ['INSTRUCTOR', ['inst', 'inst2']],
  ])('?role=%s lists only that role', async (role, names) => {
    const res = await request(app).get(`/users?role=${role}`).set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.map((u) => u.name)).toEqual(names);
  });
});
