'use strict';

// CORS for the browser frontend (Vite dev server, Vercel deployment).
// Only origins listed in config.corsOrigins get CORS headers; everyone else
// is left to the browser's same-origin policy. Auth uses the Authorization
// header, not cookies, so credentials are not enabled.

const { config } = require('../config/env');

const ALLOWED_METHODS = 'GET,POST,DELETE,OPTIONS';
const ALLOWED_HEADERS = 'Authorization,Content-Type';
const MAX_AGE_SECONDS = '600';

function cors(allowedOrigins = config.corsOrigins) {
  const allowAll = allowedOrigins.includes('*');
  const allowed = new Set(allowedOrigins);

  return (req, res, next) => {
    const origin = req.get('Origin');
    res.vary('Origin');

    if (!origin || !(allowAll || allowed.has(origin))) {
      return next();
    }

    res.set('Access-Control-Allow-Origin', allowAll ? '*' : origin);

    if (req.method === 'OPTIONS' && req.get('Access-Control-Request-Method')) {
      res.set({
        'Access-Control-Allow-Methods': ALLOWED_METHODS,
        'Access-Control-Allow-Headers': ALLOWED_HEADERS,
        'Access-Control-Max-Age': MAX_AGE_SECONDS,
      });
      return res.status(204).end();
    }

    return next();
  };
}

module.exports = { cors };
