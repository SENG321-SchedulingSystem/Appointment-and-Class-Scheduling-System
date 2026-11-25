'use strict';

// AuthService (FR-00): verifies credentials and issues a signed JWT.

const ApiError = require('../errors/ApiError');
const { signToken } = require('../middleware/auth');
const { hashPassword, verifyPassword } = require('./password');
const { normalizeEmail, validateLogin } = require('../validation/validators');

// Compared against when the email is unknown, so a missing user and a wrong
// password take about the same time and cannot be told apart.
const DUMMY_HASH_PROMISE = hashPassword('dummy-password-for-timing');

function createAuthService({ userRepo }) {
  return {
    async login(body) {
      const errors = validateLogin(body);
      if (errors.length) throw ApiError.badRequest(errors.join(' '));

      const user = await userRepo.findByEmail(normalizeEmail(body.email));
      const hash = user ? user.passwordHash : await DUMMY_HASH_PROMISE;
      const valid = await verifyPassword(body.password, hash);

      if (!user || !valid) {
        throw ApiError.unauthorized('Invalid email or password.');
      }

      return { token: signToken(user), userId: user.id, name: user.name, role: user.role };
    },
  };
}

module.exports = { createAuthService };
