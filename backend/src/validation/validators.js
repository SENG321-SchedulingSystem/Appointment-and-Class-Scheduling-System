'use strict';

// Small request validators for the openapi.yaml v0.3.0 schemas.
// Each returns a list of problems; an empty list means the input is valid.

const { ROLES } = require('../middleware/auth');

// Pragmatic email check: one "@", no spaces, a dot in the domain part.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8; // SRS FR-03

// Firestore document ids: the generated ones are 20 alphanumerics; the contract
// examples look like "stu_456". Anything with "/" would address a sub-path.
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

// ISO-8601 date-time: e.g. 2026-11-01T10:00:00Z, 2026-11-01T10:00:00.000Z, or +03:00.
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function isValidIsoDateTime(v) {
  if (typeof v !== 'string') return false;
  if (!ISO_DATETIME_RE.test(v)) return false;
  const ms = Date.parse(v);
  return !Number.isNaN(ms);
}

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

function validateAssignment(body) {
  if (!isObject(body)) return ['Request body must be a JSON object.'];
  const errors = [];
  for (const field of ['studentId', 'instructorId']) {
    if (!isNonEmptyString(body[field])) errors.push(`${field} is required.`);
    else if (!ID_RE.test(body[field])) errors.push(`${field} is not a valid id.`);
  }
  return errors;
}

function validateNewAvailability(body) {
  if (!isObject(body)) return ['Request body must be a JSON object.'];
  const errors = [];
  if (!isNonEmptyString(body.startTime)) errors.push('startTime is required.');
  else if (!isValidIsoDateTime(body.startTime)) errors.push('startTime must be a valid ISO-8601 date-time string.');

  if (!isNonEmptyString(body.endTime)) errors.push('endTime is required.');
  else if (!isValidIsoDateTime(body.endTime)) errors.push('endTime must be a valid ISO-8601 date-time string.');

  return errors;
}

function validateAvailabilityQuery(query = {}) {
  if (!isObject(query)) return ['Query parameters must be an object.'];
  const errors = [];
  if (query.instructorId !== undefined) {
    if (!isNonEmptyString(query.instructorId) || !ID_RE.test(query.instructorId)) {
      errors.push('instructorId is not a valid id.');
    }
  }
  if (query.from !== undefined) {
    if (!isNonEmptyString(query.from) || !isValidIsoDateTime(query.from)) {
      errors.push('from must be a valid ISO-8601 date-time string.');
    }
  }
  if (query.to !== undefined) {
    if (!isNonEmptyString(query.to) || !isValidIsoDateTime(query.to)) {
      errors.push('to must be a valid ISO-8601 date-time string.');
    }
  }
  return errors;
}

function validateSlotId(id) {
  if (!isNonEmptyString(id) || !ID_RE.test(id)) {
    return ['id is not a valid id.'];
  }
  return [];
}

function validateNewAppointment(body) {
  if (!isObject(body)) return ['Request body must be a JSON object.'];
  const errors = [];
  if (!isNonEmptyString(body.availabilityId)) {
    errors.push('availabilityId is required.');
  } else if (!ID_RE.test(body.availabilityId)) {
    errors.push('availabilityId is not a valid id.');
  }
  return errors;
}

module.exports = {
  PASSWORD_MIN_LENGTH,
  normalizeEmail,
  isValidIsoDateTime,
  validateLogin,
  validateNewUser,
  validateRoleFilter,
  validateAssignment,
  validateNewAvailability,
  validateAvailabilityQuery,
  validateSlotId,
  validateNewAppointment,
};
