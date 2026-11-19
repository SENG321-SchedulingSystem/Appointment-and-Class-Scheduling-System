# Software Requirements Specification (SRS)
**Project:** Appointment and Class Scheduling System  
**Document Version:** 2.0 (Sprint 2)  
**Standard:** IEEE Std 830-1998  
**API Contract Reference:** `openapi.yaml` (`v0.2.1`)  
**Author:** Miraç Burak Esentürk (Product Owner & Requirements Engineer)  
**Date:** November 19, 2026  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the detailed functional requirements, domain rules, external interfaces, and operational constraints for the **Appointment and Class Scheduling System**. It serves as the authoritative baseline for system architecture, UI/UX prototyping, backend implementation, and quality assurance verification during Sprint 2 and subsequent development phases.

### 1.2 Scope
The system provides a web-based scheduling platform connecting **Administrators**, **Instructors**, and **Students**:
* **Administrators** provision user accounts and establish exclusive **1-to-1** assignments between students and instructors.
* **Instructors** publish future availability time slots and delete unbooked (`available`) slots.
* **Students** view exclusively the `available` time slots of their single assigned instructor and book appointments with strict concurrency protection.

**Out of Scope (Sprint 2):**
* Viewing historical or past appointment logs.
* Canceling or rescheduling confirmed appointments.
* Assigning multiple instructors to a single student simultaneously.

### 1.3 Definitions, Acronyms, and Abbreviations
* **RBAC:** Role-Based Access Control (`admin`, `instructor`, `student`).
* **JWT:** JSON Web Token used for stateless authentication and role verification.
* **Slot:** A discrete, future-dated time interval defined by an instructor (`available` or `booked`).
* **Concurrency Conflict:** Simultaneous booking attempts by multiple students for the exact same availability slot, resolved via database transactions (`409 Conflict`).

### 1.4 References
* API Contract: `openapi.yaml` (`v0.2.1`)
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
| **Administrator** | `admin` | Creates user accounts (`admin`, `instructor`, `student`) and assigns/updates each student's single instructor. |
| **Instructor** | `instructor` | Creates future availability slots and deletes unbooked (`available`) slots. Cannot delete `booked` slots. |
| **Student** | `student` | Views exclusively the `available` slots of their single assigned instructor and books an appointment. Cannot see booked slots or other instructors. |

### 2.3 Operating Environment & Constraints
* All API requests (except login) require a valid `Authorization: Bearer <JWT>` header.
* All date-time values must adhere strictly to **ISO-8601** format (`YYYY-MM-DDTHH:mm:ssZ`).
* Each student can be assigned to **at most one active instructor** in v1.0; instructor reassignment is performed exclusively by an Administrator.

---

## 3. Specific Requirements (Functional Requirements)

### 3.1 Authentication & Access Control Module
* **FR-01 (JWT Verification):** The system shall validate the Bearer JWT on every protected endpoint and extract `userId` and `role` claims from the token rather than trusting client-supplied payload IDs.
* **FR-02 (Role Enforcement):** If an authenticated user attempts to invoke an endpoint outside their assigned role, the system shall reject the request with HTTP `403 Forbidden`.

---

### 3.2 Administrator Module (`US-01`, `US-02`)

#### FR-03: User Provisioning (`POST /users` — Maps to `US-01`)
* **Description:** An authenticated Administrator creates a new user account in the system.
* **Inputs:** `name` (string, required), `email` (valid email format, unique, required), `password` (string, min 8 characters, required), `role` (enum: `admin` | `instructor` | `student`, required).
* **Business Rules:**
  1. Only users with role `admin` may execute this operation.
  2. Email addresses must be unique across the system.
  3. Passwords must be securely hashed before persistence and never returned in responses.
* **Expected Responses:**
  * `201 Created`: Returns created user metadata (`id`, `name`, `email`, `role`).
  * `400 Bad Request`: Missing required fields, invalid email format, weak password, or duplicate email.
  * `403 Forbidden`: Requester does not have `admin` role.

#### FR-04: 1-to-1 Student-Instructor Assignment (`POST /assignments` — Maps to `US-02`)
* **Description:** An authenticated Administrator assigns a student to a single instructor (or updates an existing assignment).
* **Inputs:** `studentId` (string, required), `instructorId` (string, required).
* **Business Rules:**
  1. Only users with role `admin` may execute this operation.
  2. Both `studentId` and `instructorId` must exist in the database and hold their respective roles (`student` and `instructor`).
  3. A student may hold only **one** active instructor assignment at any time. Submitting a new assignment for an already-assigned student updates/replaces the previous instructor link.
* **Expected Responses:**
  * `201 Created` (or `200 OK` on update): Returns active assignment record (`assignmentId`, `studentId`, `instructorId`, `assignedAt`).
  * `400 Bad Request`: Missing/malformed `studentId` or `instructorId`, or role mismatch (e.g., assigning a student to another student).
  * `403 Forbidden`: Requester does not have `admin` role.
  * `404 Not Found`: Either `studentId` or `instructorId` does not exist in the system.

---

### 3.3 Instructor Module (`US-03`)

