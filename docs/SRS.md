# Software Requirements Specification (SRS)
**Project:** Appointment and Class Scheduling System  
**Document Version:** 2.2 (Sprint 2)  
**Standard:** IEEE Std 830-1998  
**API Contract Reference:** `openapi.yaml` (`v0.3.0`)  
**Author:** Miraç Burak Esentürk (Product Owner & Requirements Engineer)   

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the detailed functional requirements, domain rules, external interfaces, and operational constraints for the **Appointment and Class Scheduling System**. It serves as the authoritative baseline for system architecture, UI/UX prototyping, backend implementation, and quality assurance verification during Sprint 2 and subsequent development phases.

### 1.2 Scope
The system provides a web-based scheduling platform connecting **Administrators**, **Instructors**, and **Students**:
* **Administrators** provision user accounts, list users by role, and establish exclusive **1-to-1** assignments between students and instructors.
* **Instructors** publish future availability time slots, view their own slots, and delete unbooked (`AVAILABLE`) slots.
* **Students** view exclusively the `AVAILABLE` time slots of their single assigned instructor and book appointments with strict concurrency protection.

**Out of Scope (Sprint 2):**
* Viewing historical or past appointment logs.
* Canceling or rescheduling confirmed appointments.
* Assigning multiple instructors to a single student simultaneously.

### 1.3 Definitions, Acronyms, and Abbreviations
* **RBAC:** Role-Based Access Control (`ADMIN`, `INSTRUCTOR`, `STUDENT`).
* **JWT:** JSON Web Token used for stateless authentication and role verification.
* **Availability Slot:** A discrete, future-dated time interval defined by an instructor (`AVAILABLE` or `BOOKED`).
* **Appointment Status:** Confirmed bookings are stored with status `SCHEDULED`.
* **Concurrency Conflict:** Simultaneous booking attempts by multiple students for the exact same availability slot, resolved via database transactions (`409 Conflict`).

### 1.4 References
* API Contract: `openapi.yaml` (`v0.3.0`)
* Product Backlog: `docs/product-backlog.md`
* System Boundary Document: `docs/system-boundary.md`
* Non-Functional Requirements & Quality Measures: `docs/NFR_Quality_Measures.md`
* Software Architecture Document (C4 & UML): `docs/Architecture.md`

---

## 2. Overall Description

### 2.1 Product Perspective
The system follows an **API-First**, three-tier cloud architecture:
1. **Frontend Client:** React-based single-page web application communicating strictly via RESTful JSON APIs.
2. **Backend API:** Node.js / Express server enforcing JWT authentication, role authorization, input validation, and business logic.
3. **Database:** Firebase Firestore providing ACID transactions to prevent double-booking race conditions.

### 2.2 User Classes and Characteristics
| Role | Identifier | Core Responsibilities & Permissions |
| :--- | :--- | :--- |
| **Administrator** | `ADMIN` | Creates user accounts (`ADMIN`, `INSTRUCTOR`, `STUDENT`), lists users by role, and assigns/updates each student's single instructor. |
| **Instructor** | `INSTRUCTOR` | Creates future availability slots, views their own slots, and deletes unbooked (`AVAILABLE`) slots. Cannot delete `BOOKED` slots. |
| **Student** | `STUDENT` | Views exclusively the `AVAILABLE` slots of their single assigned instructor and books an appointment (`SCHEDULED`). Cannot see `BOOKED` slots or other instructors. |

### 2.3 Operating Environment & Constraints
* All API requests (except `POST /auth/login`) require a valid `Authorization: Bearer <JWT>` header. Requests without a token or with an invalid/expired token shall return HTTP `401 Unauthorized`.
* All date-time values must adhere strictly to **ISO-8601** format (`YYYY-MM-DDTHH:mm:ssZ`).
* Each student can be assigned to **at most one active instructor** in v1.0; instructor reassignment is performed exclusively by an `ADMIN`.

---

## 3. Specific Requirements (Functional Requirements)

### 3.1 Authentication & Access Control Module

