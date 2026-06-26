# Contributing to Nyay Saarthi

Thank you for your interest in contributing to Nyay Saarthi. We appreciate your time, effort, and dedication to helping us build a more accessible digital judiciary platform. 

Whether you are a seasoned open-source contributor or participating in programs like GSSoC (GirlScript Summer of Code), you are welcome here. This document outlines the process for contributing to the project.

> **TL;DR - Quick Start for Busy Contributors**
> 
> 1. Fork and clone the repo
> 2. Create a branch: `git checkout -b feat/your-feature`
> 3. Set up with: `docker-compose up -d` 
> 4. Make changes and test locally
> 5. Commit with clear messages (see [Conventional Commits](#commit-message-conventions))
> 6. Push and open a PR with issue link
> 7. Respond to review feedback
> 8. Merge! 🎉
>
> Need help? Check [Getting Help](#getting-help) section.

<hr/>

## Table of Contents
- [Community Guidelines](#community-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Finding an Issue](#finding-an-issue)
- [Development Workflow](#development-workflow)
- [Project Setup](#project-setup)
- [Making Changes](#making-changes)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Best Practices for Contributors](#best-practices-for-contributors)
- [Troubleshooting](#troubleshooting)
- [Getting Help](#getting-help)

<hr/>

## Community Guidelines

We expect all contributors to maintain a professional, respectful, and collaborative environment. By participating in this project, you agree to:
- Be respectful and considerate of other contributors.
- Provide constructive feedback during code reviews.
- Focus on the project's mission of making justice accessible.

<hr/>

## Reporting Bugs

Good bug reports save maintainers significant time. Before opening one, please:

1. **Search existing issues** — check the [Issues tab](https://github.com/viru0909-dev/nyay-setu-working/issues) to make sure it hasn't already been reported or fixed.
2. **Reproduce it** — confirm the bug is consistently reproducible and not caused by a local misconfiguration.
3. **Use the bug report template** — click **New Issue** and select **Bug Report**. Fill out every section.

### What to include in a bug report

| Field | What to write |
|---|---|
| **Title** | Short, specific summary — e.g. `Case filing fails with 500 when description exceeds 500 chars` |
| **Environment** | OS, browser/runtime, Java/Node/Python version, Docker or manual setup |
| **Steps to reproduce** | Numbered steps that reliably trigger the bug |
| **Expected behaviour** | What should happen |
| **Actual behaviour** | What actually happens — include the full error message or stack trace |
| **Screenshots / logs** | Attach relevant console output, screenshots, or log snippets |

### Example bug report

```
**Title:** POST /api/cases returns 500 when `description` field exceeds 500 characters

**Environment:**
- OS: Ubuntu 22.04
- Java 17, Spring Boot 3.2
- PostgreSQL 15 (Docker)
- Backend version: main branch @ commit abc1234

**Steps to reproduce:**
1. Log in as a litigant
2. Submit a new case with the `description` field set to a 501-character string
3. Observe the response

**Expected:** 400 Bad Request with a validation error message
**Actual:** 500 Internal Server Error — no message body

**Logs:**
java.lang.IllegalArgumentException: Value too long for column "description"
    at com.nyaysetu.backend.service.CaseService.createCase(CaseService.java:87)
```

### Security vulnerabilities

Do **not** open a public issue for security bugs. Follow the process in [SECURITY.md](./SECURITY.md) to report them privately.

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

<hr/>

## Project Setup

### Prerequisites
- **Node.js** v20+ and npm
- **Java** JDK 17
- **Maven** 3.9+
- **Python** 3.12+
- **Docker** & **Docker Compose** (recommended for easy setup)
- **PostgreSQL** 15+ (if running locally without Docker)
- **Git**

### Quick Setup with Docker (Recommended)

1. **Clone and enter the directory:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nyay-setu-working.git
   cd nyay-setu-working
   ```

2. **Create `.env` file from example:**
   ```bash
   cp .env.example .env
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

Services will be available at:
- Backend: `http://localhost:8080`
- LawGPT: `http://localhost:8000`
- NLP Orchestrator: `http://localhost:8001`
- Signaling Server: `http://localhost:3001`
- Frontend: `http://localhost:5173`

### Manual Setup (Without Docker)

#### Backend Setup (Java/Spring Boot)
```bash
cd backend/nyaysetu-backend
mvn clean install
mvn spring-boot:run
# Backend runs on http://localhost:8080
```

#### Frontend Setup (React/Vite)
```bash
cd frontend/nyaysetu-frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

#### LawGPT Service Setup (Python)
```bash
cd lawgpt-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# LawGPT runs on http://localhost:8000
```

#### NLP Orchestrator Setup (Python)
```bash
cd nlp-orchestrator
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# NLP Orchestrator runs on http://localhost:8001
```

#### Signaling Server Setup (Node.js)
```bash
cd signaling-server
npm install
npm start
# Signaling server runs on http://localhost:3001
```

### Environment Variables

Create a `.env` file in the project root with necessary configuration:
```env
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/nyaysetu
DB_USER=postgres
DB_PASSWORD=password

# JWT Secret
JWT_SECRET=your_super_secret_key_here

# API Keys
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key

# External Services
KANOON_API_URL=https://api.kanoon.org

# Application
APP_ENV=development
```

Refer to [Setup Guide](./docs/setup.md) for detailed configuration.

<hr/>

## Making Changes

### 1. Before You Start
- Pull the latest changes from `main`:
  ```bash
  git fetch upstream
  git rebase upstream/main
  ```
- Read the relevant documentation (check README.md or docs/)
- Understand the existing code structure

### 2. Development Guidelines

#### For Backend Changes
- Follow RESTful principles for API design
- Write unit tests for new methods
- Add appropriate error handling and validation
- Document complex logic with comments
- Keep endpoints organized by feature/domain

#### For Frontend Changes
- Use functional components with React hooks
- Follow the component structure (`components/`, `pages/`, `hooks/`, etc.)
- Use Tailwind CSS for styling (avoid inline CSS)
- Ensure responsive design for mobile and desktop
- Test across different screen sizes

#### For Python Services
- Follow PEP 8 style guidelines
- Add type hints for all functions
- Write docstrings for modules and functions
- Include proper error handling and logging

### 3. Running Tests Locally

#### Run Backend Tests
```bash
cd backend/nyaysetu-backend
mvn test
```

#### Run Frontend Tests
```bash
cd frontend/nyaysetu-frontend
npx vitest run
```

#### Run Python Tests
```bash
cd nlp-orchestrator
python -m pytest tests/ -v
```

### 4. Commit Your Changes
Use clear, descriptive commit messages following Conventional Commits:
```bash
git commit -m "feat: add JWT token refresh endpoint"
git commit -m "fix: resolve null pointer exception in case service"
git commit -m "docs: update API documentation"
```

### 5. Keep Your Branch Updated
If `main` has new commits while you're working:
```bash
git fetch upstream
git rebase upstream/main

# If you have conflicts, resolve them and then:
git add .
git rebase --continue
```

<hr/>

## Code Style Guidelines

Maintain consistency across the codebase by following these standards:

### Backend (Java/Spring Boot)
- Follow the [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use meaningful variable and method names
- Proper exception handling with custom exceptions
- Add `@RestController` annotations to controller classes
- Use dependency injection via constructor parameters
- Write unit tests for all service methods
- Add Javadoc comments for public methods

**Example:**
```java
@RestController
@RequestMapping("/api/cases")
public class CaseController {
    private final CaseService caseService;
    
    @Autowired
    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }
    
    /**
     * Retrieves a case by ID
     * @param caseId the ID of the case
     * @return the case details
     */
    @GetMapping("/{caseId}")
    public ResponseEntity<CaseDTO> getCase(@PathVariable String caseId) {
        return ResponseEntity.ok(caseService.getCaseById(caseId));
    }
}
```

### Frontend (React/TypeScript)
- Use functional components and React hooks exclusively
- Follow the established folder structure:
  ```
  src/
  ├── components/     # Reusable UI components
  ├── pages/          # Page-level components
  ├── hooks/          # Custom React hooks
  ├── services/       # API client services
  ├── store/          # Zustand state management
  └── utils/          # Utility functions
  ```
- Use Tailwind CSS for styling (no inline styles)
- Add PropTypes or TypeScript types for props
- Use descriptive component names
- Extract complex logic into custom hooks

**Example:**
```jsx
import React, { useState } from 'react';
import { useCase } from '../hooks/useCase';

interface CaseListProps {
  onSelectCase: (caseId: string) => void;
}

export const CaseList: React.FC<CaseListProps> = ({ onSelectCase }) => {
  const { cases, loading, error } = useCase();
  
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  
  return (
    <div className="space-y-2">
      {cases.map(case_ => (
        <button
          key={case_.id}
          onClick={() => onSelectCase(case_.id)}
          className="w-full p-4 text-left bg-white hover:bg-gray-50 border rounded"
        >
          {case_.title}
        </button>
      ))}
    </div>
  );
};
```

### Python Services
- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guide
- Add type hints for all function parameters and return values
- Write docstrings for all functions and classes
- Use meaningful variable names
- Keep functions focused and small (single responsibility)
- Add proper logging

**Example:**
```python
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class CaseService:
    """Service for managing legal cases"""
    
    def __init__(self, db_client):
        self.db = db_client
    
    def get_case_by_id(self, case_id: str) -> Optional[dict]:
        """
        Retrieves a case by its ID
        
        Args:
            case_id: The unique identifier of the case
            
        Returns:
            Dictionary containing case details or None if not found
            
        Raises:
            ValueError: If case_id is empty or invalid
        """
        if not case_id:
            raise ValueError("case_id cannot be empty")
        
        try:
            case = self.db.find_one("cases", {"id": case_id})
            logger.info(f"Retrieved case: {case_id}")
            return case
        except Exception as e:
            logger.error(f"Error retrieving case: {e}")
            raise
```

<hr/>

## Testing

### Writing Tests

#### Backend (Java/JUnit)
```java
@SpringBootTest
public class CaseServiceTest {
    
    @Mock
    private CaseRepository caseRepository;
    
    @InjectMocks
    private CaseService caseService;
    
    @Test
    public void testGetCaseById_Success() {
        // Arrange
        String caseId = "case-123";
        Case expectedCase = new Case();
        expectedCase.setId(caseId);
        when(caseRepository.findById(caseId)).thenReturn(Optional.of(expectedCase));
        
        // Act
        Case result = caseService.getCaseById(caseId);
        
        // Assert
        assertNotNull(result);
        assertEquals(caseId, result.getId());
    }
}
```

#### Frontend (Vitest/React Testing Library)
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { CaseList } from '../CaseList';

describe('CaseList Component', () => {
    it('renders case list items', () => {
        const cases = [
            { id: '1', title: 'Case 1' },
            { id: '2', title: 'Case 2' }
        ];
        
        render(<CaseList cases={cases} onSelectCase={vi.fn()} />);
        
        expect(screen.getByText('Case 1')).toBeInTheDocument();
        expect(screen.getByText('Case 2')).toBeInTheDocument();
    });
    
    it('calls onSelectCase when item is clicked', () => {
        const onSelectCase = vi.fn();
        render(<CaseList cases={[{ id: '1', title: 'Case 1' }]} onSelectCase={onSelectCase} />);
        
        fireEvent.click(screen.getByText('Case 1'));
        
        expect(onSelectCase).toHaveBeenCalledWith('1');
    });
});
```

#### Python (pytest)
```python
import pytest
from app.services import CaseService

@pytest.fixture
def case_service():
    return CaseService(mock_db)

def test_get_case_by_id_success(case_service):
    """Test successful case retrieval"""
    result = case_service.get_case_by_id("case-123")
    assert result is not None
    assert result["id"] == "case-123"

def test_get_case_by_id_not_found(case_service):
    """Test case not found scenario"""
    result = case_service.get_case_by_id("nonexistent")
    assert result is None
```

### Running All Tests
```bash
# Backend
cd backend/nyaysetu-backend && mvn test

# Frontend (single run, no watch mode)
cd frontend/nyaysetu-frontend && npx vitest run

# Python services
cd nlp-orchestrator && python -m pytest
```

<hr/>

## Pull Request Process

### Before you open a PR

- [ ] Your branch is rebased on the latest `main`
- [ ] All tests pass locally (`mvn test`, `npx vitest run`, `pytest`)
- [ ] Code follows the project's style guidelines
- [ ] No merge conflicts exist
- [ ] The PR is linked to an open issue that was assigned to you

### Opening the PR

1. Push your branch to your fork:
   ```bash
   git push -u origin feat/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of the upstream repo.
3. Use the PR template — it auto-populates when you open the PR. Fill in every section:

| Section | What to write |
|---|---|
| `Closes #` | The issue number this PR resolves, e.g. `Closes #862` |
| **Type of change** | Tick the applicable box (bug fix / new feature / breaking change / docs) |
| **Description** | What changed and why |
| **Screenshots** | Required for any UI-visible changes |
| **How to test** | Steps a reviewer can follow to verify your changes |
| **Checklist** | Every box must be ticked before requesting review |

### Example PR description

```markdown
## Description
Adds a dedicated "Reporting Bugs" section to CONTRIBUTING.md so new contributors
know what information to include when filing a bug report.

Closes #862

## Type of change
- [x] This change requires a documentation update

## Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings
```

### Review process

1. At least **one maintainer** must review and approve your PR.
2. Respond to review comments promptly — unaddressed PRs may be closed after 7 days of inactivity.
3. Push follow-up commits to address feedback; **do not force-push** after a review has started.
4. Request a re-review once you've addressed all comments.
5. Once approved and all CI checks are green, a maintainer will merge your PR.

### Automated CI checks

Every PR must pass the following before it can be merged:

- ✅ Build compiles without errors
- ✅ All unit tests pass
- ✅ No merge conflicts with `main`
- ✅ Branch is up-to-date with `main`

> 💡 **GSSoC'26 Note:** Your PR will only be counted for points once it is
> **merged** — not when it is opened. Make sure it meets all the checklist
> items above to speed up the review process.

<hr/>

## Best Practices for Contributors

### 1. Communication
- **Before starting:** Comment on an issue to claim it
- **During work:** Ask for help if stuck for more than 30 minutes
- **In PRs:** Respond to reviews promptly and professionally
- **Documentation:** Update docs when you change functionality

### 2. Code Quality
- **Keep it simple:** Write readable, maintainable code
- **DRY principle:** Don't repeat code - extract to functions/components
- **Error handling:** Handle both happy paths and error scenarios
- **Testing:** Aim for 80%+ code coverage on critical paths
- **Documentation:** Comment complex logic, add docstrings

### 3. Commits and History
- **Small commits:** Make focused, logical commits
- **Frequent commits:** Commit often to avoid losing work
- **Meaningful messages:** Write descriptive commit messages following the [conventions below](#commit-message-conventions)
- **Atomic changes:** Each commit should be a complete, working change
- **No merge commits:** Use rebase to keep history clean

### 4. Local Development
- **Test before pushing:** Run all tests locally first
- **Test different browsers:** For frontend, test in Chrome, Firefox, Safari
- **Check all devices:** Test on mobile, tablet, and desktop
- **Performance:** Check for console errors and performance issues
- **Accessibility:** Ensure features are accessible to all users

### 5. Documentation
- **README updates:** Update docs when changing setup
- **API changes:** Document new or modified endpoints
- **Configuration:** Document new environment variables
- **Breaking changes:** Clearly mark and explain breaking changes
- **Examples:** Provide code examples for new features

### 6. Collaboration
- **Ask questions:** Better to ask than guess wrong
- **Help others:** Review PRs and answer questions
- **Respect feedback:** Accept constructive criticism
- **No blame:** Focus on solutions, not who caused issues
- **Share knowledge:** Help team members learn

### 7. Before Requesting Review
- [ ] All tests pass locally
- [ ] Code formatted and linted
- [ ] No console errors or warnings
- [ ] Branch rebased with main
- [ ] PR description is complete
- [ ] Related issues are linked
- [ ] Screenshots included (if applicable)

<hr/>

## Commit Message Conventions

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Every commit message must have this structure:

```
<type>(<optional scope>): <short summary>

<optional body — explain what and why, not how>
```

The summary line must be **under 72 characters** and written in the imperative mood ("add", not "added" or "adds").

### Commit types

| Type | When to use | Example |
|------|-------------|---------|
| `feat` | New feature or capability | `feat: add password reset endpoint` |
| `fix` | Bug fix | `fix: resolve null pointer in case service` |
| `docs` | Documentation only | `docs: add bug reporting guide to CONTRIBUTING` |
| `style` | Formatting, whitespace — no logic change | `style: reformat CaseController with google-java-format` |
| `refactor` | Code restructure with no behaviour change | `refactor: extract token validation into helper` |
| `perf` | Performance improvement | `perf: batch evidence hash verification` |
| `test` | Add or update tests | `test: cover edge cases in case status transitions` |
| `chore` | Build config, dependency updates | `chore: bump spring-boot to 3.2.5` |
| `ci` | CI/CD workflow changes | `ci: add vitest step to GitHub Actions` |

### Examples

```bash
# Single-line — simple change
git commit -m "fix: correct HTTP status code for duplicate case filing"

# Multi-line — complex change with context
git commit -m "feat: add JWT token refresh endpoint

Implements POST /api/auth/refresh using token rotation.
Old refresh tokens are invalidated on use to prevent replay attacks.
Includes unit tests for success, expiry, and reuse scenarios."

# Docs change
git commit -m "docs: add reporting bugs section to CONTRIBUTING.md"

# Test-only change
git commit -m "test: add vitest coverage for CaseList component"
```

### What makes a bad commit message

```bash
# Too vague
git commit -m "fix stuff"
git commit -m "update"
git commit -m "WIP"

# Wrong tense / not imperative
git commit -m "fixed the bug"
git commit -m "adding new feature"
```

<hr/>

## Troubleshooting

### Common Issues and Solutions

#### Build Fails Locally but Passes in CI
```bash
# Clean and rebuild
mvn clean install          # Backend
npm ci && npm run build    # Frontend
python -m pip install -r requirements.txt  # Python
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :8080              # macOS/Linux
netstat -ano | findstr 8080  # Windows

# Kill the process
kill -9 <PID>              # macOS/Linux
taskkill /PID <PID> /F     # Windows
```

#### Database Connection Error
```bash
# Check PostgreSQL is running
docker-compose ps

# If not running, start services
docker-compose up -d

# Check logs
docker-compose logs db
```

#### Tests Failing Unexpectedly
```bash
# Run with verbose output
mvn test -X                    # Backend
npx vitest run --reporter=verbose  # Frontend
pytest -v tests/               # Python

# Check for environment variables
echo $DATABASE_URL
echo $JWT_SECRET
```

#### Merge Conflicts
```bash
# View conflicts
git status

# Open files with conflicts (marked with <<<<<<, ======, >>>>>>)
# Resolve conflicts manually
git add .
git rebase --continue

# Or abort and start over
git rebase --abort
```

#### Stale Branch (Out of Sync with Main)
```bash
# Fetch latest from upstream
git fetch upstream

# Rebase your branch on top of main
git rebase upstream/main

# If there are conflicts, resolve them
# Then force push to your fork
git push origin your-branch-name -f
```

### Getting Additional Help

#### Debugging Tools
- **Backend:** Use Spring Boot actuator: `curl http://localhost:8080/actuator`
- **Frontend:** Use React DevTools and Chrome DevTools
- **Python:** Use print statements, logging module, or pdb debugger
- **Database:** Use pgAdmin for PostgreSQL or query tools

#### Checking Service Health
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Follow logs in real-time
docker-compose logs -f --tail=100
```

<hr/>

## Getting Help

### Resources

**Before asking for help, check these resources:**
1. [README.md](README.md) - Project overview and quick start
2. [Setup Guide](./docs/setup.md) - Detailed setup instructions
3. [Architecture Overview](./docs/architecture/overview.md) - System design
4. [API Documentation](./API_TESTING_GUIDE.md) - API reference and examples
5. [Existing Issues](https://github.com/viru0909-dev/nyay-setu-working/issues) - Search for similar problems
6. [Project Discussions](https://github.com/viru0909-dev/nyay-setu-working/discussions) - Common questions

### Getting Support

#### For Issues During Development
1. **Issue Comments:** Ask directly in the GitHub issue you're assigned to
2. **PR Comments:** Discuss your changes in the PR comments
3. **Discussions:** Use GitHub Discussions for broader questions
4. **Discord/Slack:** Join the community server (link in README)

#### For Technical Problems
```
Problem: Build fails locally
Solution:
1. Try `mvn clean install` (Backend) or `npm ci` (Frontend)
2. Check environment variables (.env file)
3. Verify Docker services: `docker-compose ps`
4. Check logs: `docker-compose logs [service]`
5. Ask in issue with error message
```

#### Asking Good Questions
When asking for help, provide:
- **What you're trying to do** - Context of the task
- **What you've tried** - Steps you've already taken
- **What happened** - Error messages or unexpected behavior
- **Environment** - OS, software versions, relevant config
- **Reproducible steps** - How to recreate the issue

**Example Good Question:**
```
I'm working on issue #456 - Add JWT refresh token.
I've set up the project and created the /auth/refresh endpoint.
When I test with cURL, I get: 
  {"error": "Invalid refresh token"}
I've verified the token is being saved correctly.
My environment:
- Java 17
- Spring Boot 3.2
- PostgreSQL 15

Steps to reproduce:
1. Login and get refresh token
2. Call POST /auth/refresh with the token
3. See error above

What am I missing?
```

### Code Review Tips

When your PR gets reviewed:

1. **Be open to feedback** - Reviews help improve code quality
2. **Respond promptly** - Don't leave reviewers hanging
3. **Ask for clarification** - If feedback is unclear, ask
4. **Acknowledge good points** - Thank reviewers for improvements
5. **Make requested changes** - Push new commits, don't force push
6. **Mark conversations as resolved** - Once you've addressed feedback

**Example Response:**
```
Great point about error handling! I've updated the code to:
- Add try-catch around database calls
- Return proper HTTP status codes
- Add logging for debugging

I pushed a new commit with these changes. Let me know if you'd like any other improvements!
```

### Escalating Issues

If you're stuck and can't get help from the community:

1. **Tag maintainers:** Use `@maintainer-name` in GitHub issues
2. **Create a detailed issue:** Include all information from "Asking Good Questions"
3. **Set priority:** Use issue labels (critical, high, medium, low)
4. **Follow up:** Check back after 2-3 days if no response

### Resources by Role

**New Contributors:**
- Read [API_QUICKSTART.md](./API_QUICKSTART.md) - Quick API intro
- Check `good first issue` label
- Join community discussions

**Backend Developers:**
- Review [Architecture Overview](./docs/architecture/overview.md)
- Study [openapi.yaml](./openapi.yaml)
- Check [API_ENDPOINTS_COMPREHENSIVE.md](./API_ENDPOINTS_COMPREHENSIVE.md)

**Frontend Developers:**
- Review component structure in `src/components/`
- Check existing hooks in `src/hooks/`
- Study Tailwind CSS patterns used

**DevOps/Infrastructure:**
- Review [docker-compose.yml](./docker-compose.yml)
- Check [.github/workflows/](./.github/workflows/)
- Review deployment configuration

**Documentation:**
- Check existing docs in [docs/](./docs/)
- Review API documentation in [API_*.md](./API_QUICKSTART.md)
- Help improve clarity and examples

### Getting in Touch

| Channel | Best For | Response Time |
|---------|----------|----------------|
| GitHub Issues | Feature requests, bugs | 24-48 hours |
| GitHub PR Comments | Code review feedback | 12-24 hours |
| GitHub Discussions | Questions, ideas | 24-48 hours |
| Discord/Slack | Real-time chat | Variable |
| Email | Formal concerns | 48-72 hours |

**Community Links:**
- 📧 Email: support@nyaysetu.in
- 💬 Discord: [Join Community](https://discord.gg/nyaysetu)
- 📱 Twitter: [@NyaySetu](https://twitter.com/nyaysetu)
- 🐙 GitHub: [Issues](https://github.com/viru0909-dev/nyay-setu-working/issues)

We actively monitor the repository and are committed to helping you get your PR successfully merged. Don't hesitate to ask for help!

<hr/>

## Recognition & Credits

### Contributors
All contributors are recognized in:
- GitHub Contributors page
- [CONTRIBUTORS.md](./CONTRIBUTORS.md) file
- Release notes for significant contributions

### Special Thanks
We especially appreciate contributions in these areas:
- 🐛 Bug reports with detailed reproduction steps
- 📖 Documentation improvements and translations
- 🧪 Test coverage improvements
- ♿ Accessibility improvements
- 🌍 Internationalization support
- 🚀 Performance optimizations

<hr/>

## License

By contributing to Nyay Setu, you agree that your contributions will be licensed under its open-source license. See [LICENSE](./LICENSE) for details.

<hr/>

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

<hr/>

**Happy contributing! 🎉**

