# Refined Product Backlog (Sprint 2)

This backlog specifies the refined functional requirements, user stories, sub-tasks, Gherkin (`Given-When-Then`) acceptance criteria, effort estimates, dependencies, and assigned engineering owners for the **Appointment and Class Scheduling System**.

**Document Version:** 2.0 (Sprint 2)  
**SRS Reference:** `docs/SRS.md` (`FR-01`–`FR-08`)  
**API Contract Reference:** `openapi.yaml` (`v0.2.1`)  
**Product Owner:** Miraç Burak Esentürk  
**Last Updated:** November 19, 2026  

---

## 1. Epics & Feature Overview
The product backlog is organized into two primary architectural epics:

- **Epic 1: Identity, User Provisioning & Authorization (`US-01`, `US-02`)**
  - Governs administrative user onboarding, role integrity, and exclusive **1-to-1** student-instructor pairing authorization rules.
- **Epic 2: Availability & Atomic Appointment Engine (`US-03`, `US-04`, `US-05`)**
  - Governs forward-looking calendar availability declarations (including deletion of unbooked slots), privacy-filtered search queries, and concurrent appointment reservation.

---

## 2. Product Backlog Matrix

| Priority | ID | Issue | Epic | User Story | Mapped SRS | Estimate (SP) | Dependencies | Assigned Owner | Status |
| :---: | :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **1** | **US-01** | `#19` | Epic 1: Identity & Provisioning | As an **Admin**, I want to add new instructors and students to the system so that I can manage authorized users. | `FR-01`–`FR-03` | **5** | None (Root Story) | Furkan Çelebi (`@furkancelebi06`) | Refined / Ready |
| **2** | **US-02** | `#20` | Epic 1: Identity & Provisioning | As an **Admin**, I want to assign a student to a single instructor (and update it if needed) so that I can establish exclusive 1-to-1 authorization for taking lessons. | `FR-01`, `FR-02`, `FR-04` | **3** | US-01 | Furkan Çelebi (`@furkancelebi06`) | Refined / Ready |
| **3** | **US-03** | `#21` | Epic 2: Availability & Booking | As an **Instructor**, I want to add my available teaching hours and delete unbooked slots so that my assigned students can book appointments with me. | `FR-01`, `FR-02`, `FR-05`, `FR-06` | **5** | US-01 | Eren Okat (`@erenokt3`) | Refined / Ready |
| **4** | **US-04** | `#22` | Epic 2: Availability & Booking | As a **Student**, I want to view only the available lesson hours of my single assigned instructor so that I can plan an appointment without seeing other students' private bookings. | `FR-01`, `FR-02`, `FR-07` | **3** | US-02, US-03 | Furkan Çelebi (`@furkancelebi06`) | Refined / Ready |
| **5** | **US-05** | `#23` | Epic 2: Availability & Booking | As a **Student**, I want to book an appointment for an available slot of my assigned instructor so that I can complete my lesson reservation safely. | `FR-01`, `FR-02`, `FR-08` | **8** | US-02, US-03, US-04 | Eren Okat (`@erenokt3`) | Refined / Ready |

---

## 3. Detailed User Stories, Sub-Tasks & Gherkin Acceptance Criteria

### US-01: Admin User Provisioning (`#19`)
* **User Story:** As an **Admin**, I want to add new instructors and students to the system so that I can manage authorized users.
* **Mapped SRS & Endpoint:** `FR-01`, `FR-02`, `FR-03` (`POST /users`)

#### Sub-Tasks
- [ ] **Task 1.1:** Design Admin User Provisioning form in Figma (Screen 2).
- [ ] **Task 1.2:** Implement `POST /users` controller with password hashing and unique email enforcement.
- [ ] **Task 1.3:** Apply JWT `admin` role guard middleware (`403 Forbidden` for unauthorized roles).
- [ ] **Task 1.4:** Add automated contract and integration tests for `201`, `400`, `403`, and `409` responses.

#### Acceptance Criteria (Given-When-Then)
    Scenario 1: Successful user account creation by Admin
      Given I am authenticated as a user with the "admin" role
      When I send a POST request to "/users" with valid name, unique email, password, and role ("student" or "instructor")
      Then the system should persist the user with a securely hashed password
      And return HTTP 201 Created with the created user metadata

    Scenario 2: Duplicate email registration attempt
      Given I am authenticated as an "admin"
      And a user with email "student@example.com" already exists in the database
      When I send a POST request to "/users" with email "student@example.com"
      Then the system should reject the registration with HTTP 409 Conflict ("EMAIL_ALREADY_EXISTS")

    Scenario 3: Missing or invalid request parameters
      Given I am authenticated as an "admin"
      When I send a POST request to "/users" with missing required fields or malformed email
      Then the system should reject the request with HTTP 400 Bad Request

    Scenario 4: Unauthorized access by non-admin role
      Given I am authenticated as a user with the "instructor" or "student" role
      When I send a POST request to "/users"
      Then the system should reject the request with HTTP 403 Forbidden