#### FR-00: User Login (`POST /auth/login`)
* **Description:** Authenticates a registered user and issues a signed JWT along with basic user identity metadata.
* **Inputs:** `email` (valid email format, required), `password` (string, required).
* **Business Rules:**
  1. The system shall verify the submitted credentials against the stored hashed password.
  2. Upon successful authentication, the system returns a signed JWT together with the user's `userId`, `name`, and `role` (`ADMIN`, `INSTRUCTOR`, or `STUDENT`) for client-side routing and session display.
* **Expected Responses:**
  * `200 OK`: Returns authentication payload containing `token`, `userId`, `name`, and `role`.
  * `400 Bad Request`: Missing or malformed `email` or `password`.
  * `401 Unauthorized`: Invalid email or password credentials.

#### FR-01: JWT Verification
* The system shall validate the Bearer JWT on every protected endpoint and extract `userId` and `role` claims from the token rather than trusting client-supplied payload IDs.
* If the `Authorization` header is missing, malformed, or expired, the system shall reject the request with HTTP `401 Unauthorized`.

#### FR-02: Role Enforcement
* If an authenticated user attempts to invoke an endpoint outside their assigned role (`ADMIN`, `INSTRUCTOR`, `STUDENT`), the system shall reject the request with HTTP `403 Forbidden`.

---

### 3.2 Administrator Module (`US-01`, `US-02`)

#### FR-03: User Provisioning (`POST /users` - Maps to `US-01`)
* **Description:** An authenticated Administrator creates a new user account in the system (Figma Screen 2a).
* **Inputs:** `name` (string, required), `email` (valid email format, unique, required), `password` (string, required, min 8 characters), `role` (enum: `ADMIN` | `INSTRUCTOR` | `STUDENT`, required).
* **Business Rules:**
  1. Only users with role `ADMIN` may execute this operation.
  2. Email addresses must be unique across the system.
  3. The `password` field is mandatory in alignment with `openapi.yaml` (`v0.3.0`) and Figma Screen 2a; it must be securely hashed before persistence and never returned in responses.
* **Expected Responses:**
  * `201 Created`: Returns created user metadata (`id`, `name`, `email`, `role`).
  * `400 Bad Request`: Missing required fields (`name`, `email`, `password`, `role`), invalid email format, weak password, or invalid role enum.
  * `401 Unauthorized`: Missing or invalid JWT.
  * `403 Forbidden`: Requester does not have `ADMIN` role.
  * `409 Conflict`: `EMAIL_ALREADY_EXISTS` - email address is already registered.

#### FR-09: List Users by Role (`GET /users` - Maps to `US-02`)
* **Description:** An authenticated Administrator retrieves a list of registered users, optionally filtered by role (`GET /users?role=INSTRUCTOR` or `GET /users?role=STUDENT`), to populate the Admin management and student-instructor assignment screens (Figma Screens 2a/2b).
* **Inputs:** `role` (query parameter, optional, enum: `ADMIN` | `INSTRUCTOR` | `STUDENT`).
* **Business Rules:**
  1. Only users with role `ADMIN` may list system users.
  2. Sensitive fields such as password hashes must never be included in the response.
* **Expected Responses:**
  * `200 OK`: Returns an array of user objects (`id`, `name`, `email`, `role`).
  * `400 Bad Request`: Invalid `role` query parameter value.
  * `401 Unauthorized`: Missing or invalid JWT.
  * `403 Forbidden`: Requester does not have `ADMIN` role.

#### FR-04: 1-to-1 Student-Instructor Assignment (`POST /assignments` - Maps to `US-02`)
* **Description:** An authenticated Administrator assigns a student to a single instructor (or replaces an existing assignment) via Figma Screen 2b.
* **Inputs:** `studentId` (string, required), `instructorId` (string, required).
* **Business Rules:**
  1. Only users with role `ADMIN` may execute this operation.
  2. Both `studentId` and `instructorId` must exist in the database and hold their respective roles (`STUDENT` and `INSTRUCTOR`).
  3. A student may hold only **one** active instructor assignment at any time. Submitting a new assignment for an already-assigned student updates/replaces the previous instructor link.
