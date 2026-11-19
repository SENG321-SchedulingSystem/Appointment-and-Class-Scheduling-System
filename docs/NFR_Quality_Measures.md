# Non-Functional Requirements and Quality Measures - Sprint 2

**Project:** Appointment and Class Scheduling System
**Role Owner:** Merve Öksüz (QA & Test Automation Engineer)
**API Contract Reference:** `openapi.yaml` (v0.3.0)
**Related Documents:** [`QA_Strategy.md`](QA_Strategy.md), [`Architecture.md`](Architecture.md), [`product-backlog.md`](product-backlog.md), [`SRS.md`](SRS.md)

This document defines the non-functional requirements (NFRs) of the system and the measurable quality measures used to verify them. Every requirement has an ID, a target value and a verification method, so that it can be tested objectively. Targets were agreed in the Sprint 2 team plan; verification is automated in Sprint 3, when the implementation is available.

---

## 1. Non-Functional Requirements

### 1.1 Performance

| ID | Requirement | Measurable Target | Verification Method |
|---|---|---|---|
| NFR-P1 | API response time | 95% of API requests respond in **< 200 ms** (measured in the local Docker Compose environment with the Firebase Emulator, 50 sequential requests per endpoint plus 10 parallel requests on `POST /appointments`) | Automated timing test in the Jest/integration suite, p95 calculated from the recorded response times |
| NFR-P2 | Appointment completion speed | A student completes the flow from the booking screen to the confirmation in **< 15 seconds** | Timed usability check with 3 testers on the Figma prototype / final UI |

### 1.2 Consistency and Concurrency

| ID | Requirement | Measurable Target | Verification Method |
|---|---|---|---|
| NFR-C1 | No double booking | **100%** race-condition prevention: for N simultaneous `POST /appointments` requests on the same slot, exactly one returns `201` and all others return `409 SLOT_UNAVAILABLE` | Concurrency integration test (N = 10 requests, repeated 100 times, 0 double bookings allowed) |
| NFR-C2 | Atomic booking | The appointment record and the slot status change (`AVAILABLE` -> `BOOKED`) are written in a single Firestore transaction; no appointment exists without a booked slot | Integration test + code review (ADR-03 in `Architecture.md`) |

### 1.3 Security

| ID | Requirement | Measurable Target | Verification Method |
|---|---|---|---|
| NFR-S1 | Authentication | All endpoints except `POST /auth/login` require a valid Bearer JWT; a missing or invalid token returns `401` (`UNAUTHORIZED`) | Contract test for every endpoint |
| NFR-S2 | Role-based authorization | Role rules are enforced on the backend: non-admin cannot call `POST /users`, `POST /assignments` or `GET /users`; a student can only access their assigned instructor (`403 INSTRUCTOR_NOT_ASSIGNED`) | Contract test for every `403` in `openapi.yaml` |
| NFR-S3 | No ID spoofing | The student identity is always taken from the JWT claims, never from the request body; a `studentId` sent in the payload has **0 effect** on the stored appointment | Test: send a foreign `studentId` in the body, verify the stored `studentId` equals the token's user |
| NFR-S4 | Password protection | Passwords are stored only as hashes and are **never** returned in any response | Test on `POST /users` and `GET /users` responses |

### 1.4 Reliability and Error Handling

| ID | Requirement | Measurable Target | Verification Method |
|---|---|---|---|
| NFR-R1 | Standard error format | **100%** of error responses use `application/problem+json` with the fields `title`, `status`, `code`, `detail` | Contract test on every documented error response |
| NFR-R2 | No server errors for domain failures | Expected failures (invalid input, missing resource, conflict, forbidden) return the documented `4xx` code, never `500` | Negative test per endpoint |
| NFR-R3 | Valid time slots | A slot in the past or with `endTime` <= `startTime` is always rejected with `400` | Unit and contract test on `POST /availability` |

### 1.5 Usability and Accessibility

| ID | Requirement | Measurable Target | Verification Method |
|---|---|---|---|
| NFR-U1 | Accessibility | The user interface complies with **WCAG 2.1 Level AA**: text contrast >= 4.5:1, all functions usable with the keyboard, visible focus indicator, form fields have labels, buttons and headings have meaningful names for screen readers (ARIA where needed) | Automated check (axe / Lighthouse accessibility score >= 90) + manual keyboard and screen-reader check |
| NFR-U2 | Responsive design | All 5 screens are usable without horizontal scrolling at **360 px** (mobile), **768 px** (tablet) and **1280 px** (desktop) | Manual check in browser dev tools at the three breakpoints |
| NFR-U3 | Clear conflict feedback | If a booking fails with `409`, the UI shows an understandable message and the updated slot list | Check against the Figma Screen 4 conflict state |

