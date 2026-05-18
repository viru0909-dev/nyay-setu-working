# Contributing to Nyay Saarthi

Thank you for your interest in contributing to Nyay Saarthi. We appreciate your time, effort, and dedication to helping us build a more accessible digital judiciary platform. 

Whether you are a seasoned open-source contributor or participating in programs like GSSoC (GirlScript Summer of Code), you are welcome here. This document outlines the process for contributing to the project.

<hr/>

## Table of Contents
- [Community Guidelines](#community-guidelines)
- [Finding an Issue](#finding-an-issue)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Pull Request Requirements](#pull-request-requirements)
- [Getting Help](#getting-help)

<hr/>

## Community Guidelines

We expect all contributors to maintain a professional, respectful, and collaborative environment. By participating in this project, you agree to:
- Be respectful and considerate of other contributors.
- Provide constructive feedback during code reviews.
- Focus on the project's mission of making justice accessible.

<hr/>

## Finding an Issue

1. **Browse Open Issues:** Check the [Issues tab](https://github.com/viru0909-dev/nyay-setu-working/issues) for open tasks.
2. **Look for Labels:** If you are new to the project, look for issues labeled `good first issue` or `help wanted`. For GSSoC participants, look for the `gssoc` or `gssoc'26` labels.
3. **Request Assignment:** 
   - Leave a comment on the issue you wish to work on asking to be assigned.
   - **Do not** start working or open a Pull Request for an issue assigned to someone else.
   - If an assignee shows no activity for **7 days**, the issue may be reassigned.

<hr/>

## Development Workflow

Follow these steps to set up your environment and submit your contributions:

### 1. Fork and Clone
Fork the repository to your GitHub account, then clone it locally:
```bash
git clone https://github.com/YOUR_USERNAME/nyay-setu-working.git
cd nyay-setu-working
```

Add the original repository as the upstream remote to stay synced:
```bash
git remote add upstream https://github.com/viru0909-dev/nyay-setu-working.git
```

### 2. Set Up the Environment
Refer to the [Setup Guide](./docs/setup.md) for detailed instructions on configuring the PostgreSQL database, Spring Boot backend, FastAPI NLP orchestrator, and React frontend.

### 3. Create a Branch
Always create a new branch for your work. Use descriptive names like `feat/login-ui`, `fix/navbar-bug`, or `docs/api-update`.
```bash
git checkout -b feat/your-feature-name
```

### 4. Commit Changes
We strictly follow the [Conventional Commits](https://www.conventionalcommits.org/) standard. Keep your commit messages clear and concise.
```bash
git commit -m "feat: implement JWT authentication"
```

**Valid Prefixes:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation updates
- `style:` Formatting or stylistic changes (no code logic changes)
- `refactor:` Code restructuring without changing behavior
- `test:` Adding or updating tests

### 5. Push and Open a PR
Push your branch to your fork:
```bash
git push origin feat/your-feature-name
```
Navigate to the main repository and open a Pull Request.

<hr/>

## Code Style Guidelines

Maintain consistency across the codebase by following these standards:

| Component | Guidelines |
|---|---|
| **Backend (Java)** | Follow the [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html). Ensure proper exception handling and RESTful design principles. |
| **Frontend (React)** | Use functional components and hooks exclusively. Follow the established folder structure (`src/components`, `src/pages`, etc.). Use Tailwind CSS for styling. |
| **NLP Orchestrator (Python)** | Follow PEP 8 guidelines. Include type hints for all function signatures. |

<hr/>

## Pull Request Requirements

Before a PR can be merged, it must meet the following criteria:

- **Issue Link:** The PR description must reference the issue it resolves (e.g., `Closes #123`).
- **Visual Evidence:** UI modifications must include screenshots or a screen recording in the PR description.
- **Sync with Main:** Your branch must be up-to-date with `main`. Rebase or merge before requesting a review.
- **Passing Checks:** All automated CI checks (build, lint, tests) must pass.
- **Clean History:** Avoid submitting PRs with unnecessary files (e.g., `.DS_Store`, `__pycache__`, or IDE configuration files).

<hr/>

## Getting Help

If you encounter technical issues or have questions regarding the implementation:
- Ask for clarification directly in the comments of your assigned GitHub Issue.
- Tag the maintainers for guidance.

We actively monitor the repository and are committed to helping you get your PR successfully merged.
