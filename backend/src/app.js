'use strict';

const express = require('express');
const healthRoutes = require('./routes/health.routes');
const apiRoutes = require('./routes/api.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.use('/health', healthRoutes);
  app.use('/', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