### 1.6 Maintainability and Portability

| ID | Requirement | Measurable Target | Verification Method |
|---|---|---|---|
| NFR-M1 | Contract as single source of truth | `openapi.yaml` passes the Redocly lint with **0 errors** on every pull request | GitHub Actions `openapi-lint` workflow |
| NFR-M2 | Test coverage | Unit-test coverage of at least **50%** across all modules | Jest coverage report in CI (Sprint 3) |
| NFR-M3 | Reproducible setup | The full system (frontend, backend, Firebase Emulator) starts with a single `docker compose up` | Fresh clone start test (ADR-02 in `Architecture.md`) |

---

## 2. Quality Measures

| ID | Quality Measure | Target | Source / Tool | Checked |
|---|---|---|---|---|
| QM-01 | API response time (95th percentile) | < 200 ms | Jest timing test | Sprint 3 |
| QM-02 | Booking completion time | < 15 s | Usability check, 3 testers | Sprint 3 |
| QM-03 | Double bookings under concurrency | 0 (100% prevention) | Concurrency test (10 requests x 100 runs) | Sprint 3 |
| QM-04 | OpenAPI lint errors | 0 | Redocly in GitHub Actions | Every PR |
| QM-05 | Unit-test coverage | >= 50% | Jest coverage | Sprint 3 |
| QM-06 | Contract-test traceability | 100% of status codes in `openapi.yaml` have a test scenario | `QA_Strategy.md` traceability table | Every contract change |
| QM-07 | Accessibility score | >= 90 (Lighthouse), 0 critical axe violations | Lighthouse / axe | Sprint 3 |
| QM-08 | Merged PRs with red CI | 0 | GitHub branch rules | Every PR |
| QM-09 | Open critical defects at release | 0 | GitHub Issues (`bug.yml` template) | Each release |

---

## 3. Story-to-NFR Traceability

Shows which NFRs protect each user story of the backlog (`product-backlog.md`).

| Story | Issue | Protecting NFRs |
|---|---|---|
| US-01 Admin user provisioning | #19 | NFR-S1, NFR-S2, NFR-S4, NFR-R1, NFR-R2, NFR-P1, NFR-U1 |
| US-02 Admin student-instructor assignment | #20 | NFR-S1, NFR-S2, NFR-R1, NFR-R2, NFR-P1, NFR-U1 |
| US-03 Instructor availability and slot deletion | #21 | NFR-S1, NFR-S2, NFR-R1, NFR-R2, NFR-R3, NFR-P1, NFR-U1, NFR-U2 |
| US-04 Student views instructor availability | #22 | NFR-S1, NFR-S2, NFR-R1, NFR-P1, NFR-U1, NFR-U2 |
| US-05 Concurrency-safe appointment booking | #23 | NFR-C1, NFR-C2, NFR-S1, NFR-S2, NFR-S3, NFR-R1, NFR-R2, NFR-P1, NFR-P2, NFR-U1, NFR-U2, NFR-U3 |
| All stories (project level) | - | NFR-M1, NFR-M2, NFR-M3 |

---

## 4. Defect Management

- Every defect found during testing is reported as a GitHub Issue using the `bug.yml` template.
- Severity: **Critical** (system unusable, double booking, security hole), **Major** (feature fails), **Minor** (cosmetic or low impact).
- A critical defect blocks the release; the `sprint-2` tag is created only when QM-08 and QM-09 are satisfied.
- Each fix goes through a pull request with a linked issue, one peer review and a green CI check.

## 5. Assumptions and Open Points

- Performance targets are measured locally with the Firebase Emulator; cloud latency is out of scope for Sprint 2.
- Automated verification of NFR-P1, NFR-C1, NFR-S3 and the accessibility checks depends on the implementation and is planned for Sprint 3.
- Screen 5 (Appointment History and Profile) in the Figma plan is outside the Sprint 2 backlog scope (see `product-backlog.md`, section 5), so no NFR is defined for it.