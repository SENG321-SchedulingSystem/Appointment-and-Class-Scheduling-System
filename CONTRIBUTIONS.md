# Individual Contributions & Traceability Report
## SENG 321 / BM 321 Software Engineering Project — Team 4

**Project Name:** Appointment and Class Scheduling System  
**Academic Semester:** Fall 2026  
**Institution:** Ankara Science University — Department of Computer Engineering  
**Releases:** [`sprint-1`](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/releases/tag/sprint-1) | `sprint-2`  

This document serves as the formal individual contributions record for **Team 4**, documenting each member's student information, assigned engineering roles, completed deliverables, and verifiable audit trails across GitHub Issues, Pull Requests, Commits, and Peer Reviews across **Sprint 1** and **Sprint 2**.

---

# Part 1: Sprint 2 Individual Contributions (Requirements & Architecture)

## Sprint 2 Member Contribution Profiles

### 1. Miraç Burak Esentürk
- **Student ID:** 230205001
- **GitHub Username:** [@mburakesenturk](https://github.com/mburakesenturk)
- **Assigned Role (Sprint 2):** Product Owner & Requirements Engineer
- **Primary Responsibilities:**
  - Authored the IEEE Std 830-1998 compliant Software Requirements Specification ([`docs/SRS.md`](docs/SRS.md)) defining functional requirements (FR-01 to FR-08), domain rules, external interfaces, and operational constraints.
  - Refined the Product Backlog ([`docs/product-backlog.md`](docs/product-backlog.md)) for stories US-01 through US-05 with Given-When-Then acceptance criteria, story point estimates (Fibonacci scale), dependencies, and sub-tasks.
  - Documented Sprint 2 Retrospective and Scrum ceremonies ([`docs/sprint-2-retrospective.md`](docs/sprint-2-retrospective.md)).
  - Ensured requirements alignment with OpenAPI v0.3.0 and Sprint 2 scope decisions (1-to-1 instructor assignment, unbooked slot deletion, privacy-filtered availability).
- **Assigned & Authored Issues (Sprint 2):**
  - [Issue #60](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/60): `[Requirements]: Detailed SRS and Refined Product Backlog` (Author & Assignee)
  - [Issue #72](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/72): `[Scrum]: Sprint 2 Retrospective and Scrum Ceremonies` (Author & Assignee)
- **Pull Requests (Authored & Merged in Sprint 2):**
  - [PR #61](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/61): `docs: add Sprint 2 SRS and refined product backlog`
  - [PR #73](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/73): `docs(scrum): add Sprint 2 retrospective and scrum ceremonies`
- **Peer Review Activity (Sprint 2):** Reviewed and approved PR #57, #67.

---

### 2. Eren Okat
- **Student ID:** 230204008
- **GitHub Username:** [@erenokt3](https://github.com/erenokt3)
- **Assigned Role (Sprint 2):** Lead Software Architect & Technical Lead
- **Primary Responsibilities:**
  - Authored the official Software Architecture Document ([`docs/Architecture.md`](docs/Architecture.md)) establishing C4 Level 1 (System Context), C4 Level 2 (Container), and C4 Level 3 (Component) models.
  - Formulated 4 Architectural Decision Records: ADR-01 (Contract-First), ADR-02 (Tech Stack & Node 22 Containerization), ADR-03 (Firestore Concurrency Engine), and ADR-04 (Stateless JWT Auth & Claims Derivation).
  - Modeled the Distributed Atomic Read-Modify-Write Concurrency Sequence preventing race conditions via Firestore transactions (`409 Conflict: SLOT_UNAVAILABLE`).
  - Specified Docker multi-container packaging targets and Firebase Local Emulator Suite integration for offline zero-credential grading (`docker compose up`).
  - Upgraded the API contract ([`openapi.yaml`](openapi.yaml)) to v0.3.0 (`GET /users`, `DELETE /availability/{id}`, slot status, login response `userId`).
  - Upgraded runtime target to Node.js 22 LTS across architecture, containers, and GitHub Actions CI.
- **Assigned & Authored Issues (Sprint 2):**
  - [Issue #52](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/52): `[Architecture]: Software Architecture Documentation (C4 Models, ADRs, Concurrency Flow)` (Author & Assignee)
  - [Issue #58](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/58): `[Architecture]: Specify Docker containerization and Firebase Local Emulator for demo evaluation` (Author & Assignee)
  - [Issue #62](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/62): `[API Contract]: Add user listing, slot deletion, and instructor self-availability query (openapi.yaml v0.3.0)` (Author & Assignee)
  - [Issue #68](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/68): `[Architecture]: Upgrade Node.js runtime target to Node 22 LTS (docs/Architecture.md)` (Author & Assignee)
  - [Issue #81](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/81): `[Architecture]: Align API Contract version (v0.3.0) and C4 Component Router endpoints (docs/Architecture.md)` (Author & Assignee)
  - [Issue #83](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/83): `[Docs]: Add Sprint 2 Individual Contributions & Traceability Report (CONTRIBUTIONS.md)` (Author & Assignee)
- **Pull Requests (Authored & Merged in Sprint 2):**
  - [PR #51](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/51): `Architecture: Add C4 models, concurrency sequence, and ADRs (docs/Architecture.md)`
  - [PR #59](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/59): `Architecture: Specify Docker containerization targets and Firebase Local Emulator (docs/Architecture.md)`
  - [PR #63](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/63): `API Contract: Add user listing, slot deletion, and instructor self-query (v0.3.0)`
  - [PR #69](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/69): `Architecture: Upgrade Node.js runtime target to Node 22 LTS (docs/Architecture.md)`
  - [PR #82](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/82): `Architecture: Align API Contract reference (v0.3.0) and C4 Component routes (docs/Architecture.md)`
- **Peer Review Activity (Sprint 2):** Reviewed and approved PR #54, #57, #65, #67, #70, #71.

---

### 3. Furkan Çelebi
- **Student ID:** 230204301
- **GitHub Username:** [@furkancelebi06](https://github.com/furkancelebi06)
- **Assigned Role (Sprint 2):** Implementation & Integration Engineer
- **Primary Responsibilities:**
  - Authored UML Dynamic Behaviour and Domain Model ([`docs/UML_Diagrams.md`](docs/UML_Diagrams.md)) containing Sequence 1 (Double-booking prevention), Sequence 2 (Availability publishing), Sequence 3 (Admin pairing & JWT authorization), and Domain/Class diagram.
  - Implemented the complete Express 5 and Firebase Admin SDK backend application skeleton ([`backend/`](backend/)) targeting Node.js 22 LTS (`node:22-alpine`).
  - Created modular routing, global RFC 7807 error handling (`application/problem+json`), JWT verification middleware, and role guards for all OpenAPI endpoints.
  - Developed and verified 32 automated unit and integration tests (32/32 passing) covering health checks, token validation, role boundaries, and Firestore transactions.
  - Configured `backend/Dockerfile`, `backend/firebase.json` emulator setup, and `.env.example`.
- **Assigned & Authored Issues (Sprint 2):**
  - [Issue #66](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/66): `[Design]: UML Sequence & Domain/Class Diagrams and Backend Skeleton` (Author & Assignee)
- **Pull Requests (Authored & Merged in Sprint 2):**
  - [PR #67](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/67): `Design & Backend: UML sequence/domain diagrams and Express + Firebase skeleton`
- **Peer Review Activity (Sprint 2):** Reviewed and approved PR #69, #71.

---

### 4. Ayşe Nida Yalçınkaya
- **Student ID:** 230204063
- **GitHub Username:** [@anykaya06-cloud](https://github.com/anykaya06-cloud)
- **Assigned Role (Sprint 2):** Scrum Master & UI/UX Designer
- **Primary Responsibilities:**
  - Established Sprint 2 team governance and authored the Sprint 2 RACI Matrix ([`docs/RACI_Matrix.md`](docs/RACI_Matrix.md)).
  - Designed high-fidelity Figma UI/UX Prototypes and authored the UI/UX Specification ([`docs/UI_UX_Specification.md`](docs/UI_UX_Specification.md)): Screen 1 (Login & auth error states), Screen 2 (Admin user creation & student assignment), Screen 3 (Instructor availability declaration, error states, and mobile view), Screen 4 (Student calendar booking, confirmation, slot conflict modal, and mobile view).
  - Exported and integrated 13 high-resolution screen assets ([`docs/ui/*.png`](docs/ui/)) into repository documentation.
  - Mapped UI user flows, input validations, and error states directly to OpenAPI v0.3.0 schemas and RFC 7807 problem details.
  - Coordinated sprint reviews, tracked issue lifecycle on GitHub Projects, and merged architectural pull requests.
- **Assigned & Authored Issues (Sprint 2):**
  - [Issue #53](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/53): `[Scrum] Sprint 2 Planning, User Story Allocations, and RACI Matrix` (Author & Assignee)
  - [Issue #55](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/55): `[Design] Figma UI/UX Prototypes and User-Flow Diagrams` (Author & Assignee)
- **Pull Requests (Authored & Merged in Sprint 2):**
  - [PR #54](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/54): `docs(raci): Add Sprint 2 responsibility matrix`
  - [PR #71](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/71): `docs(ui): UI/UX specification and Figma design mapping`
- **Peer Review Activity (Sprint 2):** Reviewed and merged PR #51, #59, #63.

---

### 5. Merve Öksüz
- **Student ID:** 230204051
- **GitHub Username:** [@MRVMerve](https://github.com/MRVMerve)
- **Assigned Role (Sprint 2):** QA & Test Automation Engineer
- **Primary Responsibilities:**
  - Authored the Non-Functional Requirements and Quality Measures specification ([`docs/NFR_Quality_Measures.md`](docs/NFR_Quality_Measures.md)) defining measurable quality targets (NFR-P1 to NFR-M3) and quality measures (QM-01 to QM-09).
  - Formulated the Story-to-NFR Traceability Matrix mapping user stories US-01 through US-05 to operational constraints.
  - Updated Quality Assurance Strategy ([`docs/QA_Strategy.md`](docs/QA_Strategy.md)) aligning with `openapi.yaml` v0.3.0 and UI screens, achieving 100% status code traceability.
  - Defined defect management protocols and severity grading rules using GitHub Issues.
- **Assigned & Authored Issues (Sprint 2):**
  - [Issue #64](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/64): `[QA]: Non-Functional Requirements and Quality Measures` (Author & Assignee)
  - [Issue #77](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/77): `[QA]: Align QA Strategy and NFRs with OpenAPI v0.3.0 and UI screens` (Author & Assignee)
- **Pull Requests (Authored & Merged in Sprint 2):**
  - [PR #65](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/65): `docs: add NFR and quality measures (#64)`
  - [PR #78](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/78): `docs: update QA traceability for v0.3.0 and UI screens`
  - [PR #80](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/80): `docs: align NFR screen references with UI/UX specification`
- **Peer Review Activity (Sprint 2):** Reviewed and approved PR #61, #67.

---

### 6. Şükrü Kağan Demir
- **Student ID:** 230201027
- **GitHub Username:** [@kagandemir03](https://github.com/kagandemir03)
- **Assigned Role (Sprint 2):** DevOps & CI/CD Infrastructure Engineer
- **Primary Responsibilities:**
  - Authored C4 Level 4 Deployment Architecture ([`docs/Deployment_Architecture.md`](docs/Deployment_Architecture.md)) including Mermaid deployment topology diagram and Environment Isolation Matrix (Local Development, Staging/QA, Production).
  - Configured automated documentation and YAML validation Continuous Integration workflow ([`.github/workflows/docs-validation.yml`](.github/workflows/docs-validation.yml)) and markdownlint rules ([`.markdownlint.json`](.markdownlint.json)).
  - Authored Git Workflow governance specification ([`docs/Git_Workflow.md`](docs/Git_Workflow.md)) and Sprint 2 Release Notes ([`docs/Sprint_2_Release_Notes.md`](docs/Sprint_2_Release_Notes.md)).
  - Maintained repository [`README.md`](README.md) with comprehensive Sprint 2 documentation map and workflow status.
- **Assigned & Authored Issues (Sprint 2):**
  - [Issue #56](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/56): `[DevOps]: Deployment Architecture and CI Validation` (Author & Assignee)
  - [Issue #74](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/74): `[Docs]: Update README documentation map and Git-Flow rules for Sprint 2` (Author & Assignee)
- **Pull Requests (Authored & Merged in Sprint 2):**
  - [PR #57](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/57): `Docs & CI: Add C4 deployment architecture and automated docs validation`
  - [PR #70](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/70): `DevOps: Align C4 Deployment Architecture with local Docker environment`
  - [PR #76](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/76): `docs(readme): add Sprint 2 documentation map and status`
- **Peer Review Activity (Sprint 2):** Reviewed and approved PR #61, #67.

---

## Sprint 2 Contribution Summary Matrix

| Member | Student ID | Sprint 2 Role | Pull Requests Authored (Merged) | Issues Authored / Assigned | Key Sprint 2 Deliverables |
|:---|:---:|:---|:---:|:---:|:---|
| **Miraç Burak Esentürk** | 230205001 | Product Owner & Requirements | #61, #73 | #60, #72 | `docs/SRS.md`, `docs/product-backlog.md`, `docs/sprint-2-retrospective.md` |
| **Eren Okat** | 230204008 | Lead Software Architect | #51, #59, #63, #69, #82 | #52, #58, #62, #68, #81, #83 | `docs/Architecture.md` (C4 L1-L3, ADR 1-4, Concurrency Flow), `openapi.yaml` (v0.3.0), Node 22 Upgrade |
| **Furkan Çelebi** | 230204301 | Implementation & Integration | #67 | #66 | `docs/UML_Diagrams.md`, `backend/` (Express 5 + Firebase Admin, Node 22, 32 Tests, Dockerfile) |
| **Ayşe Nida Yalçınkaya** | 230204063 | Scrum Master & UI/UX | #54, #71 | #53, #55 | `docs/RACI_Matrix.md`, `docs/UI_UX_Specification.md`, 13 Figma Screen Assets (`docs/ui/*.png`) |
| **Merve Öksüz** | 230204051 | QA & Test Automation | #65, #78, #80 | #64, #77 | `docs/NFR_Quality_Measures.md`, `docs/QA_Strategy.md` (v0.3.0 Traceability Matrix) |
| **Şükrü Kağan Demir** | 230201027 | DevOps & CI/CD | #57, #70, #76 | #56, #74 | `docs/Deployment_Architecture.md` (C4 L4), `.github/workflows/docs-validation.yml`, `README.md` Map |

---

# Part 2: Sprint 1 Individual Contributions Archive

## Sprint 1 Member Contribution Profiles

### 1. Miraç Burak Esentürk
- **Student ID:** 230205001
- **GitHub Username:** [@mburakesenturk](https://github.com/mburakesenturk)
- **Assigned Role (Sprint 1):** Product Owner & Requirements Engineer
- **Assigned & Authored Issues:** [Issue #18](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/18), [Issue #19](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/19), [Issue #20](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/20), [Issue #21](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/21), [Issue #22](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/22), [Issue #23](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/23)
- **Pull Requests (Authored & Merged):** [PR #17](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/17), [PR #33](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/33)
- **Peer Review Activity:** Reviewed and approved PR #42 (Sprint 1 Release).

### 2. Eren Okat
- **Student ID:** 230204008
- **GitHub Username:** [@erenokt3](https://github.com/erenokt3)
- **Assigned Role (Sprint 1):** Lead Software Architect & Technical Lead
- **Assigned & Authored Issues:** [Issue #12](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/12), [Issue #25](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/25), [Issue #30](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/30), [Issue #44](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/44)
- **Pull Requests (Authored & Merged):** [PR #5](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/5), [PR #11](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/11), [PR #26](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/26), [PR #31](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/31), [PR #45](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/45), [PR #46](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/46)
- **Peer Review Activity:** Reviewed and approved PR #9, #28, #29, #33, #34, #37, #43, #47.

### 3. Furkan Çelebi
- **Student ID:** 230204301
- **GitHub Username:** [@furkancelebi06](https://github.com/furkancelebi06)
- **Assigned Role (Sprint 1):** Implementation & Integration Engineer
- **Assigned & Authored Issues:** [Issue #8](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/8), [Issue #13](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/13)
- **Pull Requests (Authored & Merged):** [PR #9](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/9), [PR #14](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/14), [PR #37](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/37)
- **Peer Review Activity:** Reviewed and approved PR #1, #7, #15, #16, #31, #33, #36, #39, #41.

### 4. Ayşe Nida Yalçınkaya
- **Student ID:** 230204063
- **GitHub Username:** [@anykaya06-cloud](https://github.com/anykaya06-cloud)
- **Assigned Role (Sprint 1):** Scrum Master & Agile Process Coach
- **Assigned & Authored Issues:** [Issue #24](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/24), [Issue #32](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/32)
- **Pull Requests (Authored & Merged):** [PR #6](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/6), [PR #7](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/7), [PR #29](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/29), [PR #34](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/34)
- **Peer Review Activity:** Reviewed and approved PR #14, #17.

### 5. Merve Öksüz
- **Student ID:** 230204051
- **GitHub Username:** [@MRVMerve](https://github.com/MRVMerve)
- **Assigned Role (Sprint 1):** QA & Test Automation Engineer
- **Assigned & Authored Issues:** [Issue #27](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/27), [Issue #35](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/35)
- **Pull Requests (Authored & Merged):** [PR #28](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/28), [PR #36](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/36)
- **Peer Review Activity:** Reviewed and approved PR #11, #26.

### 6. Şükrü Kağan Demir
- **Student ID:** 230201027
- **GitHub Username:** [@kagandemir03](https://github.com/kagandemir03)
- **Assigned Role (Sprint 1):** DevOps & CI/CD Infrastructure Engineer
- **Assigned & Authored Issues:** [Issue #38](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/38)
- **Pull Requests (Authored & Merged):** [PR #1](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/1), [PR #15](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/15), [PR #16](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/16), [PR #39](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/39), [PR #41](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/41), [PR #42](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/42), [PR #43](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/43), [PR #47](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/47)
- **Peer Review Activity:** Reviewed and approved PR #5, #6, #14, #45, #46.

---

## Sprint 1 Contribution Summary Matrix

| Member | Student ID | Sprint 1 Role | Commits | Pull Requests Authored | Issues Authored / Assigned | Key Sprint 1 Artifacts |
|:---|:---:|:---|:---:|:---|:---:|:---|
| **Miraç Burak Esentürk** | 230205001 | Product Owner | 5 | #17, #33 | #18, #19, #20, #21, #22, #23 | `project-proposal.md`, `system-vision.md`, `product-backlog.md` |
| **Eren Okat** | 230204008 | Lead Architect | 16 | #5, #11, #26, #31, #45, #46 | #12, #25, #30, #44, US-03, US-05 | `openapi.yaml` (v0.2.1), `system-boundary.md` |
| **Furkan Çelebi** | 230204301 | Integration Eng. | 9 | #9, #14, #37 | #8, #13, US-01, US-02, US-04 | `API_Integration_Strategy.md`, Prism Validation (31 Tests) |
| **Ayşe Nida Yalçınkaya** | 230204063 | Scrum Master | 6 | #6, #7, #29, #34 | #24, #32 | `RACI_Matrix.md`, `sprint-1-retrospective.md`, Project Board |
| **Merve Öksüz** | 230204051 | QA Engineer | 5 | #28, #36 | #27, #35 | `QA_Strategy.md`, Traceability Matrix, RFC 7807 Cases |
| **Şükrü Kağan Demir** | 230201027 | DevOps Engineer | 17 | #1, #15, #16, #39, #41, #42, #43, #47 | #38 | CI Workflow, Branch Protection, Issue/PR Forms, Release `sprint-1` |
