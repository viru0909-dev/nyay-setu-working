# Project Governance & Safety

This document outlines the operational rules and governance policies for the Nyay Saarthi repository to ensure high code quality, security, and stability.

<hr/>

## Branch Protection Rules

We enforce the following rules on the `main` branch to ensure stability:
1. **Require Pull Request Reviews**: All changes must be reviewed and approved by at least one maintainer before merging.
2. **Require Status Checks**: All CI/CD pipelines (Build, Lint, Tests) must pass successfully.
3. **No Direct Commits**: All changes must be proposed via pull requests from feature branches (e.g., `feat/...`, `fix/...`).

<hr/>

## Labeling System

We use standardized labels to categorize issues and pull requests:
- `bug`: Something isn't working as expected.
- `enhancement`: A new feature or improvement.
- `documentation`: Improvements or additions to the documentation.
- `security`: Security vulnerabilities (High Priority).
- `good first issue`: Ideal tasks for new contributors.
- `wontfix`: The issue will not be worked on.

<hr/>

## Code Ownership

Critical areas of the codebase have designated owners, defined in `.github/CODEOWNERS`:

| Component | Owner |
|---|---|
| **Backend Core** | `@viru0909-dev` |
| **Frontend UI** | `@viru0909-dev` |
| **Infrastructure** | `@viru0909-dev` |
| **AI / NLP Orchestrator** | `@viru0909-dev` |
