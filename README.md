<p align="center">
  <img src="assets/banner.png" alt="Nyay Saarthi — Digital Judiciary Platform for India" width="100%" />
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
> India has over 50 million pending court cases. Millions of citizens cannot afford legal counsel. Nyay Saarthi bridges this gap by putting an AI-powered legal assistant, end-to-end case management, and secure virtual courts in the hands of every Indian — entirely free of charge.

<hr/>

# Table of Contents

- [Why Nyay Saarthi?](#why-nyay-saarthi)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Google OAuth2 Authentication Setup](#google-oauth2-authentication-setup)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)

<hr/>

# Why Nyay Saarthi?

The Indian judiciary faces a systemic crisis that affects hundreds of millions of citizens:

| Problem | Scale |
|---|---|
| Pending court cases | **50+ Million** |
| Average time to resolve a civil case | **10–15 Years** |
| Citizens unable to afford legal representation | **Hundreds of Millions** |

Nyay Saarthi is built to address this directly. The platform removes the three biggest barriers to legal access — cost, complexity, and distance — by digitizing the entire judiciary workflow and placing an AI legal assistant at every citizen's fingertips.

<hr/>

# Key Features

## AI Legal Assistant (Vakil Friend)

A conversational AI companion powered by Groq's Llama 3.1 that helps citizens understand their legal rights, navigate case filings, review documents, and get real-time answers in plain, accessible language.

---

## Role-Based Dashboards

Secure, tailored portals for every user type in the legal ecosystem:
- Litigants
- Lawyers
- Judges
- Police
- Administrators

Each dashboard is designed around its specific workflow and responsibilities.

---

## End-to-End Case Management

Full case lifecycle support from:
- Initial filing
- Hearing management
- Evidence uploads
- Timeline tracking
- Final orders

---

## Evidence Vault

Structured digital evidence uploads with SHA-256 hash verification, creating tamper-proof and legally admissible records.

---

## Digital FIR Handling

Police can upload FIRs digitally. AI automatically generates:
- FIR summaries
- Draft charge sheets
- Structured legal analysis

---

## Virtual Courtrooms

Native WebRTC-based secure virtual hearings integrated directly into the platform.

---

## Secure Authentication

JWT-based stateless authentication using Spring Security with:
- Role-based access control
- Request filtering
- Google OAuth2 SSO authentication
- Secure JWT issuance after OAuth login

<hr/>

# Tech Stack

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

# Quick Start

For complete setup instructions, environment configuration, and Docker deployment details, refer to the **[Detailed Setup Guide](./docs/setup.md)**.

At a high level, the platform consists of three services that need to run concurrently:

| Service | Directory | Command |
|---|---|---|
| Frontend | `frontend/nyaysetu-frontend/` | `npm install && npm run dev` |
| Backend | `backend/nyaysetu-backend/` | `mvn spring-boot:run` |
| NLP Orchestrator | `nlp-orchestrator/` | `uvicorn main:app --reload` |

---

## Prerequisites

Before running the project, ensure the following are installed:

- Node.js >= 20
- Java 17
- Maven 3.9+
- PostgreSQL 15+
- Python 3.12+

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your own values.

Example:

```bash
cp .env.example .env
```

<hr/>

# Google OAuth2 Authentication Setup

Nyay Saarthi supports secure Google Single Sign-On (SSO) authentication using Spring Security OAuth2 and JWT-based session management.

Users can:
- Continue with Google during login/signup
- Automatically create accounts using Google identity
- Receive Nyay Saarthi JWT authentication after successful login
- Be redirected securely to their role-specific dashboard

---

## Backend Environment Setup

Create a `.env` file inside:

```bash
backend/nyaysetu-backend/
```

Add:

```env
# Database Configuration
DB_NAME=nyaysetu
DB_USERNAME=postgres
DB_PASSWORD=postgres

# AI Service Keys
GROQ_API_KEY=
GOOGLE_GEMINI_API_KEY=

# JWT Secret
JWT_SECRET=

# Frontend URL
FRONTEND_URL=http://localhost:5173
FRONTEND_ORIGIN=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Spring Profile
SPRING_PROFILES_ACTIVE=dev

# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Frontend Environment Setup

Create a `.env` file inside:

```bash
frontend/nyaysetu-frontend/
```

Add:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=
```

---

## Frontend .env.example

Create:

```bash
frontend/nyaysetu-frontend/.env.example
```

Add:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=
```

---

# Google Cloud Console Setup

## Step 1 — Open Google Cloud Console

Visit:

```txt
https://console.cloud.google.com/
```

---

## Step 2 — Create Project

Create a new Google Cloud Project.

---

## Step 3 — Enable APIs

Enable:
- Google Identity Services
- OAuth APIs

---

## Step 4 — Create OAuth Credentials

Go to:

```txt
APIs & Services → Credentials
```

Create:
- OAuth Client ID

Application type:
- Web Application

---

## Step 5 — Add Authorized Redirect URI

Add:

```txt
http://localhost:8080/login/oauth2/code/google
```

---

## Step 6 — Add Authorized JavaScript Origin

Add:

```txt
http://localhost:5173
```

---

## Step 7 — Copy Credentials

Copy:
- Client ID
- Client Secret

Paste them into backend `.env`

---

# OAuth Login Flow

1. User clicks **Continue with Google**
2. Frontend redirects to Spring Security OAuth endpoint
3. Google authenticates the user
4. Backend:
   - validates Google identity
   - checks existing account
   - creates account if needed
   - links Google account
   - generates internal JWT
5. Frontend stores JWT securely
6. User is redirected to dashboard

---

# Supported Authentication Providers

| Provider | Status |
|---|---|
| Email/Password | ✅ Supported |
| Google OAuth2 | ✅ Supported |

---

# Security Notes

- OAuth users are stored with:
  - `auth_provider=GOOGLE`
  - unique `provider_id`
- Password field is nullable for OAuth users
- Existing email/password authentication remains fully functional
- JWT authentication is still used internally after OAuth login

<hr/>

# Documentation

| Document | Description |
|---|---|
| [Setup Guide](./docs/setup.md) | Full database setup, environment variables, and Docker configuration |
| [Architecture Overview](./docs/architecture/overview.md) | System design, component diagrams, and data flow |
| [AI Integration Guide](./AI_INTEGRATION_GUIDE.md) | Groq API and NLP orchestrator technical deep-dive |
| [API Documentation](./SYSTEM_DOCUMENTATION.md) | REST API endpoint documentation |
| [Contributing Guidelines](./CONTRIBUTING.md) | Branching strategy and PR workflow |

<hr/>

# Contributing

This project is part of **GSSoC (GirlScript Summer of Code) 2026**.

Contributions are welcome from everyone.

---

## Before Opening a Pull Request

| Requirement | Details |
|---|---|
| Read guidelines | Review `CONTRIBUTING.md` |
| Link issue | Mention issue number |
| Add screenshots | Required for UI changes |
| Sync branch | Rebase with main branch |
| Pass CI checks | Ensure lint/build/tests pass |

Browse issues and filter using:
- `good first issue`
- `enhancement`
- `bug`

<hr/>

# Contributors

<br/>

<a href="https://github.com/viru0909-dev/nyay-setu-working/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=viru0909-dev/nyay-setu-working" alt="Contributors" />
</a>

<br/><br/>

This chart updates automatically as contributors merge pull requests.

<hr/>

# License

License to be added.

All rights reserved until a formal license is declared.

<hr/>

<p align="center">
  Built with purpose for a more accessible Indian Judiciary.<br/>
  <em>Nyay Saarthi — न्याय हर किसी का अधिकार है।</em>
</p>