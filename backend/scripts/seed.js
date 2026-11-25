'use strict';

// Seeds the initial users. POST /users is ADMIN-only, so an empty database
// needs at least one admin before anyone can log in.
//
//   npm run seed                      # against FIRESTORE_EMULATOR_HOST / cloud
//
// Development (default): creates an admin plus one demo instructor and student.
// Production: creates only the admin, from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
// Running it again is safe: users whose email already exists are skipped.

const { createUserService } = require('../src/services/userService');

const DEV_USERS = [
  { name: 'System Admin', email: 'admin@example.com', password: 'Admin12345', role: 'ADMIN' },
  { name: 'Demo Instructor', email: 'instructor@example.com', password: 'Instructor123', role: 'INSTRUCTOR' },
  { name: 'Demo Student', email: 'student@example.com', password: 'Student123', role: 'STUDENT' },
];

function seedUsersFromEnv(env = process.env) {
  const isProd = (env.NODE_ENV || 'development') === 'production';
  const adminEmail = env.SEED_ADMIN_EMAIL;
  const adminPassword = env.SEED_ADMIN_PASSWORD;

  if (isProd && (!adminEmail || !adminPassword)) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set when NODE_ENV=production');
  }

  const users = isProd ? [] : DEV_USERS.slice(1);
  const admin = { ...DEV_USERS[0] };
  if (adminEmail) admin.email = adminEmail;
  if (adminPassword) admin.password = adminPassword;
  return [admin, ...users];
}

async function seed({ userRepo, users, log = console.log }) {
  const userService = createUserService({ userRepo });
  const result = { created: [], skipped: [] };

  for (const user of users) {
    try {
      const created = await userService.create(user);
      result.created.push(created.email);
      log(`created ${created.role.padEnd(10)} ${created.email}`);
    } catch (err) {
      if (err.code !== 'EMAIL_ALREADY_EXISTS') throw err;
      result.skipped.push(user.email);
      log(`exists  ${user.role.padEnd(10)} ${user.email}`);
    }
  }
  return result;
}

if (require.main === module) {
  const { createUserRepository } = require('../src/repositories/userRepository');
  seed({ userRepo: createUserRepository(), users: seedUsersFromEnv() })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`Seeding failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { DEV_USERS, seedUsersFromEnv, seed };
