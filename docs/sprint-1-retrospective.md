# Sprint 1 Retrospective

**Date:** October 2026
**Sprint Goal:** Establish project infrastructure, define system boundaries, finalize the API contract, and complete initial documentation.

## What Went Well (Successes)
* **API-First Architecture:** Successfully defined the system using OpenAPI (`openapi.yaml`) as the single source of truth, ensuring frontend-backend synchronization before writing any logic.
* **Documentation & Boundary Definition:** RACI matrix, QA strategy, and system boundaries were comprehensively documented and perfectly aligned with the project vision.
* **Strict Git-Flow Adaptation:** The team successfully established a professional branching strategy, utilizing Pull Requests and blocking direct commits to `main` and `develop`.

## Process Optimizations (Areas for Improvement)
* **Branch Synchronization:** Adapting to strict Git-Flow required initial coordination regarding local-remote branch synchronization, which the team quickly resolved through better communication.
* **Standardizing Issue Tracking:** We identified the need for stricter GitHub Issue Templates to ensure every task is created with pre-defined acceptance criteria before development begins.

## Action Items for Sprint 2
* Initialize the development environment (React for frontend, Node.js/Express for backend).
* Connect the Firebase database and implement transaction-based concurrency control for the `POST /appointments` endpoint to prevent double-booking at the database level.
* Enforce the newly established GitHub Issue Templates across all new backlog items.