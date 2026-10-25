# Appointment and Class Scheduling System - Requirements Specification (Sprint 1)

## 1. Project Proposal and Problem Definition

### 1.1 Project Title
Appointment and Class Scheduling System

### 1.2 Problem Definition
Nowadays, instructors and students mostly handle private lesson scheduling via instant messaging applications (WhatsApp, Telegram, etc.) and phone calls. This situation leads to:
- Continuous messaging traffic and substantial operational loss of time,
- Double-bookings resulting from human error in manually kept agendas,
- Loss of data and confusion regarding lesson cancellations, rescheduling, and tracking past lessons.

### 1.3 Proposed Solution
The system to be developed is an appointment management platform that brings together Admin, Instructor, and Student roles within a centralized platform. The system enables instructors to enter their availability schedules into the system, allows students to instantly create appointments by viewing these available slots, and ensures the entire flow is automatically managed according to defined business rules.

### 1.4 Open Source License Selection
This project is developed under the **MIT License** in accordance with open-source engineering standards. The MIT License is preferred because it is lightweight, flexible, and allows the software to integrate with its dependencies without restrictive constraints.

---

## 2. System Vision Specification

### 2.1 Vision Statement
To provide a scalable and reliable scheduling infrastructure that eliminates loss of time and operational communication overhead, centralizes private lesson scheduling processes by offering secure role management (Admin, Instructor, Student) and a seamless calendar experience in its initial release.

### 2.2 Strategic Goals
- **Operational Efficiency:** To eliminate messaging traffic and reduce lesson scheduling time from minutes to seconds.
- **Data Reliability:** To prevent concurrent appointment conflicts (concurrency / double-booking) by 100% through system validations.
- **Role-Oriented Experience:**
  - **Admin:** Must be able to manage user accounts and pairings centrally.
  - **Instructor:** Must be able to define clear and dynamic availability intervals on their calendar that do not allow past dates.
  - **Student:** Must be able to view only the available slots of the assigned instructor and book an appointment quickly.

---

## 3. System Boundary Specification

This section defines the components to be included in the initial release (MVP) of the system and the out-of-scope features deferred to subsequent versions.

### 3.1 In-Scope (Version 1 / MVP)
- **User and Role Management:**
  - Definition of Admin, Instructor, and Student roles in the system.
  - Creation of new users by the Admin (prevention of duplicate registration with the same email).
  - Assignment/association of a student with an authorized instructor by the Admin.
- **Calendar and Availability Management:**
  - Instructors entering forward-looking available lesson hours into the system.
  - Rejection of availability entry for past dates or hours via validation.
- **Appointment and Booking Flow:**
  - Students filtering and listing the available hours of their assigned instructor.
  - Students creating an appointment request for an available slot (`201 Created`).
  - Prevention of booking an already booked or occupied slot via a conflict error (`409 Conflict`).

### 3.2 Out-of-Scope / Deferred Features
The following features are excluded from the initial release to limit complexity:
- Instant notification delivery via WhatsApp / SMS (in-platform status codes and UI notifications will be used in the first phase).
- Lesson package/balance purchasing and financial payment integrations.
- Live video lesson environment (video conference links will be provided through external tools).
- Past lesson notes, homework upload, and file sharing module.

---

## 4. Initial Product Backlog

This backlog contains Sprint 1 development goals, user stories, acceptance criteria, and story points.

| Priority | ID | User Story | Acceptance Criteria | Estimate (Story Point) |
| :---: | :---: | :--- | :--- | :---: |
| **1** | **US-01** | As an **Admin**, I want to add new instructors and students to the system so that I can manage authorized users. | • User can be created with valid credentials.<br>• Re-registration attempts with an email already registered in the system must be rejected and return an error. | **5** |
| **2** | **US-02** | As an **Admin**, I want to assign a student to a specific instructor so that I can establish authorization for taking lessons. | • The assignment operation must be successfully persisted and associated in the database.<br>• An error must be thrown for unauthorized or nonexistent user assignment attempts. | **3** |
| **3** | **US-03** | As an **Instructor**, I want to add my available teaching hours to the system so that my students can book appointments with me. | • Valid future time slots must be successfully added to the calendar.<br>• Attempts to add availability to a past date or time must yield a validation error. | **5** |
| **4** | **US-04** | As a **Student**, I want to view the available lesson hours of my assigned instructor so that I can plan an appointment for a suitable time. | • If the instructor has no availability, the calendar should return empty or inform the user.<br>• Boundary date and time filtering must function accurately. | **3** |
| **5** | **US-05** | As a **Student**, I want to book an appointment for an available slot of my instructor so that I can complete my lesson reservation. | • Successful booking requests must return a `201 Created` status.<br>• A conflict error (`409 Conflict`) must be returned if a request is made for an occupied slot or one already booked by another student. | **8** |

### 4.1 Notation and Traceability Note
- All stories are designed to be directly mapped to RESTful API endpoints and C4 models.
- Story Point estimates were determined in a team planning session by considering effort and technical risks.