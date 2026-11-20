# Git-Flow & Release Management Guidelines

## 1. Branching Strategy (Git-Flow)

To ensure clean commit history, traceable individual contributions, and zero unreviewed changes in production, the **Appointment and Class Scheduling System** strictly enforces the following Git-Flow branch hierarchy:

| Branch Pattern | Base Branch | Merge Target | Purpose & Lifecycle |
| :--- | :--- | :--- | :--- |
| `main` | - | - | Production-ready, immutable release branch. Accepts merges **only** from `develop` (for sprint deliveries) or critical `hotfix/*` branches. |
| `develop` | `main` | `main` | Primary integration branch where all completed Sprint tasks are consolidated and verified before release. |
| `feature/*` | `develop` | `develop` | Isolated branches for new features, architectural specs, or Sprint deliverables (e.g., `feature/sprint-2-devops-sync`). |
| `fix/*` or `hotfix/*` | `develop` / `main` | `develop` / `main` | Targeted bug fixes or urgent production patches. |
| `docs/*` or `chore/*` | `develop` | `develop` | Documentation updates, CI/CD configuration, and repository maintenance. |

## 2. Branch Protection & Pull Request Rules

Direct pushes and force pushes (`git push --force`) to `main` and `develop` are strictly prohibited. Every change must pass through a Pull Request (PR) meeting all mandatory gates:

1. **Issue Traceability:** Every task starts with a structured GitHub Issue linked to the **Appointment Scheduling System Project Board**. PR descriptions must reference the task using `Resolves #<issue-number>` or `Closes #<issue-number>`.
2. **Mandatory Peer Review:** At least **1 approving review** from a team member other than the PR author is required before merging.
3. **Automated CI Quality Gates (Node.js 22 LTS):** All GitHub Actions checks must pass with a green status (`✓`):
   * `openapi-lint.yml`: Validates `openapi.yaml` (`v0.3.0`) contract syntax and schema rules.
   * `docs-validation.yml`: Validates Markdown structural/accessibility rules (`.markdownlint.json`) and YAML integrity across `.github/`, `openapi.yaml`, and `docker-compose*.yml`.
4. **Language & Contract Alignment:** All repository documentation, commit messages, and PR descriptions must be written in English and remain synchronized with `openapi.yaml` (`v0.3.0`) and **ADR-02 (Node.js 22 LTS)**.

## 3. Commit Message Convention

Use clear, concise prefixes to maintain a readable audit log:

* `feat:` New feature or endpoint implementation
* `fix:` Bug fix or defect resolution
* `docs:` Architecture, SRS, UML, NFR, or workflow documentation updates
* `ci:` GitHub Actions pipeline or linting rule changes
* `chore:` Repository templates, dependencies, or configuration tasks

**Example:** `docs(deployment): align C4 topology with Docker Compose and backend JWT`

## 4. Sprint Release & Tagging Procedure

At the end of each Sprint (e.g., Sprint 2 delivery on November 24), the DevOps Engineer executes the official release sequence:

1. Verify that all Sprint PRs are reviewed, CI-verified, and merged into `develop`.
2. Open a Release Pull Request from `develop` into `main` (e.g., `Release: Sprint 2 Delivery`), obtain peer approval, and merge.
3. Pull the updated `main` branch locally and create an annotated Git tag:

```bash
git checkout main
git pull origin main
git tag -a sprint-2 -m "Sprint 2 Delivery: Architecture, API v0.3.0, UML, NFR, UI/UX, and CI/CD"
git push origin sprint-2
```

4. Publish a GitHub Release attached to the `sprint-2` tag using the standardized template in `docs/Sprint_2_Release_Notes.md`.