'use strict';

// Bearer JWT authentication and role-based authorization (Architecture.md ADR-04).
// The caller's identity is taken only from verified token claims:
//   sub  -> req.user.id
//   role -> req.user.role (ADMIN | INSTRUCTOR | STUDENT)

const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const ApiError = require('../errors/ApiError');

const ROLES = Object.freeze(['ADMIN', 'INSTRUCTOR', 'STUDENT']);

function signToken(user, options = {}) {
  return jwt.sign({ role: user.role }, config.jwt.secret, {
    subject: String(user.id),
    expiresIn: config.jwt.expiresIn,
    algorithm: 'HS256',
    ...options,
  });
}

function authenticate(req, _res, next) {
  const header = req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized());
  }

  let claims;
  try {
    claims = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
  } catch {
    return next(ApiError.unauthorized());
  }

  if (!claims.sub || !ROLES.includes(claims.role)) {
    return next(ApiError.unauthorized());
  }

  req.user = { id: claims.sub, role: claims.role };
  return next();
}

function requireRole(...allowed) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowed.includes(req.user.role)) return next(ApiError.forbidden());
    return next();
  };
}

module.exports = { ROLES, signToken, authenticate, requireRole };
