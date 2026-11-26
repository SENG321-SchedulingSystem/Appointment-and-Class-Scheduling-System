'use strict';

const express = require('express');
const healthRoutes = require('./routes/health.routes');
const { createApiRouter } = require('./routes/api.routes');
const { createUserRepository } = require('./repositories/userRepository');
const { createAssignmentRepository } = require('./repositories/assignmentRepository');
const { createAvailabilityRepository } = require('./repositories/availabilityRepository');
const { createAppointmentRepository } = require('./repositories/appointmentRepository');
const { cors } = require('./middleware/cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Repositories can be injected so tests run without Firestore.
// By default they talk to Firestore (emulator or cloud), connecting lazily.
function createApp({
  userRepo = createUserRepository(),
  assignmentRepo = createAssignmentRepository(),
  availabilityRepo = createAvailabilityRepository(),
  appointmentRepo = createAppointmentRepository(),
  corsOrigins,
} = {}) {
  const app = express();

  app.disable('x-powered-by');
  // Before the routes, so preflight requests and error responses get CORS headers too.
  app.use(cors(corsOrigins));
  app.use(express.json({ limit: '100kb' }));

  app.use('/health', healthRoutes);
  app.use('/', createApiRouter({ userRepo, assignmentRepo, availabilityRepo, appointmentRepo }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
