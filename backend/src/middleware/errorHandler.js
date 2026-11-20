'use strict';

// Global RFC 7807 error handling. Every error leaves the API as
// application/problem+json (NFR-R1); unexpected errors never leak internals.

const ApiError = require('../errors/ApiError');

function notFound(req, _res, next) {
  next(ApiError.notFound(`No route matches ${req.method} ${req.path}.`, 'ROUTE_NOT_FOUND'));
}

// Express recognises error handlers by their four parameters.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let apiError = err;

  if (!(err instanceof ApiError)) {
    if (err.type === 'entity.parse.failed') {
      apiError = ApiError.badRequest('Request body is not valid JSON.');
    } else {
      if (process.env.NODE_ENV !== 'test') {
        console.error(err);
      }
      apiError = new ApiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
    }
  }

  res.status(apiError.status).type('application/problem+json').json(apiError.toProblem());
}

module.exports = { notFound, errorHandler };
