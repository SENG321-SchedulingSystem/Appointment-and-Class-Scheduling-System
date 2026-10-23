# SENG 321 - Appointment and Class Scheduling System

SENG 321 Term Project: A centralized appointment and class scheduling system with role-based access for students and instructors.

## System Vision
For instructors, students, and administrators who need dependable coordination of lesson schedules, the Scheduling System provides current availability, consistent reservation rules, and traceable account management. The first release supports web users and exposes an API contract for implementation and testing.

## System Boundary

~~~mermaid
flowchart LR
    Admin[Administrator] -->|Manages accounts and assigns roles| System[Scheduling System]
    Instructor[Instructor] -->|Submits availability intervals| System
    Student[Student] -->|Searches availability and requests reservations| System
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

## Team Roles & RACI Matrix

* **Miraç**: Product Owner and Requirements Engineer
* **Eren**: Lead Software Architect and Technical Lead
* **Furkan**: Implementation and Integration Engineer
* **Nida**: Scrum Master and Agile Process Coach
* **Merve**: Quality Assurance and Test Automation Engineer
* **Kağan**: DevOps and CI/CD Infrastructure Engineer

| Task / Deliverable | PO (Miraç) | Architect (Eren) | Developer (Furkan) | Scrum Master (Nida) | QA (Merve) | DevOps (Kağan) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Scope & Backlog Approval** | A | C | R | C | C | I |
| **OpenAPI & Architecture** | C | A | R | I | R | I |
| **Git-Flow & Repo Rules** | I | C | R | A | C | R |
| **Testing & Quality Approval**| C | R | R | R | A | C |

*(R: Responsible, A: Accountable, C: Consulted, I: Informed)*

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