# Release Notes Template: Sprint 2 Delivery (`sprint-2`)

**Release Tag:** `sprint-2`
**Target Branch:** `main` (merged from `develop`)
**Delivery Date:** November 24, 2026
**API Contract Version:** `openapi.yaml` `v0.3.0`
**Runtime Standard:** Node.js 22 LTS (ADR-02)

## 1. Executive Summary

Sprint 2 delivers the complete software requirements specification, system and deployment architecture, behavioral UML designs, non-functional quality metrics, UI/UX prototypes, initial containerized backend skeleton, and automated CI/CD validation pipelines for the **Appointment and Class Scheduling System**.

## 2. Key Deliverables by Workstream

* **Requirements & Backlog (`docs/SRS.md`, `docs/product-backlog.md`):** Functional requirements, acceptance criteria, and Sprint 2 user stories aligned with `openapi.yaml` (`v0.3.0`) uppercase enums (`ADMIN`, `INSTRUCTOR`, `STUDENT`, `AVAILABLE`, `BOOKED`, `SCHEDULED`).
* **System Architecture & API Contract (`docs/Architecture.md`, `openapi.yaml`):** C4 Level 1–3 diagrams, ADR-02 (Node.js 22 LTS), backend-issued Bearer JWT (`POST /auth/login`), and finalized `v0.3.0` OpenAPI specification (`GET /users`, `DELETE /availability/{id}`).
* **UML Design & Backend Skeleton (`docs/UML_Diagrams.md`, `backend/`):** Concurrency/double-booking prevention sequence diagrams (`409 SLOT_UNAVAILABLE`), domain class model, Express + Firebase Admin SDK skeleton with offline Firebase Emulator support, Dockerfile, and 32 passing automated tests.
* **Non-Functional Requirements & QA (`docs/NFR_Quality_Measures.md`, `docs/QA_Strategy.md`):** Measurable performance, security, reliability, and testability benchmarks synchronized with ADR decisions.
* **UI/UX Design & Project Tracking (`docs/UI_UX_Specification.md`):** Core Figma wireframes, end-to-end login-to-booking user flow diagram, and Sprint 2 GitHub Projects board organization.
* **DevOps, Deployment & CI/CD (`docs/Deployment_Architecture.md`, `docs/Git_Workflow.md`, `.github/workflows/`):** C4 Level 4 Deployment Topology covering Local/Demo (`docker-compose` + Firebase Emulator on ports `5173`/`3000`), Staging, and Production environments, plus automated Markdown and YAML CI validation running on Node.js 22 LTS.

## 3. Architectural & Technical Alignment Highlights

* **Authentication Authority:** Backend `AuthService` (`POST /auth/login`) issues and verifies Bearer JWTs with uppercase role claims.
* **Zero-Key Local Demo Readiness:** Final evaluation environment standardized on `docker-compose` + Firebase Emulator Suite to keep the public repository free of cloud credentials.
* **Standardized Ports:** Frontend on `localhost:5173`, Backend API / Prism Mock on `localhost:3000`.

## 4. Verification Checklist (Pre-Tag Sign-Off)

* [ ] All Sprint 2 feature PRs are approved and merged into `develop`.
* [ ] All GitHub Actions CI checks (`openapi-lint.yml` and `docs-validation.yml`) pass on `develop` and `main`.
* [ ] Final `develop` to `main` Release PR is reviewed and merged.
* [ ] Annotated Git tag `sprint-2` is pushed to `main` and published under GitHub Releases.
* [ ] Sprint 2 submission report (PDF/ZIP) and repository links are verified for Microsoft Teams upload.