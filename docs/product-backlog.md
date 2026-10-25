# Initial Product Backlog

This backlog contains Sprint 1 development goals, user stories, acceptance criteria, and story points.

| Priority | ID | User Story | Acceptance Criteria | Estimate (Story Point) |
| :---: | :---: | :--- | :--- | :---: |
| **1** | **US-01** | As an **Admin**, I want to add new instructors and students to the system so that I can manage authorized users. | • User can be created with valid credentials.<br>• Re-registration attempts with an email already registered in the system must be rejected and return an error. | **5** |
| **2** | **US-02** | As an **Admin**, I want to assign a student to a specific instructor so that I can establish authorization for taking lessons. | • The assignment operation must be successfully persisted and associated in the database.<br>• An error must be thrown for unauthorized or nonexistent user assignment attempts. | **3** |
| **3** | **US-03** | As an **Instructor**, I want to add my available teaching hours to the system so that my students can book appointments with me. | • Valid future time slots must be successfully added to the calendar.<br>• Attempts to add availability to a past date or time must yield a validation error. | **5** |
| **4** | **US-04** | As a **Student**, I want to view the available lesson hours of my assigned instructor so that I can plan an appointment for a suitable time. | • If the instructor has no availability, the calendar should return empty or inform the user.<br>• Boundary date and time filtering must function accurately. | **3** |
| **5** | **US-05** | As a **Student**, I want to book an appointment for an available slot of my instructor so that I can complete my lesson reservation. | • Successful booking requests must return a `201 Created` status.<br>• A conflict error (`409 Conflict`) must be returned if a request is made for an occupied slot or one already booked by another student. | **8** |

---

### Notation and Traceability Note
- All stories are designed to be directly mapped to RESTful API endpoints and C4 models.
- Story Point estimates were determined in a team planning session by considering effort and technical risks.