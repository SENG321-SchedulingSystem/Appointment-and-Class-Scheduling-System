'use strict';

// UserService (FR-03, FR-09): admin user provisioning and listing.
// Password hashes never leave this layer (NFR-S4).

const ApiError = require('../errors/ApiError');
const { hashPassword } = require('./password');
const { normalizeEmail, validateNewUser, validateRoleFilter } = require('../validation/validators');

const toPublicUser = ({ id, name, email, role }) => ({ id, name, email, role });

function createUserService({ userRepo }) {
  return {
    async create(body) {
      const errors = validateNewUser(body);
      if (errors.length) throw ApiError.badRequest(errors.join(' '));

      const user = await userRepo.create({
        name: body.name.trim(),
        email: normalizeEmail(body.email),
        passwordHash: await hashPassword(body.password),
        role: body.role,
      });
      return toPublicUser(user);
    },

    async list(query = {}) {
      const errors = validateRoleFilter(query.role);
      if (errors.length) throw ApiError.badRequest(errors.join(' '));

      const users = await userRepo.list({ role: query.role });
      return users.map(toPublicUser).sort((a, b) => a.name.localeCompare(b.name));
    },
  };
}

module.exports = { createUserService, toPublicUser };