---

### US-02: Admin 1-to-1 Student-Instructor Assignment (`#20`)
* **User Story:** As an **Admin**, I want to assign a student to a single instructor (and update that assignment if needed) so that I can establish exclusive 1-to-1 authorization for taking lessons.
* **Mapped SRS & Endpoint:** `FR-01`, `FR-02`, `FR-04` (`POST /assignments`)

#### Sub-Tasks
- [ ] **Task 2.1:** Design 1-to-1 Student-Instructor pairing panel in Admin Dashboard (Figma Screen 2).
- [ ] **Task 2.2:** Implement `POST /assignments` enforcing a single active instructor per student (updating if already assigned).
- [ ] **Task 2.3:** Validate user existence (`404`) and strict role matching (`student` + `instructor`, `400`).
- [ ] **Task 2.4:** Add automated Jest tests covering `201`/`200`, `400`, `403`, and `404` status codes.

#### Acceptance Criteria (Given-When-Then)
    Scenario 1: Successful 1-to-1 student-instructor assignment
      Given I am authenticated as an "admin"
      And "studentId" exists with role "student" and "instructorId" exists with role "instructor"
      When I send a POST request to "/assignments" with "studentId" and "instructorId"
      Then the system should persist the exclusive 1-to-1 assignment relation in the database
      And return HTTP 201 Created (or HTTP 200 OK if updating an existing instructor assignment)

    Scenario 2: Missing or invalid request fields
      Given I am authenticated as an "admin"
      When I send a POST request to "/assignments" with missing IDs or invalid role types
      Then the system should return HTTP 400 Bad Request

    Scenario 3: Non-admin role attempts assignment
      Given I am authenticated as a "student" or "instructor"
      When I send a POST request to "/assignments"
      Then the system should return HTTP 403 Forbidden

    Scenario 4: Nonexistent student or instructor ID
      Given I am authenticated as an "admin"
      When I send a POST request to "/assignments" with a "studentId" or "instructorId" that does not exist
      Then the system should return HTTP 404 Not Found

---

### US-03: Instructor Availability Publishing & Slot Deletion (`#21`)
* **User Story:** As an **Instructor**, I want to add my available teaching hours and delete unbooked slots so that my assigned students can book appointments with me.
* **Mapped SRS & Endpoints:** `FR-01`, `FR-02`, `FR-05`, `FR-06` (`POST /availability`, `DELETE /availability/{slotId}`)

#### Sub-Tasks
- [ ] **Task 3.1:** Design Instructor Calendar View in Figma (Screen 3: add slot & delete unbooked slot only).
- [ ] **Task 3.2:** Implement `POST /availability` with forward-looking UTC timestamp and chronological order checks.
- [ ] **Task 3.3:** Implement `DELETE /availability/{slotId}` permitting deletion strictly when `status == "available"`.
- [ ] **Task 3.4:** Add unit and integration tests for past dates (`400`) and deleting booked slots (`409`).

#### Acceptance Criteria (Given-When-Then)
    Scenario 1: Instructor publishes a valid forward-looking availability slot
      Given I am authenticated as an "instructor"
      When I send a POST request to "/availability" with future ISO-8601 "startTime" and "endTime" ("endTime" > "startTime")
      Then the system should save the time slot with status "available"
      And return HTTP 201 Created with the slot metadata

    Scenario 2: Slot entry for past dates or invalid chronological order
      Given I am authenticated as an "instructor"
      When I send a POST request to "/availability" with a past "startTime" or "endTime" <= "startTime"
      Then the system should reject the request with HTTP 400 Bad Request

    Scenario 3: Instructor deletes an unbooked availability slot
      Given I am authenticated as an "instructor"
      And I own an availability slot with status "available"
      When I send a DELETE request to "/availability/{slotId}"
      Then the system should remove the slot and return HTTP 200 OK (or 204 No Content)

    Scenario 4: Instructor attempts to delete a booked slot
      Given I am authenticated as an "instructor"
      And an availability slot has already been booked by a student (status "booked")
      When I send a DELETE request to "/availability/{slotId}"
      Then the system should reject direct deletion and return HTTP 409 Conflict

