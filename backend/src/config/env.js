'use strict';

// Central place for runtime configuration. Values come from environment
// variables (see .env.example); nothing secret is hard-coded for production.

const DEV_JWT_SECRET = 'dev-only-insecure-secret-change-me';

function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const jwtSecret = env.JWT_SECRET || (nodeEnv === 'production' ? '' : DEV_JWT_SECRET);

  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be set when NODE_ENV=production');
  }

  return Object.freeze({
    nodeEnv,
    port: Number(env.PORT) || 3000,
    jwt: Object.freeze({
      secret: jwtSecret,
      expiresIn: env.JWT_EXPIRES_IN || '1h',
    }),
    firebase: Object.freeze({
      // A "demo-" project id lets the Firebase Local Emulator run without a real GCP project.
      projectId: env.FIREBASE_PROJECT_ID || 'demo-scheduling',
      emulatorHost: env.FIRESTORE_EMULATOR_HOST || '',
    }),
  });
}

module.exports = { loadConfig, config: loadConfig() };
