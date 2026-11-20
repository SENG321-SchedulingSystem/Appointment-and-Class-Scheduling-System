# Refined Product Backlog (Sprint 2)

This backlog specifies the refined functional requirements, user stories, sub-tasks, Gherkin (`Given-When-Then`) acceptance criteria, effort estimates, dependencies, and assigned engineering owners for the **Appointment and Class Scheduling System**.

**Document Version:** 2.2 (Sprint 2)  
**SRS Reference:** `docs/SRS.md` (`FR-00` - `FR-09`)  
**API Contract Reference:** `openapi.yaml` (`v0.3.0`)  
**Product Owner:** Miraç Burak Esentürk  

---

## 1. Epics & Feature Overview
The product backlog is organized into two primary architectural epics:

- **Epic 1: Identity, User Provisioning & Authorization (`US-01`, `US-02`)**
  - Governs authentication (`POST /auth/login`), administrative user onboarding, user listing by role (`GET /users`), role integrity, and exclusive **1-to-1** student-instructor pairing authorization rules.
- **Epic 2: Availability & Atomic Appointment Engine (`US-03`, `US-04`, `US-05`)**
  - Governs forward-looking calendar availability declarations, instructor slot management (viewing own slots and deleting unbooked slots), privacy-filtered student search queries, and concurrent appointment reservation.

---

## 2. Product Backlog Matrix

| Priority | ID | Issue | Epic | User Story | Mapped SRS | Estimate (SP) | Dependencies | Assigned Owner | Status |
| :---: | :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **1** | **US-01** | `#19` | Epic 1: Identity & Provisioning | As an **Admin**, I want to add new instructors and students to the system so that I can manage authorized users. | `FR-00` - `FR-03` | **5** | None (Root Story) | Furkan Çelebi (`@furkancelebi06`) | Refined / Ready |
| **2** | **US-02** | `#20` | Epic 1: Identity & Provisioning | As an **Admin**, I want to list users by role and assign a student to a single instructor (and update it if needed) so that I can establish exclusive 1-to-1 authorization for taking lessons. | `FR-01`, `FR-02`, `FR-04`, `FR-09` | **3** | US-01 | Furkan Çelebi (`@furkancelebi06`) | Refined / Ready |
| **3** | **US-03** | `#21` | Epic 2: Availability & Booking | As an **Instructor**, I want to add my available teaching hours, view my own slots, and delete unbooked slots so that my assigned students can book appointments with me. | `FR-01`, `FR-02`, `FR-05`, `FR-06`, `FR-07` | **5** | US-01 | Eren Okat (`@erenokt3`) | Refined / Ready |
| **4** | **US-04** | `#22` | Epic 2: Availability & Booking | As a **Student**, I want to view only the available lesson hours of my single assigned instructor so that I can plan an appointment without seeing other students' private bookings. | `FR-01`, `FR-02`, `FR-07` | **3** | US-02, US-03 | Furkan Çelebi (`@furkancelebi06`) | Refined / Ready |
| **5** | **US-05** | `#23` | Epic 2: Availability & Booking | As a **Student**, I want to book an appointment for an available slot of my assigned instructor so that I can complete my lesson reservation safely. | `FR-01`, `FR-02`, `FR-08` | **8** | US-02, US-03, US-04 | Eren Okat (`@erenokt3`) | Refined / Ready |

---

## 3. Detailed User Stories, Sub-Tasks & Gherkin Acceptance Criteria

### US-01: Admin User Provisioning (`#19`)
* **User Story:** As an **Admin**, I want to add new instructors and students to the system so that I can manage authorized users.
* **Mapped SRS & Endpoints:** `FR-00`, `FR-01`, `FR-02`, `FR-03` (`POST /auth/login`, `POST /users`)

#### Sub-Tasks
- [ ] **Task 1.1:** Design Login (Screen 1) and Admin User Provisioning form with required password input (Screen 2a) in Figma (Owner: Nida `@anykaya06-cloud`).
- [ ] **Task 1.2:** Implement `POST /auth/login` returning `token`, `userId`, `name`, and `role`, and `POST /users` with mandatory password validation/hashing and unique email enforcement.
- [ ] **Task 1.3:** Apply JWT authentication (`401 Unauthorized`) and `ADMIN` role guard middleware (`403 Forbidden`).
- [ ] **Task 1.4:** Add automated contract and integration tests for `200`, `201`, `400`, `401`, `403`, and `409` responses.

