# Project Proposal and Problem Definition

## 1. Project Title
Appointment and Class Scheduling System

---

## 2. Problem Statement & Supporting Evidence
Nowadays, instructors and students primarily coordinate private tutoring, office hours, and academic mentoring sessions via instant messaging platforms (WhatsApp, Telegram, etc.) and direct phone calls. Relying on unstructured communication channels introduces recurring operational failures:
- **High Operational Overhead & Lost Time:** Finding a mutually suitable time slot involves extensive back-and-forth messaging, causing unnecessary friction and delayed scheduling.
- **Double-Booking & Concurrency Conflicts:** Manually maintained calendars and paper agendas frequently lead to scheduling conflicts (double-bookings), especially when multiple students request the same slot simultaneously.
- **Lack of Authorization & Audit Trails:** Instructors often manage bookings without formal pairing or institutional oversight, leading to untracked cancellations, lost lesson history, and zero traceability.
- **Absence of Centralized Validation:** Manual booking processes fail to enforce core operational rules programmatically (e.g., preventing availability creation in the past or enforcing authorization boundaries).

---

## 3. Stakeholder Identification & Analysis
The proposed system directly engages three primary operational stakeholders and institutional supervisors:

| Stakeholder | Role / Description | Core Needs & Expectations | System Impact |
| :--- | :--- | :--- | :--- |
| **Admin** | System Operator & Coordinator | Centralized user provisioning, role assignments, and student-instructor pairing management. | Eliminates manual account handling and enforces verified academic pairings. |
| **Instructor** | Academic Tutor / Lecturer | Clear calendar visibility, intuitive availability slot declaration, and prevention of double-bookings. | Automates schedule sharing and guarantees zero past-dated or conflicting bookings. |
| **Student** | Learner / Mentee | Real-time visibility into assigned instructors' available hours and one-click conflict-free reservation. | Removes messaging delays and eliminates reservation uncertainty. |
| **Course Supervisors** | SENG 321 Instructors & Evaluators | Strict adherence to SE best practices (Git-Flow, C4, OpenAPI, CI/CD, traceability). | Transparent grading through versioned artifacts, contract testing, and clear role ownership. |

---

## 4. Proposed Solution & Expected Outcomes
The **Appointment and Class Scheduling System** provides a centralized, role-based platform built on an API-first architecture. The system automates the booking lifecycle through strict server-side validation and atomic concurrency controls.

### Key Expected Outcomes & Measurable Metrics
- **Zero Double-Bookings (100% Conflict Prevention):** Utilizing atomic database transactions (Firebase transactions) to guarantee that simultaneous requests for the same slot strictly resolve with one success (`201 Created`) and subsequent conflicts (`409 Conflict`).
- **Rapid Booking Lifecycle:** Reducing the average appointment scheduling cycle from several hours of intermittent messaging down to under **15 seconds** of end-to-end user interaction.
- **Contract-Driven Consistency:** 100% adherence to the OpenAPI 3.1.0 specification (`openapi.yaml`), ensuring deterministic schema validation and decoupled frontend-backend workflows.
- **Strict Role Boundaries:** Enforcing JWT-based authorization where students only access assigned instructors and cannot alter slot structures or impersonate peers.

---

## 5. Feasibility Assessment & Initial Project Scope
The project has been assessed across three core dimensions to confirm technical and operational viability within the academic semester:

- **Technical Feasibility:** The tech stack comprises proven, industry-standard technologies: **React** for a responsive single-page frontend, **Node.js/Express** for API routing and business logic execution, and **Firebase** as a managed document database offering atomic transaction guarantees. Mock servers (Prism) and automated linters (Redocly) ensure seamless development before full backend integration.
- **Operational & Schedule Feasibility:** The project follows Agile/Scrum methodologies with defined 2-to-3 week sprints. The initial MVP scope (US-01 to US-05) covers strictly fundamental scheduling mechanics, intentionally deferring non-critical features (payments, video streaming) to ensure on-time delivery.
- **Resource Feasibility:** The team consists of six distinct engineering roles (PO, Architect, Implementation, Scrum Master, QA, DevOps). All development utilizes free-tier and open-source tooling (GitHub Actions, Firebase Spark Plan, Jest, Prism), requiring zero infrastructure budget.

---

## 6. Assumptions & Potential Risks

| Category | Risk Description | Likelihood / Impact | Mitigation Strategy |
| :--- | :--- | :---: | :--- |
| **Concurrency** | Multiple students booking the exact same availability slot concurrently. | Medium / High | Implemented via database-level atomic transactions; server returns standard `409 SLOT_UNAVAILABLE` on race conditions. |
| **Authentication** | Unauthorized access or token tampering across role endpoints. | Low / High | Bearer JWT validation enforced globally on backend; student identity extracted directly from token claims rather than request payloads. |
| **Scope Creep** | Demands for real-time video conferencing, payment gateways, or multi-channel notifications. | High / Medium | Formalized System Boundary specification; out-of-scope items explicitly deferred to future release milestones. |
| **Integration** | Discrepancies between frontend expectations and backend implementations. | Medium / High | Strict API-First design; `openapi.yaml` acts as the single source of truth, verified by automated linting in CI. |

---

## 7. Open Source License Selection
This project is officially published and licensed under the **MIT License**.

### Rationale
The MIT License is chosen due to its permissive, lightweight structure. It grants unrestricted rights to use, modify, distribute, and integrate the codebase with external open-source libraries and services without imposing copyleft burdens. This aligns perfectly with academic project requirements and open software engineering collaboration standards.