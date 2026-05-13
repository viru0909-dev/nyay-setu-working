# Project Governance & Safety

## Branch Protection Rules
We enforce the following rules on the `main` branch to ensure stability:
1.  **Require Pull Request Reviews**: All changes must be reviewed before merging.
2.  **Require Status Checks**: CI/CD pipelines (Tests, Build) must pass.
3.  **No Direct Commits**: All changes come through branches (e.g., `fix/...`, `feat/...`).

## Labeling System
We use standard labels to categorize issues and PRs:
- `bug`: Something isn't working.
- `enhancement`: New feature or improvement.
- `documentation`: Improvements or additions to documentation.
- `security`: Security vulnerabilities (Priority Handling).
- `wontfix`: This will not be worked on.

## Code Ownership
Critical areas of the codebase have designated owners defined in `.github/CODEOWNERS`:
- **Backend Core**: `@viru0909-dev`
- **Frontend UI**: `@viru0909-dev`
- **Infrastructure**: `@viru0909-dev`
