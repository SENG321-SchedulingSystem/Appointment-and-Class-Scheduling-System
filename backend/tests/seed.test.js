'use strict';

const { seed, seedUsersFromEnv } = require('../scripts/seed');
const { createMemoryUserRepository } = require('./helpers/memoryUserRepository');

describe('seed script', () => {
  test('development: admin plus demo instructor and student', () => {
    const roles = seedUsersFromEnv({}).map((u) => u.role);
    expect(roles).toEqual(['ADMIN', 'INSTRUCTOR', 'STUDENT']);
  });

  test('production: refuses without admin credentials', () => {
    expect(() => seedUsersFromEnv({ NODE_ENV: 'production' })).toThrow(/SEED_ADMIN_EMAIL/);
  });

  test('production: only the admin from the environment', () => {
    const users = seedUsersFromEnv({
      NODE_ENV: 'production',
      SEED_ADMIN_EMAIL: 'root@example.com',
      SEED_ADMIN_PASSWORD: 'VeryLongPass1',
    });
    expect(users).toEqual([expect.objectContaining({ email: 'root@example.com', role: 'ADMIN' })]);
  });

  test('is idempotent: a second run skips existing users', async () => {
    const userRepo = createMemoryUserRepository();
    const users = seedUsersFromEnv({});
    const log = () => {};

    const first = await seed({ userRepo, users, log });
    const second = await seed({ userRepo, users, log });

    expect(first.created).toHaveLength(3);
    expect(second).toEqual({ created: [], skipped: users.map((u) => u.email) });
  });

  test('rethrows errors other than duplicates', async () => {
    const userRepo = createMemoryUserRepository();
    await expect(seed({ userRepo, users: [{ email: 'bad' }], log: () => {} })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });
});
