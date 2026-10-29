# API Integration Strategy - SENG 321 Appointment Scheduling System

This document describes how the frontend and backend of the Scheduling System are connected through the OpenAPI contract. It is owned by the Implementation & Integration Engineer (Furkan Çelebi) and approved by the Lead Software Architect (Eren Okat), as defined in the [RACI Matrix](RACI_Matrix.md).

### 1. API-First Principle
* The single source of truth for every client-server interaction is [`openapi.yaml`](../openapi.yaml).
* The frontend never talks to the database (Firebase) directly. All reads and writes go through the operations defined in the contract.
* Backend work targets the agreed operations and schemas. Frontend work starts against a mock server generated from the same file, so both sides can progress in parallel.

### 2. Environments

| Environment | Base URL | Purpose |
| :--- | :--- | :--- |
| **mock** | `http://localhost:3000` | Prism mock generated from `openapi.yaml` (matches the `servers` entry). Used for frontend development and contract tests before the backend exists. |
| **dev** | To be defined in Sprint 2 | Real backend connected to the Firebase development project. |
| **prod** | Deferred | Not part of the first release. |

The frontend reads the base URL from a single configuration value, so switching from `mock` to `dev` does not require code changes.

### 3. Data Format and Errors
* Request and response bodies use `application/json`.
* Errors use the shared `Problem` schema with `application/problem+json`, containing `title`, `status`, `code`, and `detail`.
* The frontend decides what to show the user based on the HTTP status and the `code` field, never on the `detail` text.

| Status | Meaning | Frontend behavior |
| :--- | :--- | :--- |
| `400` | Invalid input (e.g., past date, missing field) | Show a field-level validation message. |
| `401` | Missing or invalid token | Redirect to login. |
| `403` | Role is not allowed (e.g., student calling an admin operation) | Show "not authorized" and hide the action. |
| `404` | Referenced resource does not exist (e.g., `RESOURCE_NOT_FOUND`, `SLOT_NOT_FOUND`) | Show "not found" and refresh the related list. |
| `409` | Conflict (e.g., `SLOT_UNAVAILABLE`) | Show "this slot has just been taken" and refresh availability. |

### 4. Authentication Flow
1. The client calls `POST /auth/login` with email and password.
2. The response returns a `token` and the user's `role` (`ADMIN`, `INSTRUCTOR`, `STUDENT`).
3. The client sends the token on every later request in the `Authorization: Bearer <token>` header (`bearerAuth` in the contract). Only `POST /auth/login` is public.
4. The client uses `role` only to decide which screens to show. The backend always enforces permissions itself.
5. The client never sends its own user ID for actions on its own behalf. For example, `POST /appointments` only contains `availabilityId`; the backend reads the student ID from the token.

### 5. Running the Mock Server
Requires Node.js. No installation inside the repository is needed.

```bash
# Validate the contract
npx @redocly/cli@1 lint openapi.yaml --extends=minimal

# Start the mock server on the port defined in `servers`
npx @stoplight/prism-cli@5 mock openapi.yaml -p 3000

# Book a slot (success). Any bearer token is accepted by the mock.
curl -X POST http://localhost:3000/appointments \
  -H "Authorization: Bearer test" -H "Content-Type: application/json" \
  -d '{"availabilityId":"avail_789"}'

# Force the double-booking case
curl -X POST http://localhost:3000/appointments \
  -H "Authorization: Bearer test" -H "Prefer: code=409" -H "Content-Type: application/json" \
  -d '{"availabilityId":"avail_789"}'
```

The `Prefer: code=<status>` header asks Prism to return a specific documented response, which lets the frontend and QA exercise error paths without a backend. Requests without the `Authorization` header are rejected with `401`, the same as the real backend.