* **Expected Responses:**
  * `201 Created`: Returns the persisted assignment relation (`studentId`, `instructorId`).
  * `400 Bad Request`: Missing/malformed `studentId` or `instructorId`, or role mismatch (e.g., assigning a student to another student).
  * `401 Unauthorized`: Missing or invalid JWT.
  * `403 Forbidden`: Requester does not have `ADMIN` role.
  * `404 Not Found`: Either `studentId` or `instructorId` does not exist in the system.

---

### 3.3 Instructor Module (`US-03`)

#### FR-05: Publish Availability Slot (`POST /availability` - Maps to `US-03`)
* **Description:** An authenticated Instructor defines a new open time interval during which they are available for student appointments.
* **Inputs:** `startTime` (ISO-8601 timestamp, required), `endTime` (ISO-8601 timestamp, required).
* **Business Rules:**
  1. Only users with role `INSTRUCTOR` may create availability slots.
  2. `startTime` must be strictly in the future relative to the server's current UTC timestamp.
  3. `endTime` must be strictly greater than `startTime`.
  4. The new slot must not overlap with an existing slot belonging to the same instructor.
  5. Newly created slots default to status `AVAILABLE`.
* **Expected Responses:**
  * `201 Created`: Returns created availability object (`id`, `instructorId`, `startTime`, `endTime`, `status: "AVAILABLE"`).
  * `400 Bad Request`: Past `startTime`, `endTime <= startTime`, invalid timestamp format, or overlapping slot interval.
  * `401 Unauthorized`: Missing or invalid JWT.
  * `403 Forbidden`: Requester does not have `INSTRUCTOR` role.

#### FR-06: Delete Unbooked Availability Slot (`DELETE /availability/{id}` - Maps to `US-03`)
* **Description:** An authenticated Instructor removes an open time slot they no longer wish to offer.
* **Business Rules:**
  1. Only the `INSTRUCTOR` who owns the slot (`id`) may delete it.
  2. Deletion is permitted **only** if the slot status is `AVAILABLE`.
  3. If a student has already booked the slot (`status == "BOOKED"`), direct deletion is prohibited to preserve appointment integrity.
* **Expected Responses:**
  * `204 No Content`: Slot successfully removed.
  * `401 Unauthorized`: Missing or invalid JWT.
  * `403 Forbidden`: Slot belongs to another instructor or requester is not an `INSTRUCTOR`.
  * `404 Not Found`: Availability `id` does not exist.
  * `409 Conflict`: Slot is already `BOOKED` and cannot be deleted.

---

### 3.4 Availability Query & Student Booking Module (`US-04`, `US-05`)

#### FR-07: View Availability Slots (`GET /availability` - Maps to `US-03`, `US-04`)
* **Description:** Retrieves availability time slots based on the authenticated user's role (`STUDENT` or `INSTRUCTOR`).
* **Inputs:** Optional query parameters `instructorId` (for `INSTRUCTOR` viewing their own slots), `from` (ISO-8601), `to` (ISO-8601).
* **Business Rules:**
  1. **Student Access (`STUDENT`):** The system resolves the student's **single assigned instructor** via their JWT `userId`.
     * If the student has **no assigned instructor**, the system shall reject the request with HTTP `403 Forbidden` (`INSTRUCTOR_NOT_ASSIGNED`).
     * If an instructor is assigned, the response shall include **only** future slots with `status == "AVAILABLE"` belonging to that assigned instructor. Slots already booked by other students (`status == "BOOKED"`) and slots belonging to unassigned instructors must be completely excluded for privacy.
  2. **Instructor Access (`INSTRUCTOR`):** An instructor may call `GET /availability?instructorId={id}` using their own ID to view all of their own created slots (`AVAILABLE` and `BOOKED`) in order to manage and delete unbooked slots. Querying another instructor's slots is forbidden (`403 Forbidden`).
  3. **Admin Access (`ADMIN`):** Not permitted to use this scheduling view (`403 Forbidden`).
