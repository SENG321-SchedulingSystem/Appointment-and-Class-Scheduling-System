# Backend API (Node.js / Express)

REST API skeleton for the Appointment and Class Scheduling System. It implements the routing, security and error-handling layers from [`docs/Architecture.md`](../docs/Architecture.md) §2.3 and is connected to Cloud Firestore through the Firebase Admin SDK.

**Contract:** [`openapi.yaml`](../openapi.yaml) v0.3.0
**Design:** [`docs/UML_Diagrams.md`](../docs/UML_Diagrams.md)

## Status (Sprint 3)

| Layer | State |
| :--- | :--- |
| Express app, JSON parsing, graceful shutdown | Done |
| Firebase Admin SDK connection (Local Emulator or Cloud Firestore) | Done, checked by `GET /health/ready` |
| Bearer JWT authentication (`401`) and role guards (`403`) on every contract route | Done |
| RFC 7807 `application/problem+json` error handler | Done |
| `POST /auth/login`, `GET /users`, `POST /users` (US-01, #19) | Done. bcrypt password hashes, unique emails, `npm run seed` for the first admin |
| `POST /assignments` (US-02, #20) | Done. One instructor per student (`assignments/{studentId}`), `404` for unknown users, `400 ROLE_MISMATCH` |
| Availability, appointments | In progress. These routes answer `501 NOT_IMPLEMENTED` after passing their guards. |

## Requirements

- Node.js 22.9 or newer
- Java 21 or newer, only for the Firebase Local Emulator

## Run locally

```bash
cd backend
npm install
cp .env.example .env      # adjust if needed

# Terminal 1: Firestore emulator on localhost:8080 (UI on localhost:4000)
npm run emulator

# Terminal 2: API on localhost:3000, restarts on file changes
npm run dev
```

Create the first users (safe to run again):

```bash
npm run seed   # admin@example.com / Admin12345, instructor@example.com / Instructor123, student@example.com / Student123
```

The demo passwords are for local development only. With `NODE_ENV=production` the script creates just the admin from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

Check that everything is connected:

```bash
curl http://localhost:3000/health         # {"status":"ok","firestore":{"mode":"emulator",...}}
curl http://localhost:3000/health/ready   # {"status":"ready","firestore":"reachable"}
```

The Prism mock server from [`docs/API_Integration_Strategy.md`](../docs/API_Integration_Strategy.md) also uses port 3000. Run it on another port (`--port 4010`) or set `PORT` in `.env` when both are needed.

## Tests

```bash
npm test
```

The tests do not need Firebase: they inject an in-memory user repository (`tests/helpers/memoryUserRepository.js`). They cover the health endpoint, the RFC 7807 error format, the `401` cases (missing, forged, expired token, unknown role), the full role matrix from `docs/UML_Diagrams.md` §4.1, the US-01 and US-02 acceptance criteria and the seed script.

## Configuration

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | `production` requires `JWT_SECRET` |
| `JWT_SECRET` | dev-only value | HS256 signing secret. Never commit a real secret. |
| `JWT_EXPIRES_IN` | `1h` | Token lifetime |
| `FIREBASE_PROJECT_ID` | `demo-scheduling` | A `demo-` id runs offline against the emulator |
| `FIRESTORE_EMULATOR_HOST` | empty | For example `localhost:8080`. When empty, Cloud Firestore is used with Application Default Credentials. |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | dev demo admin | Admin created by `npm run seed`. Required when `NODE_ENV=production`. |

## Docker

```bash
docker build -t scheduling-backend ./backend
docker run -p 3000:3000 \
  -e JWT_SECRET=change-me \
  -e FIRESTORE_EMULATOR_HOST=host.docker.internal:8080 \
  scheduling-backend
```

The image uses `node:22-alpine`, runs as the non-root `node` user and has a `HEALTHCHECK` on `/health`.

## Folder structure

```text
backend/
├── src/
│   ├── app.js                  # Express app factory (used by server and tests)
│   ├── server.js               # Starts the HTTP server
│   ├── config/
│   │   ├── env.js              # Environment configuration
│   │   ├── firebase.js         # Firebase Admin SDK, getDb(), readiness probe
│   │   └── collections.js      # Firestore collection names
│   ├── errors/ApiError.js      # RFC 7807 problem errors
│   ├── validation/validators.js # Request checks for the openapi.yaml schemas
│   ├── services/
│   │   ├── authService.js      # POST /auth/login: verify password, sign JWT
│   │   ├── userService.js      # POST/GET /users, hides password hashes
│   │   ├── assignmentService.js # POST /assignments: existence and role checks
│   │   └── password.js         # bcrypt hash / verify
│   ├── repositories/
│   │   ├── userRepository.js   # Firestore users + userEmails uniqueness index
│   │   └── assignmentRepository.js # assignments/{studentId}
│   ├── middleware/
│   │   ├── auth.js             # authenticate (JWT) and requireRole (RBAC)
│   │   └── errorHandler.js     # 404 and global problem+json handler
│   └── routes/
│       ├── health.routes.js    # /health, /health/ready (not part of the contract)
│       └── api.routes.js       # All openapi.yaml operations with guards
├── scripts/seed.js             # npm run seed
└── tests/                      # Jest + Supertest
```

The remaining services (AvailabilityService, AppointmentEngine) and repositories (AvailRepo, ApptRepo) follow the same pattern, as in the sequence diagrams.
