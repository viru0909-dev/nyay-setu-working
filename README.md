<p align="center">
  <img src="assets/banner.png" alt="Nyay Setu — Digital Judiciary Platform for India" width="100%" />
</p>

<p align="center">
  <a href="https://nyaysetu-lovat.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-nyaysetu.vercel.app-6C63FF?style=for-the-badge" alt="Live Demo" />
  </a>
  &nbsp;
  <a href="https://github.com/viru0909-dev/nyay-setu-working/issues">
    <img src="https://img.shields.io/github/issues/viru0909-dev/nyay-setu-working?style=for-the-badge&color=E05C5C" alt="Open Issues" />
  </a>
  &nbsp;
  <a href="https://github.com/viru0909-dev/nyay-setu-working/pulls">
    <img src="https://img.shields.io/github/issues-pr/viru0909-dev/nyay-setu-working?style=for-the-badge&color=43A047" alt="Pull Requests" />
  </a>
  &nbsp;
  <a href="https://github.com/viru0909-dev/nyay-setu-working/stargazers">
    <img src="https://img.shields.io/github/stars/viru0909-dev/nyay-setu-working?style=for-the-badge&color=FFB300" alt="Stars" />
  </a>
</p>

<p align="center">
  <em>Democratizing Access to Justice Through Artificial Intelligence</em>
</p>

<hr/>

> **Mission Statement**
>
> India has over 50 million pending court cases. Millions of citizens cannot afford legal counsel. Nyay Setu bridges this gap by putting an AI-powered legal assistant, end-to-end case management, and secure virtual courts in the hands of every Indian — entirely free of charge.

<hr/>

## Table of Contents

- [Why Nyay Setu?](#why-nyay-setu)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)

<hr/>

## Why Nyay Saarthi?

The Indian judiciary faces a systemic crisis that affects hundreds of millions of citizens:

| Problem | Scale |
|---|---|
| Pending court cases | **50+ Million** |
| Average time to resolve a civil case | **10–15 Years** |
| Citizens unable to afford legal representation | **Hundreds of Millions** |

Nyay Setu is built to address this directly. The platform removes the three biggest barriers to legal access — cost, complexity, and distance — by digitizing the entire judiciary workflow and placing an AI legal assistant at every citizen's fingertips.

<hr/>

## Key Features

**AI Legal Assistant (Vakil Friend)**
A conversational AI companion powered by Groq's Llama 3.1 that helps citizens understand their legal rights, navigate case filings, review documents, and get real-time answers in plain, accessible language.

**Role-Based Dashboards**
Secure, tailored portals for every user type in the legal ecosystem: Litigants, Lawyers, Judges, Police, and Administrators — each with a workflow designed around their specific responsibilities.

**End-to-End Case Management**
Full case lifecycle support from initial filing to final order, including a case diary, hearing timelines, document management, and status tracking.

**Evidence Vault**
Structured digital evidence uploads with SHA-256 hash verification, creating a tamper-proof and legally admissible record for every case.

**Digital FIR Handling**
Police can upload FIRs digitally. The AI instantly generates a structured summary and draft charge sheet, significantly reducing manual paperwork and processing time.

**Virtual Courtrooms**
Native WebRTC-based video conferencing integrated directly into the case timeline for secure, seamless remote hearings — no third-party applications required.

**Secure Authentication**
JWT-based stateless authentication with Spring Security, role-based access control, and multi-layer request filtering.

<hr/>

## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Java%2017-007396?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq%20Llama%203.1-FF6B35?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white" />
  <img src="https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
</p>

<hr/>

## Quick Start

For complete setup instructions, environment configuration, and Docker deployment details, refer to the **[Detailed Setup Guide](./docs/setup.md)**.

At a high level, the platform consists of three services that need to run concurrently:

| Service | Directory | Command |
|---|---|---|
| Frontend | `frontend/nyaysetu-frontend/` | `npm install && npm run dev` |
| Backend | `backend/nyaysetu-backend/` | `mvn spring-boot:run` |
| NLP Orchestrator | `nlp-orchestrator/` | `uvicorn main:app --reload` |

> **Prerequisites:** Node.js >= 20, Java 17, Maven 3.9+, PostgreSQL 15+, Python 3.12+

For environment variables, copy `.env.example` to `.env` and fill in your values. A full reference of all required variables is documented in the [Setup Guide](./docs/setup.md#environment-variables).

<hr/>

## Documentation

| Document | Description |
|---|---|
| [Setup Guide](./docs/setup.md) | Full database setup, environment variables, and Docker configuration |
| [Architecture Overview](./docs/architecture/overview.md) | System design, component diagrams, and data flow |
| [AI Integration Guide](./AI_INTEGRATION_GUIDE.md) | Groq API and NLP orchestrator technical deep-dive |
| [API Documentation](./SYSTEM_DOCUMENTATION.md) | All REST endpoints with request and response specifications |
| [Contributing Guidelines](./CONTRIBUTING.md) | Branching strategy, commit conventions, and PR workflow |

<hr/>

## Contributing

This project is part of **GSSoC (GirlScript Summer of Code) 2026**. Contributions are welcome from everyone, regardless of experience level.

**Before opening a Pull Request:**

| Requirement | Details |
|---|---|
| Read the guidelines | Review [CONTRIBUTING.md](./CONTRIBUTING.md) for our branching and commit conventions |
| Link an issue | Every PR must reference the issue it closes (`Closes #123`) |
| Include visuals | UI-affecting PRs must include screenshots or a screen recording |
| Sync with main | Rebase or merge `main` into your branch before requesting review |
| Pass all checks | CI checks for lint, tests, and build must all pass |

Browse [open issues](https://github.com/viru0909-dev/nyay-setu-working/issues) and filter by `good first issue` to get started.

<hr/>

## Contributors

<br/>

<a href="https://github.com/viru0909-dev/nyay-setu-working/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=viru0909-dev/nyay-setu-working&max=500&columns=15" alt="Contributors" />
</a>

<br/><br/>

This chart updates automatically as new contributors merge pull requests. Want to see your avatar here? [Pick up an issue](https://github.com/viru0909-dev/nyay-setu-working/issues) and start contributing.

<hr/>

## License

License to be added. All rights reserved until a license is formally declared.

<hr/>

<p align="center">
  Built with purpose for a more accessible Indian Judiciary.<br/>
  <em>Nyay Setu — न्याय हर किसी का अधिकार है।</em>
</p>