* **Expected Responses:**
  * `200 OK`: Returns an array of availability objects (`id`, `instructorId`, `startTime`, `endTime`, `status`). Returns an empty array `[]` if the assigned instructor has no matching open slots.
  * `401 Unauthorized`: Missing or invalid JWT.
  * `403 Forbidden`: `INSTRUCTOR_NOT_ASSIGNED` (student has no assigned instructor), or requester is an `ADMIN`, or an `INSTRUCTOR` attempting to view another instructor's slots.

#### FR-08: Book Appointment with Concurrency Control (`POST /appointments` - Maps to `US-05`)
* **Description:** An authenticated Student books one of the available slots offered by their assigned instructor.
* **Inputs:** `availabilityId` (string, required).
* **Business Rules:**
  1. Only users with role `STUDENT` may book appointments.
  2. The target `availabilityId` must belong to the student's **currently assigned instructor**.
  3. The booking operation must execute inside an **atomic database transaction (Firestore Transaction)**:
     * Verify `availability.status == "AVAILABLE"`.
     * Atomically update `availability.status` to `"BOOKED"` and create the appointment record with `status: "SCHEDULED"`.
  4. If two students attempt to book the same slot concurrently, exactly one transaction shall succeed (`201 Created`) and the second shall fail (`409 Conflict`).
* **Expected Responses:**
  * `201 Created`: Returns confirmed appointment details (`id`, `availabilityId`, `studentId`, `status: "SCHEDULED"`).
  * `400 Bad Request`: Missing or malformed `availabilityId`.
  * `401 Unauthorized`: Missing or invalid JWT.
  * `403 Forbidden`: Requester is not a `STUDENT` or the slot belongs to an instructor not assigned to this student.
  * `404 Not Found`: `availabilityId` does not exist.
  * `409 Conflict`: `SLOT_UNAVAILABLE` - the slot was already booked by another student.

---

## 4. External Interface Requirements

### 4.1 User Interfaces (Figma Prototypes)
UI/UX screens are maintained in the team Figma workspace (`docs/UI_UX_Specification.md`) and strictly reflect the functional scope above:
1. **Login Screen (Screen 1):** Role-based authentication (`POST /auth/login`) returning `token`, `userId`, `name`, and `role` for redirection.
2. **Admin User Management & Assignment Dashboard (Screens 2a/2b):**
   * **Screen 2a (User Provisioning):** User creation form requiring `name`, `email`, `password`, and `role` (`POST /users`).
   * **Screen 2b (1-to-1 Assignment):** Student-Instructor assignment panel populated via `GET /users?role=INSTRUCTOR` and `GET /users?role=STUDENT` (`POST /assignments`).
3. **Instructor Calendar View (Screen 3):** Future slot creation form and list of own slots (`GET /availability?instructorId={id}`) with delete action enabled only for `AVAILABLE` slots.
4. **Student Booking View (Screen 4):** Displays exclusively the single assigned instructor's `AVAILABLE` slots with one-click booking, instant conflict feedback (`409`), and an unassigned state alert if `403 INSTRUCTOR_NOT_ASSIGNED` is returned.

### 4.2 Software & API Interfaces
All client-server communication conforms strictly to `openapi.yaml` (`v0.3.0`) using JSON payloads over HTTPS (`Content-Type: application/json`).

---

## 5. Traceability Matrix (User Story to SRS)

| User Story | Title | Mapped Functional Requirements | Primary Role |
| :--- | :--- | :--- | :--- |
| **Auth** | System Authentication & Access Control | `FR-00`, `FR-01`, `FR-02` | All Roles |
| **US-01** | Admin User Provisioning | `FR-01`, `FR-02`, `FR-03` | `ADMIN` |
| **US-02** | Admin 1-to-1 Student-Instructor Assignment | `FR-01`, `FR-02`, `FR-04`, `FR-09` | `ADMIN` |
| **US-03** | Instructor Availability Publishing & Slot Deletion | `FR-01`, `FR-02`, `FR-05`, `FR-06`, `FR-07` | `INSTRUCTOR` |
| **US-04** | Student View Assigned Instructor Availability | `FR-01`, `FR-02`, `FR-07` | `STUDENT` |
| **US-05** | Student Appointment Booking (Concurrency-Safe) | `FR-01`, `FR-02`, `FR-08` | `STUDENT` |