# API Integration Strategy - SENG 321 Appointment Scheduling System

This document describes how the frontend and backend of the Scheduling System are connected through the OpenAPI contract. It is owned by the Implementation & Integration Engineer (Furkan Çelebi) and approved by the Lead Software Architect (Eren Okat), as defined in the [RACI Matrix](RACI_Matrix.md).

### 1. API-First Principle
* The single source of truth for every client-server interaction is [`openapi.yaml`](../openapi.yaml).
* The frontend never talks to the database (Firebase) directly. All reads and writes go through the operations defined in the contract.
* Backend work targets the agreed operations and schemas. Frontend work starts against a mock server generated from the same file, so both sides can progress in parallel.

### 2. Environments

| Environment | Base URL | Purpose |
| :--- | :--- | :--- |
| **mock** | `http://127.0.0.1:4010` | Prism mock generated from `openapi.yaml`. Used for frontend development and contract tests before the backend exists. |
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
| `409` | Conflict (e.g., `SLOT_UNAVAILABLE`) | Show "this slot has just been taken" and refresh availability. |

### 4. Authentication Flow
1. The client calls `POST /auth/login` with email and password.
2. The response returns a `token` and the user's `role` (`ADMIN`, `INSTRUCTOR`, `STUDENT`).
3. The client sends the token on every later request in the `Authorization: Bearer <token>` header.
4. The client uses `role` only to decide which screens to show. The backend always enforces permissions itself.

### 5. Running the Mock Server
Requires Node.js. No installation inside the repository is needed.

```bash
# Validate the contract
npx @redocly/cli@1 lint openapi.yaml --extends=minimal

# Start the mock server
npx @stoplight/prism-cli@5 mock openapi.yaml -p 4010

# Book a slot (success)
curl -X POST http://127.0.0.1:4010/appointments \
  -H "Content-Type: application/json" \
  -d '{"availabilityId":"AV-12","studentId":"U-201"}'

# Force the double-booking case
curl -X POST http://127.0.0.1:4010/appointments \
  -H "Prefer: code=409" -H "Content-Type: application/json" \
  -d '{"availabilityId":"AV-12","studentId":"U-201"}'
```

The `Prefer: code=<status>` header asks Prism to return a specific documented response, which lets the frontend and QA exercise error paths without a backend.

### 6. Sprint 1 Verification Evidence
Run on 24 October 2026 against `openapi.yaml` on `develop`.

| Check | Request | Result |
| :--- | :--- | :--- |
| Contract structure | `redocly lint --extends=minimal` | Valid |
| Book a free slot (US-05) | `POST /appointments` with full body | `201` with an `Appointment` body |
| Double booking (US-05) | `POST /appointments` with `Prefer: code=409` | `409` with `code: SLOT_UNAVAILABLE` |
| Invalid input | `POST /appointments` without `studentId` | `400` (Prism request validation) |
| List free slots (US-04) | `GET /availability?instructorId=U-101` | `200` with an `Availability` array |
| Login | `POST /auth/login` | `200` with `token` and `role` |

### 7. Contract Change Rules
1. Any change to `openapi.yaml` starts with a GitHub issue describing the reason.
2. The architect approves the change in a pull request. Integration and QA are consulted.
3. `info.version` is increased for every merged change (e.g., `0.1.0` → `0.2.0`).
4. Frontend, backend, and tests are updated only after the contract change is merged into `develop`.

### 8. Open Points for the Contract
These were found while integrating the mock server and are tracked as issues for the architect:
* No operation for US-02 (assigning a student to an instructor).
* `POST /users` has no `409` response for duplicate email (US-01 acceptance criteria).
* `GET /availability` has no `from` / `to` parameters for boundary date searches (US-04).
* No `servers`, `securitySchemes`, or `example` values. Mock responses therefore contain placeholder strings.
* `NewAppointment.studentId` could be taken from the token instead of the request body, so a student cannot book on behalf of someone else.
