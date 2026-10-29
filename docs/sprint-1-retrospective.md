# Sprint 1 Retrospective

**Date:** October 29, 2026
**Sprint Goal:** Establish project infrastructure, define system boundaries, finalize the API contract, and complete initial documentation.

## What Went Well (Successes)
* **API-First Architecture:** Successfully defined the system using OpenAPI (`openapi.yaml`) as the single source of truth, ensuring frontend-backend synchronization before writing any logic.
* **Documentation & Boundary Definition:** RACI matrix, QA strategy, and system boundaries were comprehensively documented and perfectly aligned with the project vision.
* **Git-Flow Adaptation:** The team successfully established a professional branching strategy, utilizing Pull Requests to manage code integration.

## Process Optimizations (Areas for Improvement)
* **Branch Synchronization:** Adapting to strict Git-Flow required initial coordination regarding local-remote branch synchronization, which the team quickly resolved through better communication.
* **Standardizing Issue Tracking:** We identified the need to create and enforce stricter GitHub Issue Templates in Sprint 2 to ensure every task is created with pre-defined acceptance criteria before development begins.

## Action Items for Sprint 2
* Initialize the frontend and backend development environments in alignment with the team's architectural decisions.
* Connect the database and implement transaction-based concurrency control for the `POST /appointments` endpoint to prevent double-booking.
* Finalize and verify branch protection rulesets for `main` and `develop`.