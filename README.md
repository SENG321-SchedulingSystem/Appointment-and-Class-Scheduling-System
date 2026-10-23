# Appointment-and-Class-Scheduling-System
SENG 321 Term Project: A centralized appointment and class scheduling system with role-based access for students and instructors.

## Git-Flow and Branching Rules

To support agile processes and maintain code quality in this project, the following branching strategy is applied:

* **`main`:** Contains only stable, tagged releases intended for evaluation (e.g., `sprint-1`).
* **`develop`:** The main integration branch where features prepared and tested for the next release are merged.
* **`feature/*`:** Short-lived branches created from `develop` for each user story (e.g., `feature/US-01-add-account`).

### ⚠️ Important Security Rules
Direct push operations to the `main` and `develop` branches are strictly disabled. Changes can only be integrated by following these steps:
1. A new `feature` branch is created from `develop` for the relevant task.
2. Once development is complete, a **Pull Request (PR)** is opened towards the `develop` branch via GitHub.
3. PRs cannot be merged without at least 1 team member's approval (Code Review) and successful CI test execution.
