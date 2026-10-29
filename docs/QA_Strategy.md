# Quality Assurance and Testing Strategy - Sprint 1

## Role Owner: Merve Öksüz (Quality Assurance & Test Automation Engineer)

## 1. Definition of Ready (DoR) for User Stories
A user story is considered "Ready" for implementation and testing only if it meets the following criteria:
- Clear user role and objective defined (As a [Role], I want [Feature] so that [Benefit]).
- Acceptance criteria are explicitly written and agreed upon with the Product Owner.
- Technical dependencies and API contracts (`openapi.yaml`) are defined.
- Test scenarios (including edge cases and error codes) are outlined by QA.
- The story is small enough to be completed within a single sprint.

## 2. QA Strategy & Testing Framework
- **Testing Levels:** Unit testing, Integration testing (including concurrency tests), and API contract validation.
- **Coverage Goal:** Maintain a mandatory minimum of **50% unit-test coverage** across all modules.
- **Test Tools:** Jest, configured in the CI/CD pipeline via GitHub Actions.
- **Defect Tracking:** GitHub Issues with a bug report template and labels. Every defect found during testing is reported as an issue.
- **Contract Rule:** All test scenarios are derived from the status codes defined in `openapi.yaml`. A scenario is added to the table only after the code exists in the merged contract.

## 3. Expected Error Codes
- **400 Bad Request:** Invalid input, such as a past date or missing/invalid fields.
- **401 Unauthorized:** The user is not logged in (missing or invalid token).
- **403 Forbidden:** The user is logged in but is not allowed to perform the action (e.g. a non-admin creating a user, or a student accessing an instructor who is not assigned to them).
- **404 Not Found:** The referenced resource does not exist (e.g. a nonexistent user, instructor or availability slot).
- **409 Conflict:** The resource already exists or is already taken (occupied time slot, duplicate email).

## 4. Story-to-Test Traceability
Stories refer to the backlog issues (US-01 = #19 ... US-05 = #23). Endpoints and status codes follow the API contract in `openapi.yaml` (v0.2.1).

| Story | Scenario | Endpoint | Expected |
|-------|----------|----------|----------|
| US-01 (#19) | Create a user with valid credentials | POST /users | 201 |
| US-01 (#19) | Register with an already registered email | POST /users | 409 (code: EMAIL_ALREADY_EXISTS) |
| US-01 (#19) | Invalid or missing fields | POST /users | 400 |
| US-01 (#19) | Create a user without a token | POST /users | 401 (code: UNAUTHORIZED) |
| US-01 (#19) | Non-admin user tries to create a user | POST /users | 403 |
| US-02 (#20) | Admin assigns a student to an instructor | POST /assignments | 201 |
| US-02 (#20) | Assign a student without a token | POST /assignments | 401 (code: UNAUTHORIZED) |
| US-02 (#20) | Non-admin user tries to assign | POST /assignments | 403 |
| US-02 (#20) | Assign a nonexistent user | POST /assignments | 404 (code: RESOURCE_NOT_FOUND) |
| US-03 (#21) | Instructor adds a valid future time slot | POST /availability | 201 |
| US-03 (#21) | Instructor adds availability in the past | POST /availability | 400 |
| US-03 (#21) | Add availability without a token | POST /availability | 401 |
| US-03 (#21) | Non-instructor tries to add availability | POST /availability | 403 |
| US-04 (#22) | Instructor has no availability | GET /availability | 200 + [] |
| US-04 (#22) | Boundary date/time filtering (from/to) | GET /availability | 200, only slots inside the range |
| US-04 (#22) | Missing required instructorId | GET /availability | 400 |
| US-04 (#22) | List availability without a token | GET /availability | 401 (code: UNAUTHORIZED) |
| US-04 (#22) | Student requests an instructor not assigned to them | GET /availability | 403 (code: INSTRUCTOR_NOT_ASSIGNED) |
| US-04 (#22) | Nonexistent instructor | GET /availability | 404 (code: RESOURCE_NOT_FOUND) |
| US-05 (#23) | Book a free slot | POST /appointments | 201 |
| US-05 (#23) | Book an occupied slot | POST /appointments | 409 (code: SLOT_UNAVAILABLE) |
| US-05 (#23) | Two students book the same slot concurrently | POST /appointments | one 201, one 409 |
| US-05 (#23) | Book without logging in | POST /appointments | 401 |
| US-05 (#23) | Missing availabilityId | POST /appointments | 400 |
| US-05 (#23) | Book a slot of an instructor not assigned to the student | POST /appointments | 403 (code: INSTRUCTOR_NOT_ASSIGNED) |
| US-05 (#23) | Nonexistent availabilityId | POST /appointments | 404 (code: SLOT_NOT_FOUND) |