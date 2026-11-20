'use strict';

const { loadConfig } = require('../src/config/env');

describe('loadConfig', () => {
  test('uses safe defaults for local development', () => {
    const cfg = loadConfig({});
    expect(cfg.port).toBe(3000);
    expect(cfg.firebase.projectId).toBe('demo-scheduling');
    expect(cfg.firebase.emulatorHost).toBe('');
    expect(cfg.jwt.secret).toBeTruthy();
  });

  test('refuses to start in production without JWT_SECRET', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/JWT_SECRET/);
  });

  test('reads emulator and port settings from the environment', () => {
    const cfg = loadConfig({ PORT: '8080', FIRESTORE_EMULATOR_HOST: 'firebase:8080', JWT_SECRET: 's' });
    expect(cfg.port).toBe(8080);
    expect(cfg.firebase.emulatorHost).toBe('firebase:8080');
  });
});
