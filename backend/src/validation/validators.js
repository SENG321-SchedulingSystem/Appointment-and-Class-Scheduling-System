'use strict';

// Small request validators for the openapi.yaml v0.3.0 schemas.
// Each returns a list of problems; an empty list means the input is valid.

const { ROLES } = require('../middleware/auth');

// Pragmatic email check: one "@", no spaces, a dot in the domain part.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8; // SRS FR-03

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function validateLogin(body) {
  if (!isObject(body)) return ['Request body must be a JSON object.'];
  const errors = [];
  if (!isNonEmptyString(body.email)) errors.push('email is required.');
  else if (!EMAIL_RE.test(body.email.trim())) errors.push('email must be a valid email address.');
  if (!isNonEmptyString(body.password)) errors.push('password is required.');
  return errors;
}

function validateNewUser(body) {
  if (!isObject(body)) return ['Request body must be a JSON object.'];
  const errors = [];
  if (!isNonEmptyString(body.name)) errors.push('name is required.');
  if (!isNonEmptyString(body.email)) errors.push('email is required.');
  else if (!EMAIL_RE.test(body.email.trim())) errors.push('email must be a valid email address.');
  if (typeof body.password !== 'string' || body.password.length === 0) errors.push('password is required.');
  else if (body.password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }
  if (!ROLES.includes(body.role)) errors.push(`role must be one of ${ROLES.join(', ')}.`);
  return errors;
}

function validateRoleFilter(role) {
  if (role === undefined) return [];
  return ROLES.includes(role) ? [] : [`role must be one of ${ROLES.join(', ')}.`];
}

module.exports = { PASSWORD_MIN_LENGTH, normalizeEmail, validateLogin, validateNewUser, validateRoleFilter };