#### Acceptance Criteria (Given-When-Then)
    Scenario 1: Successful user login
      Given a user exists with valid email and password
      When the user sends a POST request to "/auth/login" with their credentials
      Then the system should return HTTP 200 OK with a valid JWT "token", "userId", "name", and "role"

    Scenario 2: Successful user account creation by Admin
      Given I am authenticated with a valid JWT as a user with role "ADMIN"
      When I send a POST request to "/users" with valid name, unique email, required password, and role ("STUDENT" or "INSTRUCTOR")
      Then the system should securely hash the password and persist the user account
      And return HTTP 201 Created with the created user metadata ("id", "name", "email", "role")

    Scenario 3: Duplicate email registration attempt
      Given I am authenticated as an "ADMIN"
      And a user with email "student@example.com" already exists in the database
      When I send a POST request to "/users" with email "student@example.com"
      Then the system should reject the registration with HTTP 409 Conflict ("EMAIL_ALREADY_EXISTS")

    Scenario 4: Missing or invalid request parameters
      Given I am authenticated as an "ADMIN"
      When I send a POST request to "/users" with missing required fields (such as missing/weak password) or malformed email
      Then the system should reject the request with HTTP 400 Bad Request

    Scenario 5: Unauthenticated or unauthorized access
      Given I send a POST request to "/users" without a valid JWT token
      Then the system should return HTTP 401 Unauthorized
      When I send the request with a valid "INSTRUCTOR" or "STUDENT" token instead
      Then the system should reject the request with HTTP 403 Forbidden

---

### US-02: Admin 1-to-1 Student-Instructor Assignment (`#20`)
* **User Story:** As an **Admin**, I want to list users by role and assign a student to a single instructor (and update that assignment if needed) so that I can establish exclusive 1-to-1 authorization for taking lessons.
* **Mapped SRS & Endpoints:** `FR-01`, `FR-02`, `FR-04`, `FR-09` (`GET /users`, `POST /assignments`)

#### Sub-Tasks
- [ ] **Task 2.1:** Design 1-to-1 Student-Instructor pairing panel in Admin Dashboard (Figma Screens 2a/2b) (Owner: Nida `@anykaya06-cloud`).
- [ ] **Task 2.2:** Implement `GET /users?role=INSTRUCTOR` and `GET /users?role=STUDENT` for Admin dropdown selection.
- [ ] **Task 2.3:** Implement `POST /assignments` enforcing a single active instructor per student, validating user existence (`404`) and strict role matching (`STUDENT` + `INSTRUCTOR`, `400`).
- [ ] **Task 2.4:** Add automated Jest tests covering `200`, `201`, `400`, `401`, `403`, and `404` status codes.

#### Acceptance Criteria (Given-When-Then)
    Scenario 1: Admin lists instructors and students for assignment
      Given I am authenticated as an "ADMIN"
      When I send a GET request to "/users?role=INSTRUCTOR" or "/users?role=STUDENT"
      Then the system should return HTTP 200 OK with the filtered list of users

    Scenario 2: Successful 1-to-1 student-instructor assignment
      Given I am authenticated as an "ADMIN"
      And "studentId" exists with role "STUDENT" and "instructorId" exists with role "INSTRUCTOR"
      When I send a POST request to "/assignments" with "studentId" and "instructorId"
      Then the system should persist the exclusive 1-to-1 assignment relation in the database
      And return HTTP 201 Created

    Scenario 3: Missing or invalid request fields
      Given I am authenticated as an "ADMIN"
      When I send a POST request to "/assignments" with missing IDs or invalid role types
      Then the system should return HTTP 400 Bad Request

    Scenario 4: Unauthenticated or non-admin assignment attempt
      Given I send a POST request to "/assignments" without a valid JWT
      Then the system should return HTTP 401 Unauthorized
      When I send the request as a "STUDENT" or "INSTRUCTOR"
      Then the system should return HTTP 403 Forbidden

    Scenario 5: Nonexistent student or instructor ID
      Given I am authenticated as an "ADMIN"
      When I send a POST request to "/assignments" with a "studentId" or "instructorId" that does not exist
      Then the system should return HTTP 404 Not Found

---

### US-03: Instructor Availability Publishing & Slot Deletion (`#21`)
* **User Story:** As an **Instructor**, I want to add my available teaching hours, view my own slots, and delete unbooked slots so that my assigned students can book appointments with me.
* **Mapped SRS & Endpoints:** `FR-01`, `FR-02`, `FR-05`, `FR-06`, `FR-07` (`POST /availability`, `GET /availability?instructorId={id}`, `DELETE /availability/{id}`)

