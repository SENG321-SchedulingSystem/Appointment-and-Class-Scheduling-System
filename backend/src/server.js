'use strict';

const { createApp } = require('./app');
const { config } = require('./config/env');
const { firestoreMode } = require('./config/firebase');

const app = createApp();

const server = app.listen(config.port, (err) => {
  // Express 5 passes listen errors (e.g. EADDRINUSE) to this callback.
  if (err) {
    console.error(`Could not start server on port ${config.port}: ${err.message}`);
    process.exit(1);
  }
  console.log(`Scheduling API listening on port ${config.port} (${config.nodeEnv}, Firestore: ${firestoreMode()})`);
});

function shutdown(signal) {
  console.log(`${signal} received, closing server`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
