'use strict';

const express = require('express');
const healthRoutes = require('./routes/health.routes');
const { createApiRouter } = require('./routes/api.routes');
const { createUserRepository } = require('./repositories/userRepository');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Repositories can be injected so tests run without Firestore.
// By default they talk to Firestore (emulator or cloud), connecting lazily.
function createApp({ userRepo = createUserRepository() } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.use('/health', healthRoutes);
  app.use('/', createApiRouter({ userRepo }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