### 6. Sprint 1 Verification Evidence
Run on 29 October 2026 against `openapi.yaml` **v0.2.1** on `develop` (after PR #31 and PR #36), using `@redocly/cli@1` and `@stoplight/prism-cli@5`. Every operation and every documented status code was exercised. `400` rows without `Prefer` were triggered by sending an invalid request body, so they also confirm that Prism validates requests against the schemas.

| Check | Story | Request | Result |
| :--- | :--- | :--- | :--- |
| Contract structure | - | `redocly lint` | Valid (0 errors, 1 warning: localhost mock server, expected) |
| Login | - | `POST /auth/login` | `200` with `token` and `role` |
| Login with missing password | - | `POST /auth/login` without `password` | `400` |
| Login with wrong credentials | - | `POST /auth/login` with `Prefer: code=401` | `401` with `code: UNAUTHORIZED` |
| Create a user | US-01 | `POST /users` | `201` |
| Create user with invalid fields | US-01 | `POST /users` without `email`/`role`, or with `role: GUEST` | `400` |
| Create user without token | US-01 | `POST /users` without token | `401` with `code: UNAUTHORIZED` |
| Non-admin creates a user | US-01 | `POST /users` with `Prefer: code=403` | `403` with `code: FORBIDDEN` |
| Duplicate email | US-01 | `POST /users` with `Prefer: code=409` | `409` with `code: EMAIL_ALREADY_EXISTS` |
| Assign a student to an instructor | US-02 | `POST /assignments` | `201` |
| Assign with missing `instructorId` | US-02 | `POST /assignments` | `400` |
| Assign student without token | US-02 | `POST /assignments` without token | `401` with `code: UNAUTHORIZED` |
| Non-admin assigns a student | US-02 | `POST /assignments` with `Prefer: code=403` | `403` with `code: FORBIDDEN` |
| Assign nonexistent user | US-02 | `POST /assignments` with `Prefer: code=404` | `404` with `code: RESOURCE_NOT_FOUND` |
| Add a future time slot | US-03 | `POST /availability` | `201` |
| Add a slot with missing or non-date-time fields | US-03 | `POST /availability` without `endTime`, or with `startTime: "yesterday"` | `400` |
| Add a slot in the past | US-03 | `POST /availability` with `Prefer: code=400` | `400` (the past-date rule itself is enforced by the backend in Sprint 2) |
| Add a slot without token | US-03 | `POST /availability` without token | `401` with `code: UNAUTHORIZED` |
| Non-instructor adds a slot | US-03 | `POST /availability` with `Prefer: code=403` | `403` with `code: FORBIDDEN` |
| List free slots in a date range | US-04 | `GET /availability?instructorId=inst_123&from=...&to=...` | `200` with an `Availability` array |
| List availability without `instructorId` | US-04 | `GET /availability` | `400` |
| List availability without token | US-04 | `GET /availability` without token | `401` with `code: UNAUTHORIZED` |
| List availability unassigned instructor | US-04 | `GET /availability` with `Prefer: code=403` | `403` with `code: INSTRUCTOR_NOT_ASSIGNED` |
| List availability nonexistent instructor | US-04 | `GET /availability` with `Prefer: code=404` | `404` with `code: RESOURCE_NOT_FOUND` |
| Book a free slot | US-05 | `POST /appointments` | `201` with an `Appointment` body (`status: SCHEDULED`) |
| Book with missing `availabilityId` | US-05 | `POST /appointments` with `{}` | `400` |
| Book without logging in | US-05 | `POST /appointments` without token | `401` with `code: UNAUTHORIZED` |
| Unauthorized booking attempt | US-05 | `POST /appointments` with `Prefer: code=403` | `403` with `code: INSTRUCTOR_NOT_ASSIGNED` |
| Nonexistent slot booking | US-05 | `POST /appointments` with `Prefer: code=404` | `404` with `code: SLOT_NOT_FOUND` |
| Double booking | US-05 | `POST /appointments` with `Prefer: code=409` | `409` with `code: SLOT_UNAVAILABLE` |

Business rules that depend on stored data (past-date rejection, duplicate email, occupied slot, assignment checks) cannot be reproduced by a stateless mock. They are covered here by forcing the documented response and will be verified against the real backend in Sprint 2 using the scenarios in the [QA Strategy](QA_Strategy.md).

### 7. Contract Change Rules
1. Any change to `openapi.yaml` starts with a GitHub issue describing the reason.
2. The architect approves the change in a pull request. Integration and QA are consulted.
3. `info.version` is increased for every merged change (e.g., `0.1.0` → `0.2.0` → `0.2.1`).
4. Frontend, backend, and tests are updated only after the contract change is merged into `develop`.

### 8. Contract Review Log
Points found while integrating the mock server with v0.1.0 and subsequent peer reviews, and their status:

| Point | Status |
| :--- | :--- |
| No operation for US-02 (assigning a student to an instructor) | Resolved in v0.2.0 (`POST /assignments`) |
| `POST /users` had no `409` for duplicate email (US-01) | Resolved in v0.2.0 |
| `GET /availability` had no `from` / `to` parameters (US-04) | Resolved in v0.2.0 |
| No `servers`, `securitySchemes`, or `example` values | Resolved in v0.2.0 |
| `studentId` was sent in the request body of `POST /appointments` | Resolved in v0.2.0 (taken from the token) |
| Duplicate email and occupied slot share the example error code `SLOT_UNAVAILABLE` | Resolved in v0.2.0 (PR #26, added `EMAIL_ALREADY_EXISTS`) |
| Missing 400/401/403 on `GET /availability` and 403/404 on `POST /appointments` | Resolved in v0.2.1 (Issue #30) |
| Missing 401 on `POST /users` and `POST /assignments` | Resolved in v0.2.1 (PR #31 peer review) |
| Missing Problem schema bodies on `Unauthorized` and `Forbidden` | Resolved in v0.2.1 (PR #31 peer review) |
| Missing 404 and specific 403 on `GET /availability` | Resolved in v0.2.1 (PR #31 peer review) |
| Missing `info.license` in OpenAPI metadata | Resolved in v0.2.1 (PR #31 peer review, added MIT) |
| `201` responses of `POST /users`, `POST /assignments` and `POST /availability` have no body, so the client does not receive the created `id` | Open (found in the v0.2.1 verification, to be raised with the architect) |
| `BadRequest` has no example, so the mock returns the placeholder `code: ERROR_CODE` for every `400` | Open (found in the v0.2.1 verification, to be raised with the architect) |
