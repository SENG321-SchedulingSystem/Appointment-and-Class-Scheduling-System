'use strict';

// Central place for runtime configuration. Values come from environment
// variables (see .env.example); nothing secret is hard-coded for production.

const DEV_JWT_SECRET = 'dev-only-insecure-secret-change-me';
// Vite dev server (frontend/vite.config.js). Production has no default:
// the deployed frontend URL must be listed in CORS_ORIGINS.
const DEV_CORS_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173';

function parseOrigins(value) {
  return value
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const jwtSecret = env.JWT_SECRET || (nodeEnv === 'production' ? '' : DEV_JWT_SECRET);

  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be set when NODE_ENV=production');
  }

  const corsOrigins = env.CORS_ORIGINS ?? (nodeEnv === 'production' ? '' : DEV_CORS_ORIGINS);

  return Object.freeze({
    nodeEnv,
    corsOrigins: Object.freeze(parseOrigins(corsOrigins)),
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