#### Sub-Tasks
- [ ] **Task 3.1:** Design Instructor Calendar View in Figma (Screen 3: add slot, view own slots, and delete `AVAILABLE` slots only) (Owner: Nida `@anykaya06-cloud`).
- [ ] **Task 3.2:** Implement `POST /availability` with forward-looking UTC timestamp and chronological order checks.
- [ ] **Task 3.3:** Support `GET /availability?instructorId={id}` for instructors viewing their own slots, and implement `DELETE /availability/{id}` permitting deletion strictly when `status == "AVAILABLE"` (`204 No Content`).
- [ ] **Task 3.4:** Add unit and integration tests for past dates (`400`), unauthenticated access (`401`), and deleting `BOOKED` slots (`409`).

#### Acceptance Criteria (Given-When-Then)
    Scenario 1: Instructor publishes a valid forward-looking availability slot
      Given I am authenticated as an "INSTRUCTOR"
      When I send a POST request to "/availability" with future ISO-8601 "startTime" and "endTime" ("endTime" > "startTime")
      Then the system should save the availability slot with status "AVAILABLE"
      And return HTTP 201 Created with the slot metadata ("id", "instructorId", "startTime", "endTime", "status")

    Scenario 2: Instructor views their own created availability slots
      Given I am authenticated as an "INSTRUCTOR" with ID "inst-1"
      When I send a GET request to "/availability?instructorId=inst-1"
      Then the system should return HTTP 200 OK containing my "AVAILABLE" and "BOOKED" slots

    Scenario 3: Slot entry for past dates or invalid chronological order
      Given I am authenticated as an "INSTRUCTOR"
      When I send a POST request to "/availability" with a past "startTime" or "endTime" <= "startTime"
      Then the system should reject the request with HTTP 400 Bad Request

    Scenario 4: Instructor deletes an unbooked availability slot
      Given I am authenticated as an "INSTRUCTOR"
      And I own an availability slot with "id" and status "AVAILABLE"
      When I send a DELETE request to "/availability/{id}"
      Then the system should remove the slot and return HTTP 204 No Content

    Scenario 5: Instructor attempts to delete a booked slot
      Given I am authenticated as an "INSTRUCTOR"
      And an availability slot has already been booked by a student (status "BOOKED")
      When I send a DELETE request to "/availability/{id}"
      Then the system should reject direct deletion and return HTTP 409 Conflict

---

### US-04: Student View Assigned Instructor Availability (`#22`)
* **User Story:** As a **Student**, I want to view only the available lesson hours of my single assigned instructor so that I can plan an appointment without seeing other students' private bookings.
* **Mapped SRS & Endpoint:** `FR-01`, `FR-02`, `FR-07` (`GET /availability`)

#### Sub-Tasks
- [ ] **Task 4.1:** Design Student Booking Panel in Figma (Screen 4: showing only `AVAILABLE` slots of the assigned instructor and empty/unassigned feedback for `403 INSTRUCTOR_NOT_ASSIGNED`) (Owner: Nida `@anykaya06-cloud`).
- [ ] **Task 4.2:** Implement `GET /availability` resolving the student's single assigned instructor via JWT `userId`, returning `403 INSTRUCTOR_NOT_ASSIGNED` if no instructor is assigned.
- [ ] **Task 4.3:** Filter records deterministically by `status == "AVAILABLE"` and optional `from` / `to` date-time boundary parameters.
- [ ] **Task 4.4:** Write tests verifying `BOOKED` slots and unassigned instructors are hidden, unassigned students receive `403 INSTRUCTOR_NOT_ASSIGNED`, and unauthorized roles receive `401`/`403`.

