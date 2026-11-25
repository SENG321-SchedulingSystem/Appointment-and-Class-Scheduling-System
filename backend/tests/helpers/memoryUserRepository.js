'use strict';

// In-memory stand-in for src/repositories/userRepository.js, used by tests
// so they run without the Firestore emulator.

const ApiError = require('../../src/errors/ApiError');

function createMemoryUserRepository() {
  const users = new Map();
  let seq = 0;

  return {
    users,
    async findByEmail(email) {
      return [...users.values()].find((u) => u.email === email) || null;
    },
    async findById(id) {
      return users.get(id) || null;
    },
    async list({ role } = {}) {
      return [...users.values()].filter((u) => !role || u.role === role);
    },
    async create({ name, email, passwordHash, role }) {
      if ([...users.values()].some((u) => u.email === email)) {
        throw ApiError.conflict('EMAIL_ALREADY_EXISTS', 'This email address is already registered.');
      }
      seq += 1;
      const user = { id: `usr_${seq}`, name, email, passwordHash, role };
      users.set(user.id, user);
      return { ...user };
    },
  };
}

module.exports = { createMemoryUserRepository };
