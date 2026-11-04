# Individual Contributions & Traceability Report (Sprint 1)
## SENG 321 / BM 321 Software Engineering Project — Team 4

**Project Name:** Appointment and Class Scheduling System  
**Academic Semester:** Fall 2026  
**Institution:** Ankara Science University — Department of Computer Engineering  
**Official Release:** [`sprint-1`](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/releases/tag/sprint-1)  

This document serves as the formal individual contributions record for **Team 4**, documenting each member's student information, assigned engineering roles, completed deliverables, and verifiable audit trails across GitHub Issues, Pull Requests, and Commits.

---

## Member Contribution Profiles

### 1. Miraç Burak Esentürk
- **Student ID:** 230205001
- **GitHub Username:** [@mburakesenturk](https://github.com/mburakesenturk)
- **Assigned Role:** Product Owner & Requirements Engineer
- **Primary Responsibilities:**
  - Defining the overall project proposal, problem statement, quantitative metrics, and feasibility assessment.
  - Formulating the System Vision Statement and establishing strict MVP in-scope vs. deferred out-of-scope boundaries.
  - Creating and prioritizing the Initial Product Backlog with Epics, Features, User Stories, and Acceptance Criteria.
  - Defining Definition of Ready (DoR) and Definition of Done (DoD) standards.
- **Assigned & Authored Issues:**
  - [Issue #18](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/18): `[DOCS] Sprint 1: Project Proposal, Vision, Boundaries, and Initial Backlog` (Author & Assignee)
  - [Issue #19](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/19): `US-01: Admin user management (Add Instructors and Students)` (Author)
  - [Issue #20](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/20): `US-02: Admin student-instructor pairing and authorization` (Author)
  - [Issue #21](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/21): `US-03: Instructor calendar availability management` (Author)
  - [Issue #22](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/22): `US-04: Student viewing assigned instructor availability` (Author)
  - [Issue #23](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/23): `US-05: Student appointment booking with concurrency prevention` (Author)
- **Pull Requests (Authored & Merged):**
  - [PR #17](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/17): `docs: Sprint 1 - Core Requirements, Vision, and Initial Backlog`
  - [PR #33](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/33): `docs: enrich sprint 1 requirements, proposal, and product backlog`
- **Peer Review Activity:** Reviewed and approved PR #31 (OpenAPI Architecture v0.2.1) and PR #34 (Sprint 1 Retrospective).

---

### 2. Eren Okat
- **Student ID:** 230204008
- **GitHub Username:** [@erenokt3](https://github.com/erenokt3)
- **Assigned Role:** Lead Software Architect & Technical Lead
- **Primary Responsibilities:**
  - Designing the system architecture and leading the contract-first OpenAPI 3.1.0 specification design (`openapi.yaml`).
  - Standardizing HTTP status codes and RFC 7807 problem error response payloads (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`).
  - Aligning system boundary interactions across React frontend, Node.js backend, and Firebase document persistence.
  - Ensuring automated Redocly linting passes with zero errors and executing architectural code reviews.
- **Assigned & Authored Issues:**
  - [Issue #12](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/12): `Add OpenAPI Spec and Update System Architecture README` (Author)
  - [Issue #25](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/25): `Fix: QA Review Updates for US-01 and US-02 API Responses` (Author)
  - [Issue #30](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/30): `Architecture: Complete authorization and error responses in OpenAPI contract (v0.2.1)` (Author)
  - [Issue #44](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/44): `Chore: Translate CI workflow steps and gitignore comments to English` (Author)
  - Assigned User Stories: [US-03 (#21)](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/21) & [US-05 (#23)](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/23)
- **Pull Requests (Authored & Merged):**
  - [PR #2](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/2): `Revise README with project details and system vision`
  - [PR #3](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/3): `Add OpenAPI specification for Lesson Scheduling API`
  - [PR #5](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/5): `Add OpenAPI spec and update README`
  - [PR #10](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/10): `Feature/readme ve api`
  - [PR #11](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/11): `Fix: Update system boundary diagram to include Admin`
  - [PR #26](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/26): `Fix: Add 404 response and EMAIL_ALREADY_EXISTS code`
  - [PR #31](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/31): `Architecture: Complete authorization and error responses in OpenAPI contract (v0.2.1)`
  - [PR #45](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/45): `Chore: Translate workflow steps and gitignore comments to English`
  - [PR #46](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/46): `Chore: Clean up redundant comment lines in .gitignore`
- **Peer Review Activity:** Reviewed and approved PR #37 (Prism Mock Verification), PR #28 (QA Strategy), PR #16 (CI Pipeline), and PR #42 (Sprint 1 Release).

---

### 3. Furkan Çelebi
- **Student ID:** 230204301
- **GitHub Username:** [@furkancelebi06](https://github.com/furkancelebi06)
- **Assigned Role:** Implementation & Integration Engineer
- **Primary Responsibilities:**
  - Establishing the contract mocking environment using Stoplight Prism.
  - Authoring `docs/API_Integration_Strategy.md` detailing frontend consumption patterns and Axios interceptors.
  - Executing and validating all 31 mock test scenarios across auth, users, availability, and appointment booking.
  - Verifying error responses and RFC 7807 problem payloads against the mock server.
- **Assigned & Authored Issues:**
  - [Issue #8](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/8): `Document API integration strategy and verify mock server` (Author & Assignee)
  - [Issue #13](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/13): `Update API integration strategy for contract v0.2.0` (Author & Assignee)
  - Assigned User Stories: [US-01 (#19)](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/19), [US-02 (#20)](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/20), [US-04 (#22)](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/22)
- **Pull Requests (Authored & Merged):**
  - [PR #9](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/9): `Add API integration strategy and mock server evidence`
  - [PR #14](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/14): `Update API integration strategy for contract v0.2.0`
  - [PR #37](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/37): `docs(api): re-verify mock server against openapi v0.2.1`
- **Peer Review Activity:** Reviewed and approved PR #31 (OpenAPI Contract v0.2.1) and PR #33 (Requirements Refinement).

---

### 4. Ayşe Nida Yalçınkaya
- **Student ID:** 230204063
- **GitHub Username:** [@anykaya06-cloud](https://github.com/anykaya06-cloud)
- **Assigned Role:** Scrum Master & Agile Coach
- **Primary Responsibilities:**
  - Structuring team workflows, communication cadence, and agile operating practices.
  - Authoring `docs/RACI_Matrix.md` and establishing the full team RACI governance framework.
  - Organizing the GitHub Project Board ([Project #2](https://github.com/orgs/SENG321-SchedulingSystem/projects/2)) and tracking issue lifecycle.
  - Facilitating the Sprint 1 Retrospective meeting and compiling `docs/sprint-1-retrospective.md`.
- **Assigned & Authored Issues:**
  - [Issue #24](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/24): `Update README with documentation map and team rules` (Author & Assignee)
  - [Issue #32](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/32): `[Scrum] Sprint 1 Retrospective and Project Board Link` (Author & Assignee)
- **Pull Requests (Authored & Merged):**
  - [PR #4](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/4): `Add RACI Matrix for Sprint 1 roles and responsibilities`
  - [PR #6](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/6): `Add RACI matrix documentation`
  - [PR #7](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/7): `Add RACI matrix directly to README`
  - [PR #29](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/29): `docs: apply final review corrections for roles, vision, and Git-Flow`
  - [PR #34](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/34): `docs: add sprint 1 retrospective and link project board`
- **Peer Review Activity:** Reviewed and approved PR #17 (Core Requirements & Backlog) and PR #42 (Sprint 1 Release).

---

### 5. Merve Öksüz
- **Student ID:** 230204051
- **GitHub Username:** [@MRVMerve](https://github.com/MRVMerve)
- **Assigned Role:** QA & Test Automation Engineer
- **Primary Responsibilities:**
  - Formulating the Quality Assurance strategy and authoring `docs/QA_Strategy.md`.
  - Creating the Story-to-Test Traceability Matrix mapping user stories US-01 through US-05 to test scenarios.
  - Defining acceptance criteria test suites, including RFC 7807 error validation (400, 401, 403, 404, 409).
  - Verifying contract compliance against business rules and boundary constraints.
- **Assigned & Authored Issues:**
  - [Issue #27](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/27): `Add docs/QA_Strategy.md and Test Traceability Matrix for Sprint 1` (Author & Assignee)
  - [Issue #35](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/35): `Update QA traceability matrix for openapi v0.2.1 (401/403/404 cases)` (Author & Assignee)
- **Pull Requests (Authored & Merged):**
  - [PR #28](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/28): `Add QA strategy with story-to-test traceability (#27)`
  - [PR #36](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/36): `Update QA traceability matrix for openapi v0.2.1 (#35)`
- **Peer Review Activity:** Reviewed and approved PR #26 (404 response updates) and PR #31 (OpenAPI Contract Architecture).

---

### 6. Şükrü Kağan Demir
- **Student ID:** 230201027
- **GitHub Username:** [@kagandemir03](https://github.com/kagandemir03)
- **Assigned Role:** DevOps & CI/CD Infrastructure Engineer
- **Primary Responsibilities:**
  - Managing repository governance, branching model (Git-Flow: `main`, `develop`, feature branches), and branch protection rules.
  - Implementing automated GitHub Actions Continuous Integration (`.github/workflows/lint-openapi.yml`) with Redocly CLI.
  - Designing GitHub Issue Form templates (`.github/ISSUE_TEMPLATE/`) and Pull Request template (`.github/pull_request_template.md`).
  - Executing the Sprint 1 production release merge and generating the immutable release tag `sprint-1`.
- **Assigned & Authored Issues:**
  - [Issue #38](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/issues/38): `DevOps: Setting Up GitHub Issue Forms and PR Templates` (Author & Assignee)
- **Pull Requests (Authored & Merged):**
  - [PR #1](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/1): `Update README.md`
  - [PR #15](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/15): `DevOps: Issue and PR templates added`
  - [PR #16](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/16): `DevOps: CI added for OpenAPI lint checks`
  - [PR #39](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/39): `DevOps: The issue template has been updated to GitHub's new form system (YAML)`
  - [PR #40](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/40): `Docs/update readme sprint1`
  - [PR #41](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/41): `Docs: Update Sprint 1 submission details`
  - [PR #42](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/42): `Release: Sprint 1 Delivery`
  - [PR #43](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/43): `Chore: Translate pull request template to English`
  - [PR #47](https://github.com/SENG321-SchedulingSystem/Appointment-and-Class-Scheduling-System/pull/47): `Hotfix: PR template translation`
- **Peer Review Activity:** Reviewed and approved PR #31 (OpenAPI Contract Architecture) and PR #45 (CI English Translation).

---

## Contribution Summary Matrix

| Member | Student ID | Role | Commits | Pull Requests Authored | Issues Authored / Assigned | Key Sprint 1 Artifacts |
|:---|:---:|:---|:---:|:---:|:---:|:---|
| **Miraç Burak Esentürk** | 230205001 | Product Owner | 5 | #17, #33 | #18, #19, #20, #21, #22, #23 | `project-proposal.md`, `system-vision.md`, `product-backlog.md` |
| **Eren Okat** | 230204008 | Lead Architect | 16 | #2, #3, #5, #10, #11, #26, #31, #45, #46 | #12, #25, #30, #44, US-03, US-05 | `openapi.yaml` (v0.2.1), `system-boundary.md` |
| **Furkan Çelebi** | 230204301 | Integration Eng. | 9 | #9, #14, #37 | #8, #13, US-01, US-02, US-04 | `API_Integration_Strategy.md`, Prism Validation (31 Tests) |
| **Ayşe Nida Yalçınkaya** | 230204063 | Scrum Master | 6 | #4, #6, #7, #29, #34 | #24, #32 | `RACI_Matrix.md`, `sprint-1-retrospective.md`, Project Board |
| **Merve Öksüz** | 230204051 | QA Engineer | 5 | #28, #36 | #27, #35 | `QA_Strategy.md`, Traceability Matrix, RFC 7807 Cases |
| **Şükrü Kağan Demir** | 230201027 | DevOps Engineer | 17 | #1, #15, #16, #39, #40, #41, #42, #43, #47 | #38 | CI Workflow, Branch Protection, Issue/PR Forms, Release `sprint-1` |