#### Acceptance Criteria (Given-When-Then)
    Scenario 1: Student views available slots of their single assigned instructor
      Given I am authenticated as a "STUDENT" assigned to Instructor A
      And Instructor A has open "AVAILABLE" future slots and private "BOOKED" slots
      When I send a GET request to "/availability" (with optional "from" and "to" query parameters)
      Then the system should return HTTP 200 OK containing only the "AVAILABLE" slots matching the date boundaries
      And any "BOOKED" slots must be excluded from the response

    Scenario 2: Assigned instructor has no available slots
      Given I am authenticated as a "STUDENT" assigned to Instructor A
      And Instructor A currently has no open "AVAILABLE" slots
      When I send a GET request to "/availability"
      Then the system should return HTTP 200 OK with an empty list "[]"

    Scenario 3: Student has no assigned instructor
      Given I am authenticated as a "STUDENT" who has not been assigned to any instructor yet
      When I send a GET request to "/availability"
      Then the system should reject the request with HTTP 403 Forbidden ("INSTRUCTOR_NOT_ASSIGNED")

    Scenario 4: Unauthenticated or forbidden availability access
      Given I send a GET request to "/availability" without a valid JWT
      Then the system should return HTTP 401 Unauthorized
      When I am authenticated as an "ADMIN" (or as an "INSTRUCTOR" requesting another instructor's slots)
      Then the system should reject the request with HTTP 403 Forbidden

---

### US-05: Concurrency-Safe Appointment Booking (`#23`)
* **User Story:** As a **Student**, I want to book an appointment for an available slot of my assigned instructor so that I can complete my lesson reservation safely.
* **Mapped SRS & Endpoint:** `FR-01`, `FR-02`, `FR-08` (`POST /appointments`)

#### Sub-Tasks
- [ ] **Task 5.1:** Design one-click appointment booking confirmation and conflict alert states in Figma (Screen 4) (Owner: Nida `@anykaya06-cloud`).
- [ ] **Task 5.2:** Implement `POST /appointments` accepting `availabilityId` wrapped in an atomic Firebase Firestore transaction and setting appointment status to `SCHEDULED`.
- [ ] **Task 5.3:** Enforce JWT authentication (`401`) and authorization check ensuring the target `availabilityId` belongs to the student's assigned instructor (`403`).
- [ ] **Task 5.4:** Write concurrency tests firing simultaneous booking requests to verify one `201 Created` and one `409 Conflict`.

#### Acceptance Criteria (Given-When-Then)
    Scenario 1: Student successfully books an available slot
      Given I am authenticated as a "STUDENT" assigned to Instructor A
      And "avail-101" belongs to Instructor A with status "AVAILABLE"
      When I send a POST request to "/appointments" with "availabilityId": "avail-101"
      Then the system should atomically lock "avail-101" as "BOOKED" and create the appointment record with status "SCHEDULED"
      And return HTTP 201 Created with the confirmed appointment metadata ("id", "availabilityId", "studentId", "status")

    Scenario 2: Race condition / concurrent booking prevention
      Given Student 1 and Student 2 are both assigned to Instructor A
      And "avail-101" has status "AVAILABLE"
      When Student 1 and Student 2 send simultaneous POST requests to "/appointments" for "availabilityId": "avail-101"
      Then exactly one transaction shall succeed with HTTP 201 Created (status "SCHEDULED")
      And the competing request shall fail with HTTP 409 Conflict ("SLOT_UNAVAILABLE")

    Scenario 3: Student attempts to book a slot of an unassigned instructor or without authentication
      Given I send a POST request to "/appointments" without a valid JWT
      Then the system should return HTTP 401 Unauthorized
      When I am authenticated as a "STUDENT" assigned only to Instructor A and send "availabilityId": "avail-202" belonging to Instructor B
      Then the system should reject the booking with HTTP 403 Forbidden

---

## 4. Estimation & Sizing Rationale
- **Fibonacci Scale:** Estimates represent relative effort, technical complexity, and architectural uncertainty rather than raw calendar hours.
- **High-Complexity Factor (`US-05` - 8 SP):** Highest point allocation due to concurrent race condition mitigation, distributed database transactions (Firebase transactions), and atomicity guarantees under simultaneous requests.
- **Baseline Stories (`US-02`, `US-04` - 3 SP):** Standard CRUD/query operations with deterministic relational checks.

---

## 5. Out of Scope for Sprint 2
- **Appointment History View:** Viewing past/completed appointment logs is excluded from Sprint 2 scope.
- **Appointment Cancellation / Rescheduling:** Canceling or modifying confirmed appointments (`DELETE /appointments/{id}`) is deferred to future sprints.
- **Multi-Instructor Assignment:** Each student is restricted to a single active instructor in v1.0.

---

## 6. Traceability & Engineering Alignment
- **SRS & API Contract Mapping:** Every user story maps directly to functional requirements in `docs/SRS.md` (`FR-00` - `FR-09`) and operations in `openapi.yaml` (`v0.3.0`: `POST /auth/login`, `POST /users`, `GET /users`, `POST /assignments`, `POST /availability`, `DELETE /availability/{id}`, `GET /availability`, `POST /appointments`).
- **Quality Assurance:** Every Gherkin acceptance criterion corresponds directly to automated Jest contract and integration test suites defined in `docs/QA_Strategy.md` and quality metrics in `docs/NFR_Quality_Measures.md`.
- **Architectural Scope:** Aligns strictly with the system boundary and component definitions documented in `docs/system-boundary.md` and `docs/Architecture.md`.