#### FR-05: Publish Availability Slot (`POST /availability` — Maps to `US-03`)
* **Description:** An authenticated Instructor defines a new open time interval during which they are available for student appointments.
* **Inputs:** `startTime` (ISO-8601 timestamp, required), `endTime` (ISO-8601 timestamp, required).
* **Business Rules:**
  1. Only users with role `instructor` may create availability slots.
  2. `startTime` must be strictly in the future relative to the server's current UTC timestamp.
  3. `endTime` must be strictly greater than `startTime`.
  4. The new slot must not overlap with an existing slot belonging to the same instructor.
  5. Newly created slots default to status `available`.
* **Expected Responses:**
  * `201 Created`: Returns created slot object (`slotId`, `instructorId`, `startTime`, `endTime`, `status: "available"`).
  * `400 Bad Request`: Past `startTime`, `endTime <= startTime`, invalid timestamp format, or overlapping slot interval.
  * `403 Forbidden`: Requester does not have `instructor` role.

#### FR-06: Delete Unbooked Availability Slot (`DELETE /availability/{slotId}`)
* **Description:** An authenticated Instructor removes an open time slot they no longer wish to offer.
* **Business Rules:**
  1. Only the instructor who owns the slot may delete it.
  2. Deletion is permitted **only** if the slot status is `available`.
  3. If a student has already booked the slot (`status == "booked"`), direct deletion is prohibited to preserve appointment integrity.
* **Expected Responses:**
  * `200 OK` / `204 No Content`: Slot successfully removed.
  * `403 Forbidden`: Slot belongs to another instructor or requester is not an `instructor`.
  * `404 Not Found`: Slot ID does not exist.
  * `409 Conflict`: Slot is already `booked` and cannot be deleted.

---

### 3.4 Student Module (`US-04`, `US-05`)

#### FR-07: View Assigned Instructor Availability (`GET /availability` — Maps to `US-04`)
* **Description:** An authenticated Student retrieves open time slots to schedule an appointment.
* **Business Rules:**
  1. Only users with role `student` may query student availability views.
  2. The system resolves the student's **single assigned instructor** via their JWT `userId`.
  3. The response shall include **only** future slots with `status == "available"` belonging to that assigned instructor.
  4. Slots already booked by other students (`status == "booked"`) and slots belonging to unassigned instructors must be completely excluded from the response for privacy and scope clarity.
* **Expected Responses:**
  * `200 OK`: Returns an array of `available` slot objects (`slotId`, `instructorId`, `startTime`, `endTime`). Returns an empty array `[]` if no open slots exist or no instructor is assigned yet.
  * `403 Forbidden`: Requester does not have `student` role.

#### FR-08: Book Appointment with Concurrency Control (`POST /appointments` — Maps to `US-05`)
* **Description:** An authenticated Student books one of the available slots offered by their assigned instructor.
* **Inputs:** `slotId` (string, required).
* **Business Rules:**
  1. Only users with role `student` may book appointments.
  2. The target `slotId` must belong to the student's **currently assigned instructor**.
  3. The booking operation must execute inside an **atomic database transaction (Firestore Transaction)**:
     * Verify `slot.status == "available"`.
     * Atomically update `slot.status` to `"booked"` and create the `appointment` record.
  4. If two students attempt to book the same slot concurrently, exactly one transaction shall succeed (`201 Created`) and the second shall fail (`409 Conflict`).
* **Expected Responses:**
  * `201 Created`: Returns confirmed appointment details (`appointmentId`, `slotId`, `studentId`, `instructorId`, `startTime`, `endTime`, `status: "confirmed"`).
  * `400 Bad Request`: Missing or malformed `slotId`.
  * `403 Forbidden`: Requester is not a `student` or the slot belongs to an instructor not assigned to this student.
  * `404 Not Found`: `slotId` does not exist.
  * `409 Conflict`: `SLOT_UNAVAILABLE` — the slot was already booked by another student.

---

## 4. External Interface Requirements

### 4.1 User Interfaces (Figma Prototypes)
UI/UX screens are maintained in the team Figma workspace (`docs/UI_UX_Specification.md`) and strictly reflect the functional scope above:
1. **Login Screen:** Role-based authentication and redirect.
2. **Admin Dashboard:** User creation form and 1-to-1 Student-Instructor assignment panel.
3. **Instructor Calendar View:** Future slot creation form and list of open slots with delete action enabled only for unbooked (`available`) slots.
4. **Student Booking View:** Displays exclusively the single assigned instructor's `available` slots with one-click booking and instant conflict feedback.

### 4.2 Software & API Interfaces
All client-server communication conforms strictly to `openapi.yaml` (`v0.2.1`) using JSON payloads over HTTPS (`Content-Type: application/json`).

---

## 5. Traceability Matrix (User Story to SRS)

| User Story | Title | Mapped Functional Requirements | Primary Role |
| :--- | :--- | :--- | :--- |
| **US-01** | Admin User Provisioning | `FR-01`, `FR-02`, `FR-03` | Administrator |
| **US-02** | Admin 1-to-1 Student-Instructor Assignment | `FR-01`, `FR-02`, `FR-04` | Administrator |
| **US-03** | Instructor Availability Publishing & Slot Deletion | `FR-01`, `FR-02`, `FR-05`, `FR-06` | Instructor |
| **US-04** | Student View Assigned Instructor Availability | `FR-01`, `FR-02`, `FR-07` | Student |
| **US-05** | Student Appointment Booking (Concurrency-Safe) | `FR-01`, `FR-02`, `FR-08` | Student |