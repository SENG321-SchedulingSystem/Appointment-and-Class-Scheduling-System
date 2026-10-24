# SENG 321 - Appointment and Class Scheduling System

SENG 321 Term Project: A centralized appointment and class scheduling system with role-based access for students and instructors.

## System Vision
For instructors, students, and administrators who need dependable coordination of lesson schedules, the Scheduling System provides current availability, consistent reservation rules, and traceable account management. The first release supports web users and exposes an API contract for implementation and testing.

## System Boundary

~~~mermaid
 graph TD
   Student[Student] -->|Books / Views appointments| Frontend(React Frontend)
   Instructor[Instructor] -->|Submits availability| Frontend
   Frontend -->|API Requests with JWT Token| Backend(Node.js / Express API)
   Backend -->|Read/Write Data| DB[(Firebase Database)]
~~~

**Inside the software responsibility:**
* Role-based user management (Admin, Instructor, Student).
* Instructor availability submission and calculation.
* Reservation creation, cancellation, and conflict prevention.

**Outside or deferred (Future Releases):**
* WhatsApp or SMS notification providers.
* Payment processing and fine management.
* Dynamic lesson package quota deductions.
* Historical lesson notes and physical attendance tracking.

# RACI Matrix - SENG 321 Appointment Scheduling System

This document defines the roles and responsibilities of the team members for Sprint 1 and the overall development lifecycle using the RACI framework.

### Team Roles
* **Miraç Burak Esentürk:** Product Owner (PO) & Requirements Engineer
* **Eren Okat:** Lead Software Architect & Technical Lead
* **Furkan Çelebi:** Implementation & Integration Engineer
* **Ayşe Nida Yalçınkaya:** Scrum Master & Agile Process Coach
* **Merve Öksüz:** QA & Test Automation Engineer
* **Şükrü Kağan Demir:** DevOps & CI/CD Infrastructure Engineer

### RACI Matrix

| Activity / Deliverable | Miraç (PO) | Eren (Architect) | Furkan (Implementation) | Nida (Scrum Master) | Merve (QA) | Kağan (DevOps) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Project Scope & Backlog Management** | R/A | C | I | C | I | I |
| **System Architecture & OpenAPI Design** | I | R/A | C | I | C | I |
| **Git-Flow Rules & CI/CD Pipeline** | I | C | I | I | I | R/A |
| **Acceptance Criteria & Test Scenarios** | C | I | I | C | R/A | I |
| **Core Code Implementation & Integration** | I | A | R | I | C | C |
| **Agile Process & Sprint Facilitation** | C | I | I | R/A | C | I |

### Legend
* **R (Responsible):** The person who actually does the work to complete the task.
* **A (Accountable):** The person who is ultimately answerable for the correct completion of the deliverable.
* **C (Consulted):** Those whose opinions are sought, typically subject matter experts (two-way communication).
* **I (Informed):** Those who are kept up-to-date on progress (one-way communication).

## Repository Workflow (Git-Flow)
* `main`: Contains assessed or released versions only (e.g., tagged `sprint-1`).
* `develop`: Integrates completed work intended for the next sprint release.
* `feature/*`: Short-lived branches for single user stories, technical tasks, or defects (e.g., `feature/US-05-create-appointment`).
* **Rules**: Direct pushes to `main` and `develop` are blocked. All changes require a Pull Request, at least one peer review, and passing automated checks before merging.

## Initial Product Backlog

| Priority | ID | User Story | Acceptance Criteria | Estimate |
| :--- | :--- | :--- | :--- | :--- |
| 1 | US-01 | **As an Admin**, I can create new instructor and student accounts to prevent unauthorized access. | Valid creation, invalid email format error, duplicate email rejection. | 5 |
| 2 | US-02 | **As an Admin**, I can assign a student to a specific instructor. | Successful assignment, 403 Forbidden on unauthorized attempt. | 3 |
| 3 | US-03 | **As an Instructor**, I can add my available days and time slots. | Successful addition, error on past date addition. | 5 |
| 4 | US-04 | **As a Student**, I can list the available time slots of my assigned instructor. | Returns empty or populated calendar, boundary time searches. | 3 |
| 5 | US-05 | **As a Student**, I can book an appointment for an available time slot. | 201 Created on success, 409 Conflict on double booking. | 8 |