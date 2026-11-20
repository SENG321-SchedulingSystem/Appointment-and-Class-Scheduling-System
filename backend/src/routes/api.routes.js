'use strict';

// Route skeleton for every operation in openapi.yaml v0.3.0.
// Authentication and role guards are already active, so the authorization
// matrix in docs/UML_Diagrams.md §4.1 is enforced today. The business logic
// behind each route is added in Sprint 3 and answers 501 until then.

const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const ApiError = require('../errors/ApiError');

const router = Router();

const notImplemented = (operationId) => (_req, _res, next) => next(ApiError.notImplemented(operationId));

// Bearer JWT check followed by a role check. Applied per route, so unknown
// paths still fall through to the 404 handler instead of answering 401.
const guard = (...roles) => [authenticate, requireRole(...roles)];

// Public
router.post('/auth/login', notImplemented('loginUser'));

// US-01: Admin user management
router.get('/users', guard('ADMIN'), notImplemented('listUsers'));
router.post('/users', guard('ADMIN'), notImplemented('createUser'));

// US-02: Admin student-instructor pairing
router.post('/assignments', guard('ADMIN'), notImplemented('assignStudent'));

// US-03 / US-04: Availability
router.get('/availability', guard('INSTRUCTOR', 'STUDENT'), notImplemented('listAvailability'));
router.post('/availability', guard('INSTRUCTOR'), notImplemented('addAvailability'));
router.delete('/availability/:id', guard('INSTRUCTOR'), notImplemented('deleteAvailability'));

// US-05: Appointment booking
router.post('/appointments', guard('STUDENT'), notImplemented('createAppointment'));

module.exports = router;