---

### US-04: Student View Assigned Instructor Availability (`#22`)
* **User Story:** As a **Student**, I want to view only the available lesson hours of my single assigned instructor so that I can plan an appointment without seeing other students' private bookings.
* **Mapped SRS & Endpoint:** `FR-01`, `FR-02`, `FR-07` (`GET /availability`)

#### Sub-Tasks
- [ ] **Task 4.1:** Design Student Booking Panel in Figma (Screen 4: showing only `available` slots of the assigned instructor).
- [ ] **Task 4.2:** Implement `GET /availability` resolving the student's single assigned instructor via JWT `userId`.
- [ ] **Task 4.3:** Filter records deterministically by `status == "available"` and optional `from` / `to` date-time boundary parameters.
- [ ] **Task 4.4:** Write tests verifying booked slots and unassigned instructors are completely hidden.

#### Acceptance Criteria (Given-When-Then)
    Scenario 1: Student views available slots of their single assigned instructor
      Given I am authenticated as a "student" assigned to Instructor A
      And Instructor A has open "available" future slots and private "booked" slots
      When I send a GET request to "/availability" (with optional "from" and "to" query parameters)
      Then the system should return HTTP 200 OK containing only the "available" slots matching the date boundaries
      And any "booked" slots must be excluded from the response

    Scenario 2: Student has no available slots or no assigned instructor
      Given I am authenticated as a "student" whose assigned instructor has no open slots (or no instructor is assigned yet)
      When I send a GET request to "/availability"
      Then the system should return HTTP 200 OK with an empty list "[]"

    Scenario 3: Non-student attempts to access student availability view
      Given I am authenticated as an "admin" or "instructor"
      When I send a GET request to "/availability"
      Then the system should reject the request with HTTP 403 Forbidden

---

### US-05: Concurrency-Safe Appointment Booking (`#23`)
* **User Story:** As a **Student**, I want to book an appointment for an available slot of my assigned instructor so that I can complete my lesson reservation safely.
* **Mapped SRS & Endpoint:** `FR-01`, `FR-02`, `FR-08` (`POST /appointments`)

#### Sub-Tasks
- [ ] **Task 5.1:** Design one-click appointment booking confirmation and conflict alert states in Figma (Screen 4).
- [ ] **Task 5.2:** Implement `POST /appointments` wrapped in an atomic Firebase Firestore transaction.
- [ ] **Task 5.3:** Enforce authorization check ensuring the target `slotId` belongs to the student's assigned instructor (`403`).
- [ ] **Task 5.4:** Write concurrency tests firing simultaneous booking requests to verify one `201 Created` and one `409 Conflict`.

#### Acceptance Criteria (Given-When-Then)
    Scenario 1: Student successfully books an available slot
      Given I am authenticated as a "student" assigned to Instructor A
      And "slot-101" belongs to Instructor A with status "available"
      When I send a POST request to "/appointments" with "slotId": "slot-101"
      Then the system should atomically lock "slot-101" as "booked" and create the appointment record
      And return HTTP 201 Created with the confirmed reservation details

    Scenario 2: Race condition / concurrent booking prevention
      Given Student 1 and Student 2 are both assigned to Instructor A
      And "slot-101" has status "available"
      When Student 1 and Student 2 send simultaneous POST requests to "/appointments" for "slot-101"
      Then exactly one transaction shall succeed with HTTP 201 Created
      And the competing request shall fail with HTTP 409 Conflict ("SLOT_UNAVAILABLE")

    Scenario 3: Student attempts to book a slot of an unassigned instructor
      Given I am authenticated as a "student" assigned only to Instructor A
      And "slot-202" belongs to Instructor B
      When I send a POST request to "/appointments" with "slotId": "slot-202"
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
- **SRS & API Contract Mapping:** Every user story maps directly to functional requirements in `docs/SRS.md` (`FR-01`–`FR-08`) and operations in `openapi.yaml` (`POST /users`, `POST /assignments`, `POST /availability`, `DELETE /availability/{slotId}`, `GET /availability`, `POST /appointments`).
- **Quality Assurance:** Every Gherkin acceptance criterion corresponds directly to automated Jest contract and integration test suites defined in `docs/QA_Strategy.md` and quality metrics in `docs/NFR_Quality_Measures.md`.
- **Architectural Scope:** Aligns strictly with the system boundary and component definitions documented in `docs/system-boundary.md` and `docs/Architecture.md`.