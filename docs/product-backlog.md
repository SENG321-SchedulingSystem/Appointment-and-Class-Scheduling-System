# Initial Product Backlog

This backlog specifies the foundational functional requirements, user stories, acceptance criteria, effort estimates, dependencies, and assigned engineering owners for the Appointment and Class Scheduling System.

---

## 1. Epics & Feature Overview
The Sprint 1 product backlog is organized into two primary architectural epics:

- **Epic 1: Identity, User Provisioning & Authorization (US-01, US-02)**
  - Governs administrative user onboarding, role integrity, and pairing authorization rules.
- **Epic 2: Availability & Atomic Appointment Engine (US-03, US-04, US-05)**
  - Governs forward-looking calendar availability declarations, search filtering, and concurrent appointment reservation.

---

## 2. Product Backlog Matrix

| Priority | ID | Issue | Epic | User Story | Acceptance Criteria | Estimate (SP) | Dependencies | Assigned Owner |
| :---: | :---: | :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| **1** | **US-01** | #19 | Epic 1: Identity & Provisioning | As an **Admin**, I want to add new instructors and students to the system so that I can manage authorized users. | • User account is successfully created with valid parameters.<br>• Duplicate registrations with existing emails return `409 Conflict` (`EMAIL_ALREADY_EXISTS`). | **5** | None (Root Story) | Furkan Çelebi (@furkancelebi06) |
| **2** | **US-02** | #20 | Epic 1: Identity & Provisioning | As an **Admin**, I want to assign a student to a specific instructor so that I can establish authorization for taking lessons. | • The assignment relation is persisted in the database.<br>• Attempts with invalid, nonexistent, or unauthorized user IDs return `404 Not Found`. | **3** | US-01 | Furkan Çelebi (@furkancelebi06) |
| **3** | **US-03** | #21 | Epic 2: Availability & Booking | As an **Instructor**, I want to add my available teaching hours to the system so that my students can book appointments with me. | • Forward-looking time slots are added successfully returning `201 Created`.<br>• Slot entries for past dates or invalid chronological order return `400 Bad Request`. | **5** | US-01 | Eren Okat (@erenokt3) |
| **4** | **US-04** | #22 | Epic 2: Availability & Booking | As a **Student**, I want to view the available lesson hours of my assigned instructor so that I can plan an appointment for a suitable time. | • Returns an empty list or informational indicator if no slots exist.<br>• Boundary date/time query parameters (`from`, `to`) filter records deterministically. | **3** | US-02, US-03 | Furkan Çelebi (@furkancelebi06) |
| **5** | **US-05** | #23 | Epic 2: Availability & Booking | As a **Student**, I want to book an appointment for an available slot of my instructor so that I can complete my lesson reservation. | • Successful reservation locks the slot and returns `201 Created`.<br>• Race conditions or attempts on occupied slots return `409 Conflict` (`SLOT_UNAVAILABLE`) via atomic transactions. | **8** | US-02, US-03, US-04 | Eren Okat (@erenokt3) |

---

## 3. Estimation & Sizing Rationale
- **Fibonacci Scale:** Estimates represent relative effort, technical complexity, and architectural uncertainty rather than raw calendar hours.
- **High-Complexity Factor (US-05 - 8 SP):** Highest point allocation due to concurrent race condition mitigation, distributed database transactions (Firebase transactions), and atomicity guarantees under simultaneous requests.
- **Baseline Stories (US-02, US-04 - 3 SP):** Standard CRUD/query operations with deterministic relational checks.

---

## 4. Traceability & Engineering Alignment
- **API Contract Mapping:** Each user story maps 1:1 to operations in `openapi.yaml` (`POST /users`, `POST /assignments`, `POST /availability`, `GET /availability`, `POST /appointments`).
- **Quality Assurance:** Every acceptance criterion corresponds directly to automated Jest contract and integration test suites defined in `docs/QA_Strategy.md`.
- **Architectural Scope:** Aligns strictly with the system boundary and component definitions documented in `docs/system-boundary.md`.