'use strict';

// Error type that maps 1:1 to an RFC 7807 problem response
// ({ title, status, code, detail }, see components.schemas.Problem in openapi.yaml).

const TITLES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  503: 'Service Unavailable',
};

class ApiError extends Error {
  constructor(status, code, detail) {
    super(detail || code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.title = TITLES[status] || 'Error';
    this.detail = detail;
  }

  toProblem() {
    const problem = { title: this.title, status: this.status, code: this.code };
    if (this.detail) problem.detail = this.detail;
    return problem;
  }

  static badRequest(detail, code = 'VALIDATION_ERROR') {
    return new ApiError(400, code, detail);
  }

  static unauthorized(detail = 'Authentication credentials are missing or invalid.') {
    return new ApiError(401, 'UNAUTHORIZED', detail);
  }

  static forbidden(detail = 'You do not have permission to access this resource.', code = 'FORBIDDEN') {
    return new ApiError(403, code, detail);
  }

  static notFound(detail = 'The requested resource does not exist in the system.', code = 'RESOURCE_NOT_FOUND') {
    return new ApiError(404, code, detail);
  }

  static conflict(code, detail) {
    return new ApiError(409, code, detail);
  }

  static notImplemented(operation) {
    return new ApiError(501, 'NOT_IMPLEMENTED', `${operation} is part of the contract but not implemented yet.`);
  }
}

module.exports = ApiError;
