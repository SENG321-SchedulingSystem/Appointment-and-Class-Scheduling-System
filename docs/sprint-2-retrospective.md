# Sprint 2 Retrospective

**Date:** November 20, 2026
**Facilitator:** Ayşe Nida Yalçınkaya (Scrum Master & Agile Process Coach)
**Sprint Goal:** Turn the Sprint 1 foundation into a complete design baseline: detailed requirements, architecture (C4 + ADRs), UML models, non-functional requirements, UI/UX prototypes, deployment architecture, and an updated API contract.

## Sprint 2 Deliverables

| Deliverable | Owner | Issue | Pull Request |
|---|---|---|---|
| Sprint 2 planning and RACI matrix | Nida | #50, #53 | #54 |
| Architecture (C4 L1–L3, ADRs, concurrency flow) | Eren | #52, #58, #68 | #51, #59, #69 |
| API contract v0.3.0 (`GET /users`, `DELETE /availability/{id}`) | Eren | #62 | #63 |
| Non-functional requirements and quality measures | Merve | #64 | #65 |
| UML diagrams and backend skeleton (Express + Firebase, Node 22) | Furkan | #66 | #67 |
| Deployment architecture, CI validation, Git-Flow and release template | Kağan | #56 | #70 |
| Figma UI/UX prototypes, user flows, UI/UX specification | Nida | #55 | #71 |
| SRS and refined product backlog | Miraç | #60 | #61 |

## What Went Well (Successes)
* **Cross-review improved the API contract:** Designing the screens and reviewing the SRS exposed gaps in `openapi.yaml` (user listing for the admin, slot deletion, instructor identity). They were added in v0.3.0 before implementation started.
* **Every deliverable went through a Pull Request:** All Sprint 2 work was merged into `develop` through PRs with peer reviews, and review feedback was applied quickly (Docker/Emulator setup, backend-issued JWT, port alignment).
* **Shared technical decisions:** The team agreed on Node.js 22 LTS, a backend-issued JWT, and a local demo environment with `docker-compose` and the Firebase Emulator, so no cloud keys are needed in the public repository.
* **Automated quality gates grew:** In addition to OpenAPI linting, a Markdown and YAML validation workflow now runs on every Pull Request.
* **Design is ready for implementation:** Screens, user flows and error messages are mapped to API endpoints, so frontend work in Sprint 3 can start against the Prism mock.

## Process Optimizations (Areas for Improvement)
* **Keeping documents in sync with the contract:** Since several documents were written in parallel with API changes, the team added a final alignment round so that all documents reference `openapi.yaml` v0.3.0.
* **Issue tracking on the board:** Because `develop` is not the default branch, linked issues are closed manually after each merge to keep the project board up to date.

## Status of Sprint 1 Action Items
* **Initialize frontend and backend environments:** The backend skeleton (Express, Firebase Admin, Dockerfile, tests) is merged. The frontend project starts in Sprint 3.
* **Transaction-based concurrency control for `POST /appointments`:** Designed with an ADR and a sequence diagram; implementation is planned for Sprint 3.
* **Branch protection for `main` and `develop`:** Rules are documented in `docs/Git_Workflow.md`.

## Action Items for Sprint 3
* Implement user stories US-01 to US-05 (#19–#23) against `openapi.yaml` v0.3.0.
* Create the React + Tailwind frontend (port 5173) based on `docs/UI_UX_Specification.md`.
* Implement the Firestore transaction for `POST /appointments` with the `409 SLOT_UNAVAILABLE` response, covered by an automated concurrency test.
* Add `docker-compose.yml` with the Firebase Emulator so the demo runs with a single command.
* Announce every `openapi.yaml` change in the team channel together with a version bump.