'use strict';

// Firebase Admin SDK bootstrap (Architecture.md ADR-02).
//
// - Local / Docker demo: set FIRESTORE_EMULATOR_HOST (e.g. "localhost:8080").
//   The SDK then talks to the Firebase Local Emulator and needs no credentials.
// - Cloud: leave FIRESTORE_EMULATOR_HOST empty and provide Application Default
//   Credentials (GOOGLE_APPLICATION_CREDENTIALS or the Cloud Run service account).
//
// The app is initialised lazily so that tests and routes that never touch the
// database do not require a Firebase connection.

const { initializeApp, getApps, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { config } = require('./env');

let db;

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const options = { projectId: config.firebase.projectId };
  if (config.firebase.emulatorHost) {
    // Offline demo: skip google-auth-library's GCE metadata-server probe,
    // which otherwise stalls the first Firestore call for several seconds.
    process.env.METADATA_SERVER_DETECTION ??= 'none';
  } else {
    options.credential = applicationDefault();
  }
  return initializeApp(options);
}

function getDb() {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

function firestoreMode() {
  return config.firebase.emulatorHost ? 'emulator' : 'cloud';
}

// Lightweight connectivity probe used by GET /health/ready.
async function pingFirestore(timeoutMs = 2000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Firestore did not answer within ${timeoutMs} ms`)), timeoutMs);
  });
  // A cheap single-document query. Its promise is observed even after a
  // timeout, so a late rejection can never crash the process.
  const probe = getDb().collection('_health').limit(1).get();
  probe.catch(() => {});
  try {
    await Promise.race([probe, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { getDb, firestoreMode, pingFirestore };
