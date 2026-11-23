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

### Sprint 2 RACI Matrix (Requirements & Architecture)

| Sprint 2 Deliverable | Miraç (PO) | Eren (Architect) | Furkan (Implementation) | Nida (Scrum Master) | Merve (QA) | Kağan (DevOps) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Software Requirements Specification & Refined Backlog** | R/A | C | I | C | C | I |
| **C4 Architecture Models & ADRs** | I | R/A | C | I | I | C |
| **UML Sequence & Domain/Class Diagrams** | C | A | R | I | I | I |
| **Non-Functional Requirements & Quality Measures** | C | C | I | I | R/A | C |
| **Figma UI/UX Prototypes & User-Flow Diagrams** | C | C | C | R/A | I | I |
| **Deployment Diagram & CI Extension** | I | C | I | I | I | R/A |
| **Sprint Tracking, RACI & Retrospective** | C | I | I | R/A | C | I |
| **Sprint 2 Release & Tag** | I | C | I | C | I | R/A |

### Sprint 3 RACI Matrix (MVP & CI/CD)

| Sprint 3 Deliverable | Miraç (PO) | Eren (Architect) | Furkan (Implementation) | Nida (Scrum Master) | Merve (QA) | Kağan (DevOps) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Sprint 3 Board, Planning & Task Tracking** | C | C | I | R/A | I | I |
| **Frontend Skeleton (React + Vite + Tailwind)** | I | C | I | R/A | I | C |
| **GitHub Actions CI Pipeline (Tests & Coverage)** | I | C | I | I | C | R/A |
| **Jest Coverage Threshold (≥ 50%) & Test Report** | I | C | C | I | R/A | C |
| **Backend Core: Auth, Users, Assignments & Seed Script** | I | A | R | I | C | I |
| **Availability Routes & Atomic Booking Engine** | I | R/A | C | I | C | I |
| **docker-compose (Frontend + Backend + Firebase Emulator)** | I | C | C | I | I | R/A |
| **Frontend Screens 1–2 (Login, Admin)** | C | C | C | R/A | I | I |
| **Frontend Screens 3–4 (Instructor Calendar, Student Booking)** | R/A | C | C | C | I | I |
| **Concurrency Stress Test** | I | R/A | C | I | C | I |
| **Deployment (Vercel + Render / Cloud Run)** | I | C | I | I | I | R/A |
| **User Story Acceptance Testing** | R/A | I | I | C | C | I |
| **Stand-ups, RACI & Sprint 3 Retrospective** | C | I | I | R/A | C | I |
| **Individual Contributions (CONTRIBUTIONS.md)** | I | R/A | I | C | I | I |
| **Sprint 3 Release, Tag & Submission** | I | C | I | C | I | R/A |

### Legend
* **R (Responsible):** The person who actually does the work to complete the task.
* **A (Accountable):** The person who is ultimately answerable for the correct completion of the deliverable.
* **C (Consulted):** Those whose opinions are sought, typically subject matter experts (two-way communication).
* **I (Informed):** Those who are kept up-to-date on progress (one-way communication).