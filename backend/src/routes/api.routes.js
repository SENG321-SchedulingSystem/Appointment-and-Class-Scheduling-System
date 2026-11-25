'use strict';

// Routes for every operation in openapi.yaml v0.3.0.
// Authentication and role guards enforce the authorization matrix in
// docs/UML_Diagrams.md §4.1. Operations whose business logic is not written
// yet answer 501 after passing their guards.

const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ApiError = require('../errors/ApiError');
const { createAuthService } = require('../services/authService');
const { createUserService } = require('../services/userService');
const { createAssignmentService } = require('../services/assignmentService');

const notImplemented = (operationId) => (_req, _res, next) => next(ApiError.notImplemented(operationId));

// Bearer JWT check followed by a role check. Applied per route, so unknown
// paths still fall through to the 404 handler instead of answering 401.
const guard = (...roles) => [authenticate, requireRole(...roles)];

function createApiRouter({ userRepo, assignmentRepo }) {
  const router = Router();
  const authService = createAuthService({ userRepo });
  const userService = createUserService({ userRepo });
  const assignmentService = createAssignmentService({ userRepo, assignmentRepo });

  // Public
  router.post('/auth/login', async (req, res) => {
    res.json(await authService.login(req.body));
  });

  // US-01: Admin user management
  router.get('/users', guard('ADMIN'), async (req, res) => {
    res.json(await userService.list(req.query));
  });
  router.post('/users', guard('ADMIN'), async (req, res) => {
    res.status(201).json(await userService.create(req.body));
  });

  // US-02: Admin student-instructor pairing
  // Re-assigning a student replaces the previous instructor and also answers
  // 201, since the contract defines no 200 here (UML_Diagrams.md §6, point 3).
  router.post('/assignments', guard('ADMIN'), async (req, res) => {
    res.status(201).json(await assignmentService.assign(req.body, req.user.id));
  });

  // US-03 / US-04: Availability
  router.get('/availability', guard('INSTRUCTOR', 'STUDENT'), notImplemented('listAvailability'));
  router.post('/availability', guard('INSTRUCTOR'), notImplemented('addAvailability'));
  router.delete('/availability/:id', guard('INSTRUCTOR'), notImplemented('deleteAvailability'));

  // US-05: Appointment booking
  router.post('/appointments', guard('STUDENT'), notImplemented('createAppointment'));

  return router;
}

module.exports = { createApiRouter };
