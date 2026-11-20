'use strict';

// Operational endpoints for Docker / Cloud Run health checks.
// They are intentionally not part of openapi.yaml.

const { Router } = require('express');
const { firestoreMode, pingFirestore } = require('../config/firebase');
const { config } = require('../config/env');

const router = Router();

// Liveness: the process is up. Does not touch the database.
router.get('/', (_req, res) => {
  res.json({ status: 'ok', firestore: { mode: firestoreMode(), projectId: config.firebase.projectId } });
});

// Readiness: Firestore (emulator or cloud) answers.
router.get('/ready', async (_req, res) => {
  try {
    await pingFirestore();
    res.json({ status: 'ready', firestore: 'reachable' });
  } catch (err) {
    res.status(503).type('application/problem+json').json({
      title: 'Service Unavailable',
      status: 503,
      code: 'DATABASE_UNAVAILABLE',
      detail: err.message,
    });
  }
});

module.exports = router;
