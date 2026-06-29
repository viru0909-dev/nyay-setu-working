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
- [System Architecture & Data Flow](#system-architecture--data-flow)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)

<hr/>

## Why Nyay Setu?

The Indian judiciary faces a systemic crisis that affects hundreds of millions of citizens:

| Problem | Scale |
|---|---|
| Pending court cases | **50+ Million** |
| Average time to resolve a civil case | **10–15 Years** |
| Citizens unable to afford legal representation | **Hundreds of Millions** |

Nyay Setu is built to address this directly. The platform removes the three biggest barriers to legal access — cost, complexity, and distance — by digitizing the entire judiciary workflow and placing an AI legal assistant at every citizen's fingertips.

<hr/>

# Key Features

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

## Project Structure

```text
nyay-setu-working/
│
├── frontend/                        # React + Vite frontend application
│   └── nyaysetu-frontend/           # Main frontend source code
│       ├── src/
│       │   ├── components/          # Reusable UI components
│       │   ├── pages/               # Application pages/routes
│       │   ├── services/            # API service handlers
│       │   ├── hooks/               # Custom React hooks
│       │   ├── store/               # Zustand/global state management
│       │   ├── utils/               # Helper and utility functions
│       │   └── assets/              # Images, icons, and static assets
│       ├── public/                  # Public static files
│       └── package.json             # Frontend dependencies and scripts
│
├── backend/                         # Spring Boot backend services
│   └── nyaysetu-backend/
│       ├── src/main/java/           # Main backend application source
│       ├── src/main/resources/      # Configuration files and resources
│       ├── src/test/                # Backend test cases
│       └── pom.xml                  # Maven configuration
│
├── nlp-orchestrator/                # FastAPI-based NLP orchestration service
│   ├── main.py                      # Main FastAPI application entry point
│   ├── services/                    # NLP and AI processing services
│   ├── routes/                      # API route handlers
│   ├── models/                      # AI/NLP models and schemas
│   └── requirements.txt             # Python dependencies
│
├── docs/                            # Project documentation
│   ├── architecture/                # Architecture and system design docs
│   ├── setup.md                     # Setup and installation guide
│   └── additional-guides/           # Supporting documentation
│
├── assets/                          # README banners, screenshots, and assets
│
├── .github/                         # GitHub workflows and community files
│   ├── workflows/                   # CI/CD GitHub Actions workflows
│   └── ISSUE_TEMPLATE/              # GitHub issue templates
│
├── CONTRIBUTING.md                  # Contribution guidelines
├── README.md                        # Main project documentation
├── LICENSE                          # Open-source license
└── SYSTEM_DOCUMENTATION.md          # API and system documentation
```

### Directory Overview

| Directory | Purpose |
|---|---|
| `frontend/` | Contains the React frontend application and UI components |
| `backend/` | Handles APIs, authentication, database access, and business logic |
| `nlp-orchestrator/` | Manages AI-powered legal assistance and NLP workflows |
| `docs/` | Contains setup guides, architecture diagrams, and technical documentation |
| `assets/` | Stores README images, banners, and other static assets |
| `.github/` | GitHub workflows, templates, and repository automation |

## System Architecture & Data Flow

Nyay Setu's architecture is a microservices ecosystem structured into three tiers:
1. **Frontend Tier (React + Vite)**: Renders role-based interactive dashboards, provides client-side WebRTC capabilities for virtual hearings, handles audio recording via browser APIs, and features a dynamic 3D Hologram Avatar component.
2. **Core Backend Tier (Spring Boot)**: Manages case creation, secure session handling, user credentials, document verification vaults (SHA-256 hashed), Bhashini Indic language services integration, and routes conversational requests.
3. **NLP & AI Tier (FastAPI)**: Coordinates advanced legal reasoning pipelines, decompiles multi-part queries, executes parallel web research on Indian Kanoon databases, synthesizes citations, and converts final summaries to Hinglish dialogue.

### High-Level Service Communication

The following diagram shows the primary communication flow between the Frontend, Spring Boot Backend, and Python NLP services.

```mermaid
flowchart LR

    User[User]

    Frontend[React + Vite Frontend]

    Backend[Spring Boot Backend]

    NLP[NLP Orchestrator<br/>FastAPI]

    LawGPT[LawGPT Service<br/>RAG Engine]

    DB[(PostgreSQL)]

    Groq[Groq API]
    Gemini[Gemini API]

    User --> Frontend

    Frontend --> Backend

    Backend --> DB

    Backend --> NLP

    Backend --> LawGPT

    NLP --> Groq
    NLP --> Gemini

    LawGPT --> Groq
```

**Flow Overview**

1. Users interact with the React frontend.
2. Requests are routed to the Spring Boot backend.
3. The backend manages authentication, case records, and database operations.
4. AI-related requests are forwarded to the Python NLP Orchestrator.
5. Legal knowledge retrieval is handled through the LawGPT RAG service.
6. The NLP services communicate with external AI providers such as Groq and Gemini to generate responses.

### Component Architecture & Interactions

```mermaid
graph TD
    %% Define Nodes
    subgraph FrontendApp [Frontend Tier: React / Vite]
        UI[User Dashboard & Chat UI]
        AV[3D Hologram Avatar]
        RTC[WebRTC Client]
    end

    subgraph BackendApp [Backend Tier: Spring Boot]
        Auth[Security & JWT filter]
        VF_Svc[Vakil Friend Service]
        Doc_Svc[Evidence Vault Service]
        Bhash_Svc[Bhashini Translation API Client]
        RAG_Proxy[RAG Proxy Client]
    end

    subgraph NLP_AI [NLP & AI Tier: Python / FastAPI]
        NLP_Orch[NLP Orchestrator: Port 8001]
        L_GPT[LawGPT Service: Port 8001]
        FAISS[(FAISS Vector Database)]
    end

    subgraph DatabaseTier [Data & Storage Tier]
        DB[(PostgreSQL Database)]
        Vault[Tamper-Proof Storage]
    end

    subgraph ExtAPIs [External Integrations]
        Groq[Groq API: Llama 3.1 & 3.3]
        Gemini[Google Gemini API: 1.5 Flash]
        Kanoon[Indian Kanoon API]
        Bhashini[Bhashini National Translation Service]
        Ollama[Local Ollama: llama3/gemma3]
    end

    %% Interactions
    UI -->|1. REST Request / Auth| Auth
    UI -->|2. Direct SSE Stream /research/deep| NLP_Orch
    AV -->|Lip-Sync Animation| UI

    Auth --> VF_Svc
    VF_Svc -->|Save sessions / Case diary| DB
    Doc_Svc -->|Write metadata / SHA-256 hash| DB
    Doc_Svc -->|Tamper-proof evidence| Vault

    VF_Svc -->|Retrieve legal context| RAG_Proxy
    RAG_Proxy -->|POST /context| L_GPT
    L_GPT -->|FAISS Semantic Index Lookup| FAISS

    VF_Svc -->|Translate to Indic / ASR| Bhash_Svc
    Bhash_Svc -->|Direct HTTP POST| Bhashini

    VF_Svc -->|Llama-3.1 Chat Completion / Fallback| Groq
    VF_Svc -->|Local AI Fallback| Ollama
    
    NLP_Orch -->|Decompose & Route| Groq
    NLP_Orch -->|Deep Reasoning| Gemini
    NLP_Orch -->|Search Judgments| Kanoon
    NLP_Orch -->|Hinglish Dialogue Translation| Groq
```

### Request and Response Data Flow Sequence

The system supports two primary request handling paradigms. The sequence diagram below shows both the standard conversational filing path (JWT-secured REST via Spring Boot) and the advanced deep legal research pipeline (direct client SSE connection to Python NLP-Orchestrator).

```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen / Litigant
    participant FE as Frontend (React UI)
    participant BE as Backend (Spring Boot)
    participant BHA as Bhashini Translation API
    participant GPT as LawGPT Service
    participant NLP as NLP Orchestrator
    participant DB as PostgreSQL
    participant AI as AI Services (Groq / Gemini / Ollama)

    %% Session A: Conversational Filing Flow
    Note over User, AI: Pathway A: Conversational Case Filing (Standard REST Flow)
    User->>FE: Submits query / voice input in Indic language
    FE->>BE: POST /api/vakil-friend/chat/{sessionId} (English or Indic)
    activate BE
    BE->>BHA: Speech-To-Text / Translate input query to English
    BHA-->>BE: Returns English translation
    BE->>GPT: POST /context (English query RAG lookup)
    activate GPT
    GPT-->>BE: Returns top-3 FAISS semantic document chunks
    deactivate GPT
    BE->>AI: Chat completion request (System Prompt + Legal Context + English query)
    activate AI
    AI-->>BE: Returns structured legal response (English)
    deactivate AI
    BE->>BHA: Translate response back to original Indic language
    BHA-->>BE: Returns translated response
    BE->>DB: Log encrypted interaction to Case Diary (SHA-256 protected)
    BE-->>FE: Return localized response & readyToFile heuristic flag
    deactivate BE
    FE-->>User: Renders text response & speaks via TTS / lip-syncs Avatar

    %% Session B: Deep Legal Research Flow
    Note over User, AI: Pathway B: Deep Legal Research (SSE Streaming Flow)
    User->>FE: Submits complex legal issue under Avatar page
    FE->>NLP: EventSource: POST /research/deep (Starts SSE Connection)
    activate NLP
    NLP->>AI: Stage 1: Detect domain & query complexity
    AI-->>NLP: Domain classification details
    NLP-->>FE: SSE: stage [understanding]
    NLP->>AI: Stage 2: Decompile into sub-questions & route
    AI-->>NLP: Sub-questions returned
    NLP-->>FE: SSE: sub_questions
    NLP->>AI: Stage 3: Query Indian Kanoon API for search criteria
    AI-->>NLP: Search results / Context returned
    NLP-->>FE: SSE: kanoon_results (Top citations)
    NLP->>AI: Stage 4: Run Parallel Research (Groq / Gemini)
    AI-->>NLP: Streaming sub-answers / reasoning
    NLP-->>FE: SSE: reasoning (Real-time token chunks)
    NLP->>AI: Stage 5: Verdict & synthesis (Verify citations + Convert to Hinglish)
    AI-->>NLP: Final Hinglish dialogue + validated markdown
    NLP-->>FE: SSE: final (Markdown, Hinglish audio dialogue, citations)
    NLP-->>FE: SSE: done
    deactivate NLP
    FE-->>User: Streams markdown verdict to screen & speaks Hinglish speech via Avatar
```

<hr/>

## API Versioning Strategy

This project implements a robust API versioning strategy starting from `v1`. 
- The stable release of our APIs is accessible under the `/api/v1/` prefix.
- A global `WebMvcConfigurer` automatically prefixes all backend controllers. 
- Any future breaking changes will be introduced under a new version (e.g., `/api/v2/`), ensuring backward compatibility for existing client applications.

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

---

### Getting Started
| Document | Description |
|---|---|
| [API Quick Start](./API_QUICKSTART.md) | 5-minute introduction to APIs (start here!) |
| [Setup Guide](./docs/setup.md) | Full database setup, environment variables, and Docker configuration |
| [Architecture Overview](./docs/architecture/overview.md) | System design, component diagrams, and data flow |

### API Documentation & Integration
| Document | Description |
|---|---|
| [OpenAPI/Swagger Spec](./openapi.yaml) | Complete API specification in OpenAPI 3.0 format |
| [API Testing Guide](./API_TESTING_GUIDE.md) | Comprehensive guide for testing APIs with Postman, cURL, Python, JavaScript |
| [API Endpoints Reference](./API_ENDPOINTS_COMPREHENSIVE.md) | Detailed documentation of all 100+ endpoints with request/response schemas |
| [API Quick Reference](./API_QUICK_REFERENCE.md) | Quick lookup table for endpoints by user role and service |
| [API Integration Checklist](./API_INTEGRATION_CHECKLIST.md) | Step-by-step checklist for integrating APIs into applications |
| [Postman Collection](./Nyay_Setu_API_Collection.postman_collection.json) | Ready-to-import Postman collection with all endpoints and examples |

### Additional Resources
| Document | Description |
|---|---|
| [AI Integration Guide](./AI_INTEGRATION_GUIDE.md) | Groq API and NLP orchestrator technical deep-dive |
| [API Documentation](./SYSTEM_DOCUMENTATION.md) | All REST endpoints with request and response specifications |
| [Postman Collection](./postman_collection.json) | Postman collection (v2.1) for testing Spring Boot & Python APIs |
| [OpenAPI Specification](./docs/openapi.yaml) | OpenAPI 3.0 YAML spec for all endpoints |
| [Contributing Guidelines](./CONTRIBUTING.md) | Branching strategy, commit conventions, and PR workflow |

### API Testing

To easily test the backend APIs:
1. **Import the Postman Collection**: Import the `postman_collection.json` file located in the project root into Postman.
2. **Configure Environment Variables**:
   - `baseUrl`: Set to `http://localhost:8080` (Spring Boot backend)
   - `nlpUrl`: Set to `http://localhost:8001` (Python services)
   - `bearerToken`: Set to the JWT token returned after registering/logging in.
3. **Authentication**: All authenticated endpoints automatically inherit the Bearer Token from the collection properties. Simply register or login via the `Authentication` folder, copy the `token` (or `accessToken`), and save it in the `bearerToken` variable.
4. **OpenAPI Spec**: You can also import `docs/openapi.yaml` into Swagger Editor or your preferred OpenAPI client to visualize and interact with the endpoints.

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

## Troubleshooting

### Common Setup Issues

#### 1. npm install fails
- Ensure Node.js version is `>= 20`
- Delete `node_modules` and reinstall dependencies:

```bash
rm -rf node_modules
npm install
```

---

#### 2. PostgreSQL connection issues
- Verify PostgreSQL service is running
- Check database credentials in `.env`
- Ensure database and user are created properly

---

#### 3. Java version mismatch
Verify Java version:

```bash
java -version
```

Ensure Java 17 is installed and configured correctly.

---

#### 4. Missing environment variables
- Copy `.env.example` to `.env`
- Fill all required variables before starting services

---

#### 5. Backend server not starting
- Ensure PostgreSQL is running
- Verify Maven installation:

```bash
mvn -version
```

- Check all dependencies are installed properly

---

#### 6. Port already in use
Stop conflicting processes or use different ports.

Example:

```bash
npx kill-port 3000
```

## Contributors

<!-- CONTRIBUTORS_START -->
<a href="https://github.com/2024itb047samata"><img src="https://github.com/2024itb047samata.png" width="50px" loading="lazy" title="2024itb047samata" style="border-radius:50%;margin:5px;" alt="2024itb047samata" /></a><a href="https://github.com/AarnaMahajan468"><img src="https://github.com/AarnaMahajan468.png" width="50px" loading="lazy" title="AarnaMahajan468" style="border-radius:50%;margin:5px;" alt="AarnaMahajan468" /></a><a href="https://github.com/Ace-2504"><img src="https://github.com/Ace-2504.png" width="50px" loading="lazy" title="Ace-2504" style="border-radius:50%;margin:5px;" alt="Ace-2504" /></a><a href="https://github.com/AdityaSrivastava-07"><img src="https://github.com/AdityaSrivastava-07.png" width="50px" loading="lazy" title="AdityaSrivastava-07" style="border-radius:50%;margin:5px;" alt="AdityaSrivastava-07" /></a><a href="https://github.com/Akanksha-Shahi"><img src="https://github.com/Akanksha-Shahi.png" width="50px" loading="lazy" title="Akanksha-Shahi" style="border-radius:50%;margin:5px;" alt="Akanksha-Shahi" /></a><a href="https://github.com/Akshita-2307"><img src="https://github.com/Akshita-2307.png" width="50px" loading="lazy" title="Akshita-2307" style="border-radius:50%;margin:5px;" alt="Akshita-2307" /></a><a href="https://github.com/Althafdudekula"><img src="https://github.com/Althafdudekula.png" width="50px" loading="lazy" title="Althafdudekula" style="border-radius:50%;margin:5px;" alt="Althafdudekula" /></a><a href="https://github.com/An16og"><img src="https://github.com/An16og.png" width="50px" loading="lazy" title="An16og" style="border-radius:50%;margin:5px;" alt="An16og" /></a><a href="https://github.com/AnanyaSingh656"><img src="https://github.com/AnanyaSingh656.png" width="50px" loading="lazy" title="AnanyaSingh656" style="border-radius:50%;margin:5px;" alt="AnanyaSingh656" /></a><a href="https://github.com/Ankush-ai"><img src="https://github.com/Ankush-ai.png" width="50px" loading="lazy" title="Ankush-ai" style="border-radius:50%;margin:5px;" alt="Ankush-ai" /></a><a href="https://github.com/AnupriyaSaxena28"><img src="https://github.com/AnupriyaSaxena28.png" width="50px" loading="lazy" title="AnupriyaSaxena28" style="border-radius:50%;margin:5px;" alt="AnupriyaSaxena28" /></a><a href="https://github.com/Arpita01-work"><img src="https://github.com/Arpita01-work.png" width="50px" loading="lazy" title="Arpita01-work" style="border-radius:50%;margin:5px;" alt="Arpita01-work" /></a><a href="https://github.com/Ayushia5"><img src="https://github.com/Ayushia5.png" width="50px" loading="lazy" title="Ayushia5" style="border-radius:50%;margin:5px;" alt="Ayushia5" /></a><a href="https://github.com/C4aZy"><img src="https://github.com/C4aZy.png" width="50px" loading="lazy" title="C4aZy" style="border-radius:50%;margin:5px;" alt="C4aZy" /></a><a href="https://github.com/Chakshu-Bamotra"><img src="https://github.com/Chakshu-Bamotra.png" width="50px" loading="lazy" title="Chakshu-Bamotra" style="border-radius:50%;margin:5px;" alt="Chakshu-Bamotra" /></a><a href="https://github.com/Chitranshu0"><img src="https://github.com/Chitranshu0.png" width="50px" loading="lazy" title="Chitranshu0" style="border-radius:50%;margin:5px;" alt="Chitranshu0" /></a><a href="https://github.com/CodeBox-commits"><img src="https://github.com/CodeBox-commits.png" width="50px" loading="lazy" title="CodeBox-commits" style="border-radius:50%;margin:5px;" alt="CodeBox-commits" /></a><a href="https://github.com/Daria872"><img src="https://github.com/Daria872.png" width="50px" loading="lazy" title="Daria872" style="border-radius:50%;margin:5px;" alt="Daria872" /></a><a href="https://github.com/DarkSorcerer14"><img src="https://github.com/DarkSorcerer14.png" width="50px" loading="lazy" title="DarkSorcerer14" style="border-radius:50%;margin:5px;" alt="DarkSorcerer14" /></a><a href="https://github.com/Dharshin1"><img src="https://github.com/Dharshin1.png" width="50px" loading="lazy" title="Dharshin1" style="border-radius:50%;margin:5px;" alt="Dharshin1" /></a><a href="https://github.com/DharshiniPujarolla"><img src="https://github.com/DharshiniPujarolla.png" width="50px" loading="lazy" title="DharshiniPujarolla" style="border-radius:50%;margin:5px;" alt="DharshiniPujarolla" /></a><a href="https://github.com/Dhyan-S-Kanapadi"><img src="https://github.com/Dhyan-S-Kanapadi.png" width="50px" loading="lazy" title="Dhyan-S-Kanapadi" style="border-radius:50%;margin:5px;" alt="Dhyan-S-Kanapadi" /></a><a href="https://github.com/DivyaSreenijaKasa"><img src="https://github.com/DivyaSreenijaKasa.png" width="50px" loading="lazy" title="DivyaSreenijaKasa" style="border-radius:50%;margin:5px;" alt="DivyaSreenijaKasa" /></a><a href="https://github.com/Dushyantcoder07"><img src="https://github.com/Dushyantcoder07.png" width="50px" loading="lazy" title="Dushyantcoder07" style="border-radius:50%;margin:5px;" alt="Dushyantcoder07" /></a><a href="https://github.com/Gauravcodesbyheart"><img src="https://github.com/Gauravcodesbyheart.png" width="50px" loading="lazy" title="Gauravcodesbyheart" style="border-radius:50%;margin:5px;" alt="Gauravcodesbyheart" /></a><a href="https://github.com/HARSHP-16"><img src="https://github.com/HARSHP-16.png" width="50px" loading="lazy" title="HARSHP-16" style="border-radius:50%;margin:5px;" alt="HARSHP-16" /></a><a href="https://github.com/Harshithk951"><img src="https://github.com/Harshithk951.png" width="50px" loading="lazy" title="Harshithk951" style="border-radius:50%;margin:5px;" alt="Harshithk951" /></a><a href="https://github.com/Hridayesh68"><img src="https://github.com/Hridayesh68.png" width="50px" loading="lazy" title="Hridayesh68" style="border-radius:50%;margin:5px;" alt="Hridayesh68" /></a><a href="https://github.com/Janeeshareddy"><img src="https://github.com/Janeeshareddy.png" width="50px" loading="lazy" title="Janeeshareddy" style="border-radius:50%;margin:5px;" alt="Janeeshareddy" /></a><a href="https://github.com/Katariyajiya"><img src="https://github.com/Katariyajiya.png" width="50px" loading="lazy" title="Katariyajiya" style="border-radius:50%;margin:5px;" alt="Katariyajiya" /></a><a href="https://github.com/MahalaxmiKannan"><img src="https://github.com/MahalaxmiKannan.png" width="50px" loading="lazy" title="MahalaxmiKannan" style="border-radius:50%;margin:5px;" alt="MahalaxmiKannan" /></a><a href="https://github.com/Mansi0905"><img src="https://github.com/Mansi0905.png" width="50px" loading="lazy" title="Mansi0905" style="border-radius:50%;margin:5px;" alt="Mansi0905" /></a><a href="https://github.com/Matanki-sk"><img src="https://github.com/Matanki-sk.png" width="50px" loading="lazy" title="Matanki-sk" style="border-radius:50%;margin:5px;" alt="Matanki-sk" /></a><a href="https://github.com/MedhaMishra99"><img src="https://github.com/MedhaMishra99.png" width="50px" loading="lazy" title="MedhaMishra99" style="border-radius:50%;margin:5px;" alt="MedhaMishra99" /></a><a href="https://github.com/MohammedGhallab"><img src="https://github.com/MohammedGhallab.png" width="50px" loading="lazy" title="MohammedGhallab" style="border-radius:50%;margin:5px;" alt="MohammedGhallab" /></a><a href="https://github.com/Mohammedsami001"><img src="https://github.com/Mohammedsami001.png" width="50px" loading="lazy" title="Mohammedsami001" style="border-radius:50%;margin:5px;" alt="Mohammedsami001" /></a><a href="https://github.com/Mohitswamii"><img src="https://github.com/Mohitswamii.png" width="50px" loading="lazy" title="Mohitswamii" style="border-radius:50%;margin:5px;" alt="Mohitswamii" /></a><a href="https://github.com/Nandika32"><img src="https://github.com/Nandika32.png" width="50px" loading="lazy" title="Nandika32" style="border-radius:50%;margin:5px;" alt="Nandika32" /></a><a href="https://github.com/NehaKuppili"><img src="https://github.com/NehaKuppili.png" width="50px" loading="lazy" title="NehaKuppili" style="border-radius:50%;margin:5px;" alt="NehaKuppili" /></a><a href="https://github.com/Nikhil-0710"><img src="https://github.com/Nikhil-0710.png" width="50px" loading="lazy" title="Nikhil-0710" style="border-radius:50%;margin:5px;" alt="Nikhil-0710" /></a><a href="https://github.com/OmenSummon"><img src="https://github.com/OmenSummon.png" width="50px" loading="lazy" title="OmenSummon" style="border-radius:50%;margin:5px;" alt="OmenSummon" /></a><a href="https://github.com/Pcmhacker-piro"><img src="https://github.com/Pcmhacker-piro.png" width="50px" loading="lazy" title="Pcmhacker-piro" style="border-radius:50%;margin:5px;" alt="Pcmhacker-piro" /></a><a href="https://github.com/PoojaS-1711"><img src="https://github.com/PoojaS-1711.png" width="50px" loading="lazy" title="PoojaS-1711" style="border-radius:50%;margin:5px;" alt="PoojaS-1711" /></a><a href="https://github.com/PranavAgarkar07"><img src="https://github.com/PranavAgarkar07.png" width="50px" loading="lazy" title="PranavAgarkar07" style="border-radius:50%;margin:5px;" alt="PranavAgarkar07" /></a><a href="https://github.com/PranshuPujara"><img src="https://github.com/PranshuPujara.png" width="50px" loading="lazy" title="PranshuPujara" style="border-radius:50%;margin:5px;" alt="PranshuPujara" /></a><a href="https://github.com/PrasadSanap"><img src="https://github.com/PrasadSanap.png" width="50px" loading="lazy" title="PrasadSanap" style="border-radius:50%;margin:5px;" alt="PrasadSanap" /></a><a href="https://github.com/Priyanshi-untitled"><img src="https://github.com/Priyanshi-untitled.png" width="50px" loading="lazy" title="Priyanshi-untitled" style="border-radius:50%;margin:5px;" alt="Priyanshi-untitled" /></a><a href="https://github.com/Priyanshu1-62"><img src="https://github.com/Priyanshu1-62.png" width="50px" loading="lazy" title="Priyanshu1-62" style="border-radius:50%;margin:5px;" alt="Priyanshu1-62" /></a><a href="https://github.com/RomanoHeur"><img src="https://github.com/RomanoHeur.png" width="50px" loading="lazy" title="RomanoHeur" style="border-radius:50%;margin:5px;" alt="RomanoHeur" /></a><a href="https://github.com/S0412-2007"><img src="https://github.com/S0412-2007.png" width="50px" loading="lazy" title="S0412-2007" style="border-radius:50%;margin:5px;" alt="S0412-2007" /></a><a href="https://github.com/SOHAMSHUKLA-7977"><img src="https://github.com/SOHAMSHUKLA-7977.png" width="50px" loading="lazy" title="SOHAMSHUKLA-7977" style="border-radius:50%;margin:5px;" alt="SOHAMSHUKLA-7977" /></a><a href="https://github.com/SagarGupta-30"><img src="https://github.com/SagarGupta-30.png" width="50px" loading="lazy" title="SagarGupta-30" style="border-radius:50%;margin:5px;" alt="SagarGupta-30" /></a><a href="https://github.com/Sahir-2415"><img src="https://github.com/Sahir-2415.png" width="50px" loading="lazy" title="Sahir-2415" style="border-radius:50%;margin:5px;" alt="Sahir-2415" /></a><a href="https://github.com/SaishWadnere"><img src="https://github.com/SaishWadnere.png" width="50px" loading="lazy" title="SaishWadnere" style="border-radius:50%;margin:5px;" alt="SaishWadnere" /></a><a href="https://github.com/SakshiHanwat"><img src="https://github.com/SakshiHanwat.png" width="50px" loading="lazy" title="SakshiHanwat" style="border-radius:50%;margin:5px;" alt="SakshiHanwat" /></a><a href="https://github.com/ScarsAndSource"><img src="https://github.com/ScarsAndSource.png" width="50px" loading="lazy" title="ScarsAndSource" style="border-radius:50%;margin:5px;" alt="ScarsAndSource" /></a><a href="https://github.com/Shalini828"><img src="https://github.com/Shalini828.png" width="50px" loading="lazy" title="Shalini828" style="border-radius:50%;margin:5px;" alt="Shalini828" /></a><a href="https://github.com/Shanidhya01"><img src="https://github.com/Shanidhya01.png" width="50px" loading="lazy" title="Shanidhya01" style="border-radius:50%;margin:5px;" alt="Shanidhya01" /></a><a href="https://github.com/ShivanshiSharma05"><img src="https://github.com/ShivanshiSharma05.png" width="50px" loading="lazy" title="ShivanshiSharma05" style="border-radius:50%;margin:5px;" alt="ShivanshiSharma05" /></a><a href="https://github.com/Shraddha3838"><img src="https://github.com/Shraddha3838.png" width="50px" loading="lazy" title="Shraddha3838" style="border-radius:50%;margin:5px;" alt="Shraddha3838" /></a><a href="https://github.com/Shreya2977"><img src="https://github.com/Shreya2977.png" width="50px" loading="lazy" title="Shreya2977" style="border-radius:50%;margin:5px;" alt="Shreya2977" /></a><a href="https://github.com/Shruti1420"><img src="https://github.com/Shruti1420.png" width="50px" loading="lazy" title="Shruti1420" style="border-radius:50%;margin:5px;" alt="Shruti1420" /></a><a href="https://github.com/Siddhant2713"><img src="https://github.com/Siddhant2713.png" width="50px" loading="lazy" title="Siddhant2713" style="border-radius:50%;margin:5px;" alt="Siddhant2713" /></a><a href="https://github.com/Sneha29714"><img src="https://github.com/Sneha29714.png" width="50px" loading="lazy" title="Sneha29714" style="border-radius:50%;margin:5px;" alt="Sneha29714" /></a><a href="https://github.com/Stewartsson"><img src="https://github.com/Stewartsson.png" width="50px" loading="lazy" title="Stewartsson" style="border-radius:50%;margin:5px;" alt="Stewartsson" /></a><a href="https://github.com/Suhani-prog-alt"><img src="https://github.com/Suhani-prog-alt.png" width="50px" loading="lazy" title="Suhani-prog-alt" style="border-radius:50%;margin:5px;" alt="Suhani-prog-alt" /></a><a href="https://github.com/Sujith-RMD"><img src="https://github.com/Sujith-RMD.png" width="50px" loading="lazy" title="Sujith-RMD" style="border-radius:50%;margin:5px;" alt="Sujith-RMD" /></a><a href="https://github.com/TheOneAbovELL"><img src="https://github.com/TheOneAbovELL.png" width="50px" loading="lazy" title="TheOneAbovELL" style="border-radius:50%;margin:5px;" alt="TheOneAbovELL" /></a><a href="https://github.com/Varshinigurram"><img src="https://github.com/Varshinigurram.png" width="50px" loading="lazy" title="Varshinigurram" style="border-radius:50%;margin:5px;" alt="Varshinigurram" /></a><a href="https://github.com/VasuBhakt"><img src="https://github.com/VasuBhakt.png" width="50px" loading="lazy" title="VasuBhakt" style="border-radius:50%;margin:5px;" alt="VasuBhakt" /></a><a href="https://github.com/Viidhii19"><img src="https://github.com/Viidhii19.png" width="50px" loading="lazy" title="Viidhii19" style="border-radius:50%;margin:5px;" alt="Viidhii19" /></a><a href="https://github.com/Xploit-Ghost"><img src="https://github.com/Xploit-Ghost.png" width="50px" loading="lazy" title="Xploit-Ghost" style="border-radius:50%;margin:5px;" alt="Xploit-Ghost" /></a><a href="https://github.com/ZainabTravadi"><img src="https://github.com/ZainabTravadi.png" width="50px" loading="lazy" title="ZainabTravadi" style="border-radius:50%;margin:5px;" alt="ZainabTravadi" /></a><a href="https://github.com/aaryaj154"><img src="https://github.com/aaryaj154.png" width="50px" loading="lazy" title="aaryaj154" style="border-radius:50%;margin:5px;" alt="aaryaj154" /></a><a href="https://github.com/abhi-nav-25"><img src="https://github.com/abhi-nav-25.png" width="50px" loading="lazy" title="abhi-nav-25" style="border-radius:50%;margin:5px;" alt="abhi-nav-25" /></a><a href="https://github.com/abhijeetm1526"><img src="https://github.com/abhijeetm1526.png" width="50px" loading="lazy" title="abhijeetm1526" style="border-radius:50%;margin:5px;" alt="abhijeetm1526" /></a><a href="https://github.com/aisshwaryaa8-collab"><img src="https://github.com/aisshwaryaa8-collab.png" width="50px" loading="lazy" title="aisshwaryaa8-collab" style="border-radius:50%;margin:5px;" alt="aisshwaryaa8-collab" /></a><a href="https://github.com/ajitkumarsaini02"><img src="https://github.com/ajitkumarsaini02.png" width="50px" loading="lazy" title="ajitkumarsaini02" style="border-radius:50%;margin:5px;" alt="ajitkumarsaini02" /></a><a href="https://github.com/alok844937-design"><img src="https://github.com/alok844937-design.png" width="50px" loading="lazy" title="alok844937-design" style="border-radius:50%;margin:5px;" alt="alok844937-design" /></a><a href="https://github.com/amanyadavkr098-bot"><img src="https://github.com/amanyadavkr098-bot.png" width="50px" loading="lazy" title="amanyadavkr098-bot" style="border-radius:50%;margin:5px;" alt="amanyadavkr098-bot" /></a><a href="https://github.com/amritbej"><img src="https://github.com/amritbej.png" width="50px" loading="lazy" title="amritbej" style="border-radius:50%;margin:5px;" alt="amritbej" /></a><a href="https://github.com/anirudhagarwal-dev"><img src="https://github.com/anirudhagarwal-dev.png" width="50px" loading="lazy" title="anirudhagarwal-dev" style="border-radius:50%;margin:5px;" alt="anirudhagarwal-dev" /></a><a href="https://github.com/anjalikumari45"><img src="https://github.com/anjalikumari45.png" width="50px" loading="lazy" title="anjalikumari45" style="border-radius:50%;margin:5px;" alt="anjalikumari45" /></a><a href="https://github.com/anujsharma8d"><img src="https://github.com/anujsharma8d.png" width="50px" loading="lazy" title="anujsharma8d" style="border-radius:50%;margin:5px;" alt="anujsharma8d" /></a><a href="https://github.com/apurvaKhade25"><img src="https://github.com/apurvaKhade25.png" width="50px" loading="lazy" title="apurvaKhade25" style="border-radius:50%;margin:5px;" alt="apurvaKhade25" /></a><a href="https://github.com/aryan-nmaurya"><img src="https://github.com/aryan-nmaurya.png" width="50px" loading="lazy" title="aryan-nmaurya" style="border-radius:50%;margin:5px;" alt="aryan-nmaurya" /></a><a href="https://github.com/aryanchoudharyyyy"><img src="https://github.com/aryanchoudharyyyy.png" width="50px" loading="lazy" title="aryanchoudharyyyy" style="border-radius:50%;margin:5px;" alt="aryanchoudharyyyy" /></a><a href="https://github.com/aryantripathi130306-droid"><img src="https://github.com/aryantripathi130306-droid.png" width="50px" loading="lazy" title="aryantripathi130306-droid" style="border-radius:50%;margin:5px;" alt="aryantripathi130306-droid" /></a><a href="https://github.com/asaishivanand-design"><img src="https://github.com/asaishivanand-design.png" width="50px" loading="lazy" title="asaishivanand-design" style="border-radius:50%;margin:5px;" alt="asaishivanand-design" /></a><a href="https://github.com/bhavyajain0810"><img src="https://github.com/bhavyajain0810.png" width="50px" loading="lazy" title="bhavyajain0810" style="border-radius:50%;margin:5px;" alt="bhavyajain0810" /></a><a href="https://github.com/chandni5033"><img src="https://github.com/chandni5033.png" width="50px" loading="lazy" title="chandni5033" style="border-radius:50%;margin:5px;" alt="chandni5033" /></a><a href="https://github.com/cosmoqain459"><img src="https://github.com/cosmoqain459.png" width="50px" loading="lazy" title="cosmoqain459" style="border-radius:50%;margin:5px;" alt="cosmoqain459" /></a><a href="https://github.com/devansh-g10"><img src="https://github.com/devansh-g10.png" width="50px" loading="lazy" title="devansh-g10" style="border-radius:50%;margin:5px;" alt="devansh-g10" /></a><a href="https://github.com/dhiyaroopyabr"><img src="https://github.com/dhiyaroopyabr.png" width="50px" loading="lazy" title="dhiyaroopyabr" style="border-radius:50%;margin:5px;" alt="dhiyaroopyabr" /></a><a href="https://github.com/dishu305"><img src="https://github.com/dishu305.png" width="50px" loading="lazy" title="dishu305" style="border-radius:50%;margin:5px;" alt="dishu305" /></a><a href="https://github.com/divyaa404"><img src="https://github.com/divyaa404.png" width="50px" loading="lazy" title="divyaa404" style="border-radius:50%;margin:5px;" alt="divyaa404" /></a><a href="https://github.com/diyajn"><img src="https://github.com/diyajn.png" width="50px" loading="lazy" title="diyajn" style="border-radius:50%;margin:5px;" alt="diyajn" /></a><a href="https://github.com/ghostreindeer09"><img src="https://github.com/ghostreindeer09.png" width="50px" loading="lazy" title="ghostreindeer09" style="border-radius:50%;margin:5px;" alt="ghostreindeer09" /></a><a href="https://github.com/hari2k7"><img src="https://github.com/hari2k7.png" width="50px" loading="lazy" title="hari2k7" style="border-radius:50%;margin:5px;" alt="hari2k7" /></a><a href="https://github.com/iRahmanG"><img src="https://github.com/iRahmanG.png" width="50px" loading="lazy" title="iRahmanG" style="border-radius:50%;margin:5px;" alt="iRahmanG" /></a><a href="https://github.com/iamdeepaktiwari08"><img src="https://github.com/iamdeepaktiwari08.png" width="50px" loading="lazy" title="iamdeepaktiwari08" style="border-radius:50%;margin:5px;" alt="iamdeepaktiwari08" /></a><a href="https://github.com/ida-jemi"><img src="https://github.com/ida-jemi.png" width="50px" loading="lazy" title="ida-jemi" style="border-radius:50%;margin:5px;" alt="ida-jemi" /></a><a href="https://github.com/ionfwsrijan"><img src="https://github.com/ionfwsrijan.png" width="50px" loading="lazy" title="ionfwsrijan" style="border-radius:50%;margin:5px;" alt="ionfwsrijan" /></a><a href="https://github.com/ishaan-khandelwal"><img src="https://github.com/ishaan-khandelwal.png" width="50px" loading="lazy" title="ishaan-khandelwal" style="border-radius:50%;margin:5px;" alt="ishaan-khandelwal" /></a><a href="https://github.com/itsdakshjain"><img src="https://github.com/itsdakshjain.png" width="50px" loading="lazy" title="itsdakshjain" style="border-radius:50%;margin:5px;" alt="itsdakshjain" /></a><a href="https://github.com/jadon19"><img src="https://github.com/jadon19.png" width="50px" loading="lazy" title="jadon19" style="border-radius:50%;margin:5px;" alt="jadon19" /></a><a href="https://github.com/janievinod"><img src="https://github.com/janievinod.png" width="50px" loading="lazy" title="janievinod" style="border-radius:50%;margin:5px;" alt="janievinod" /></a><a href="https://github.com/jayanktyagi"><img src="https://github.com/jayanktyagi.png" width="50px" loading="lazy" title="jayanktyagi" style="border-radius:50%;margin:5px;" alt="jayanktyagi" /></a><a href="https://github.com/kareena0229"><img src="https://github.com/kareena0229.png" width="50px" loading="lazy" title="kareena0229" style="border-radius:50%;margin:5px;" alt="kareena0229" /></a><a href="https://github.com/karrisanthoshigayatri"><img src="https://github.com/karrisanthoshigayatri.png" width="50px" loading="lazy" title="karrisanthoshigayatri" style="border-radius:50%;margin:5px;" alt="karrisanthoshigayatri" /></a><a href="https://github.com/kd717913-spec"><img src="https://github.com/kd717913-spec.png" width="50px" loading="lazy" title="kd717913-spec" style="border-radius:50%;margin:5px;" alt="kd717913-spec" /></a><a href="https://github.com/khushi897920-lang"><img src="https://github.com/khushi897920-lang.png" width="50px" loading="lazy" title="khushi897920-lang" style="border-radius:50%;margin:5px;" alt="khushi897920-lang" /></a><a href="https://github.com/knoxiboy"><img src="https://github.com/knoxiboy.png" width="50px" loading="lazy" title="knoxiboy" style="border-radius:50%;margin:5px;" alt="knoxiboy" /></a><a href="https://github.com/krishsharma-code"><img src="https://github.com/krishsharma-code.png" width="50px" loading="lazy" title="krishsharma-code" style="border-radius:50%;margin:5px;" alt="krishsharma-code" /></a><a href="https://github.com/kriti260"><img src="https://github.com/kriti260.png" width="50px" loading="lazy" title="kriti260" style="border-radius:50%;margin:5px;" alt="kriti260" /></a><a href="https://github.com/lakshaygujjar273-cys"><img src="https://github.com/lakshaygujjar273-cys.png" width="50px" loading="lazy" title="lakshaygujjar273-cys" style="border-radius:50%;margin:5px;" alt="lakshaygujjar273-cys" /></a><a href="https://github.com/lakshit-ahuja-01"><img src="https://github.com/lakshit-ahuja-01.png" width="50px" loading="lazy" title="lakshit-ahuja-01" style="border-radius:50%;margin:5px;" alt="lakshit-ahuja-01" /></a><a href="https://github.com/lavanya1486"><img src="https://github.com/lavanya1486.png" width="50px" loading="lazy" title="lavanya1486" style="border-radius:50%;margin:5px;" alt="lavanya1486" /></a><a href="https://github.com/madsysharma"><img src="https://github.com/madsysharma.png" width="50px" loading="lazy" title="madsysharma" style="border-radius:50%;margin:5px;" alt="madsysharma" /></a><a href="https://github.com/mayurikharkar"><img src="https://github.com/mayurikharkar.png" width="50px" loading="lazy" title="mayurikharkar" style="border-radius:50%;margin:5px;" alt="mayurikharkar" /></a><a href="https://github.com/mishhtachio"><img src="https://github.com/mishhtachio.png" width="50px" loading="lazy" title="mishhtachio" style="border-radius:50%;margin:5px;" alt="mishhtachio" /></a><a href="https://github.com/nandannikam"><img src="https://github.com/nandannikam.png" width="50px" loading="lazy" title="nandannikam" style="border-radius:50%;margin:5px;" alt="nandannikam" /></a><a href="https://github.com/nimkarprachi17"><img src="https://github.com/nimkarprachi17.png" width="50px" loading="lazy" title="nimkarprachi17" style="border-radius:50%;margin:5px;" alt="nimkarprachi17" /></a><a href="https://github.com/oshin-30"><img src="https://github.com/oshin-30.png" width="50px" loading="lazy" title="oshin-30" style="border-radius:50%;margin:5px;" alt="oshin-30" /></a><a href="https://github.com/pari-dubey1"><img src="https://github.com/pari-dubey1.png" width="50px" loading="lazy" title="pari-dubey1" style="border-radius:50%;margin:5px;" alt="pari-dubey1" /></a><a href="https://github.com/parulpaliwal01"><img src="https://github.com/parulpaliwal01.png" width="50px" loading="lazy" title="parulpaliwal01" style="border-radius:50%;margin:5px;" alt="parulpaliwal01" /></a><a href="https://github.com/paruuup"><img src="https://github.com/paruuup.png" width="50px" loading="lazy" title="paruuup" style="border-radius:50%;margin:5px;" alt="paruuup" /></a><a href="https://github.com/piyush10854"><img src="https://github.com/piyush10854.png" width="50px" loading="lazy" title="piyush10854" style="border-radius:50%;margin:5px;" alt="piyush10854" /></a><a href="https://github.com/pragya0129"><img src="https://github.com/pragya0129.png" width="50px" loading="lazy" title="pragya0129" style="border-radius:50%;margin:5px;" alt="pragya0129" /></a><a href="https://github.com/prithivika2007"><img src="https://github.com/prithivika2007.png" width="50px" loading="lazy" title="prithivika2007" style="border-radius:50%;margin:5px;" alt="prithivika2007" /></a><a href="https://github.com/prxsingh5058"><img src="https://github.com/prxsingh5058.png" width="50px" loading="lazy" title="prxsingh5058" style="border-radius:50%;margin:5px;" alt="prxsingh5058" /></a><a href="https://github.com/pulkit1245"><img src="https://github.com/pulkit1245.png" width="50px" loading="lazy" title="pulkit1245" style="border-radius:50%;margin:5px;" alt="pulkit1245" /></a><a href="https://github.com/radhepipaliya"><img src="https://github.com/radhepipaliya.png" width="50px" loading="lazy" title="radhepipaliya" style="border-radius:50%;margin:5px;" alt="radhepipaliya" /></a><a href="https://github.com/rajesh-puripanda"><img src="https://github.com/rajesh-puripanda.png" width="50px" loading="lazy" title="rajesh-puripanda" style="border-radius:50%;margin:5px;" alt="rajesh-puripanda" /></a><a href="https://github.com/rathan2511"><img src="https://github.com/rathan2511.png" width="50px" loading="lazy" title="rathan2511" style="border-radius:50%;margin:5px;" alt="rathan2511" /></a><a href="https://github.com/riddhimagupta2"><img src="https://github.com/riddhimagupta2.png" width="50px" loading="lazy" title="riddhimagupta2" style="border-radius:50%;margin:5px;" alt="riddhimagupta2" /></a><a href="https://github.com/rudra3007-pro"><img src="https://github.com/rudra3007-pro.png" width="50px" loading="lazy" title="rudra3007-pro" style="border-radius:50%;margin:5px;" alt="rudra3007-pro" /></a><a href="https://github.com/rutul2006"><img src="https://github.com/rutul2006.png" width="50px" loading="lazy" title="rutul2006" style="border-radius:50%;margin:5px;" alt="rutul2006" /></a><a href="https://github.com/saaahilhussain"><img src="https://github.com/saaahilhussain.png" width="50px" loading="lazy" title="saaahilhussain" style="border-radius:50%;margin:5px;" alt="saaahilhussain" /></a><a href="https://github.com/samee-06"><img src="https://github.com/samee-06.png" width="50px" loading="lazy" title="samee-06" style="border-radius:50%;margin:5px;" alt="samee-06" /></a><a href="https://github.com/samyyuukthaaa"><img src="https://github.com/samyyuukthaaa.png" width="50px" loading="lazy" title="samyyuukthaaa" style="border-radius:50%;margin:5px;" alt="samyyuukthaaa" /></a><a href="https://github.com/sat-06"><img src="https://github.com/sat-06.png" width="50px" loading="lazy" title="sat-06" style="border-radius:50%;margin:5px;" alt="sat-06" /></a><a href="https://github.com/sathwikhbhat"><img src="https://github.com/sathwikhbhat.png" width="50px" loading="lazy" title="sathwikhbhat" style="border-radius:50%;margin:5px;" alt="sathwikhbhat" /></a><a href="https://github.com/saurabhhhcodes"><img src="https://github.com/saurabhhhcodes.png" width="50px" loading="lazy" title="saurabhhhcodes" style="border-radius:50%;margin:5px;" alt="saurabhhhcodes" /></a><a href="https://github.com/shashanki-hub"><img src="https://github.com/shashanki-hub.png" width="50px" loading="lazy" title="shashanki-hub" style="border-radius:50%;margin:5px;" alt="shashanki-hub" /></a><a href="https://github.com/shivangii123"><img src="https://github.com/shivangii123.png" width="50px" loading="lazy" title="shivangii123" style="border-radius:50%;margin:5px;" alt="shivangii123" /></a><a href="https://github.com/shivashanker123"><img src="https://github.com/shivashanker123.png" width="50px" loading="lazy" title="shivashanker123" style="border-radius:50%;margin:5px;" alt="shivashanker123" /></a><a href="https://github.com/shreyAmritkar"><img src="https://github.com/shreyAmritkar.png" width="50px" loading="lazy" title="shreyAmritkar" style="border-radius:50%;margin:5px;" alt="shreyAmritkar" /></a><a href="https://github.com/shruti-porwal"><img src="https://github.com/shruti-porwal.png" width="50px" loading="lazy" title="shruti-porwal" style="border-radius:50%;margin:5px;" alt="shruti-porwal" /></a><a href="https://github.com/shrutisharma-sh"><img src="https://github.com/shrutisharma-sh.png" width="50px" loading="lazy" title="shrutisharma-sh" style="border-radius:50%;margin:5px;" alt="shrutisharma-sh" /></a><a href="https://github.com/shubhangisaxena953"><img src="https://github.com/shubhangisaxena953.png" width="50px" loading="lazy" title="shubhangisaxena953" style="border-radius:50%;margin:5px;" alt="shubhangisaxena953" /></a><a href="https://github.com/siddharth29sg"><img src="https://github.com/siddharth29sg.png" width="50px" loading="lazy" title="siddharth29sg" style="border-radius:50%;margin:5px;" alt="siddharth29sg" /></a><a href="https://github.com/soma-prem"><img src="https://github.com/soma-prem.png" width="50px" loading="lazy" title="soma-prem" style="border-radius:50%;margin:5px;" alt="soma-prem" /></a><a href="https://github.com/spandana-yellamelli"><img src="https://github.com/spandana-yellamelli.png" width="50px" loading="lazy" title="spandana-yellamelli" style="border-radius:50%;margin:5px;" alt="spandana-yellamelli" /></a><a href="https://github.com/sricharan-codes"><img src="https://github.com/sricharan-codes.png" width="50px" loading="lazy" title="sricharan-codes" style="border-radius:50%;margin:5px;" alt="sricharan-codes" /></a><a href="https://github.com/srisha4"><img src="https://github.com/srisha4.png" width="50px" loading="lazy" title="srisha4" style="border-radius:50%;margin:5px;" alt="srisha4" /></a><a href="https://github.com/sudeekshaballanda-hub"><img src="https://github.com/sudeekshaballanda-hub.png" width="50px" loading="lazy" title="sudeekshaballanda-hub" style="border-radius:50%;margin:5px;" alt="sudeekshaballanda-hub" /></a><a href="https://github.com/surajbharsakle07"><img src="https://github.com/surajbharsakle07.png" width="50px" loading="lazy" title="surajbharsakle07" style="border-radius:50%;margin:5px;" alt="surajbharsakle07" /></a><a href="https://github.com/techkey07"><img src="https://github.com/techkey07.png" width="50px" loading="lazy" title="techkey07" style="border-radius:50%;margin:5px;" alt="techkey07" /></a><a href="https://github.com/thakurakanksha288"><img src="https://github.com/thakurakanksha288.png" width="50px" loading="lazy" title="thakurakanksha288" style="border-radius:50%;margin:5px;" alt="thakurakanksha288" /></a><a href="https://github.com/ulsreall"><img src="https://github.com/ulsreall.png" width="50px" loading="lazy" title="ulsreall" style="border-radius:50%;margin:5px;" alt="ulsreall" /></a><a href="https://github.com/uppalriya371-blip"><img src="https://github.com/uppalriya371-blip.png" width="50px" loading="lazy" title="uppalriya371-blip" style="border-radius:50%;margin:5px;" alt="uppalriya371-blip" /></a><a href="https://github.com/vaishnavb06"><img src="https://github.com/vaishnavb06.png" width="50px" loading="lazy" title="vaishnavb06" style="border-radius:50%;margin:5px;" alt="vaishnavb06" /></a><a href="https://github.com/vansh-09"><img src="https://github.com/vansh-09.png" width="50px" loading="lazy" title="vansh-09" style="border-radius:50%;margin:5px;" alt="vansh-09" /></a><a href="https://github.com/vershajain"><img src="https://github.com/vershajain.png" width="50px" loading="lazy" title="vershajain" style="border-radius:50%;margin:5px;" alt="vershajain" /></a><a href="https://github.com/vikrantkulkarni07"><img src="https://github.com/vikrantkulkarni07.png" width="50px" loading="lazy" title="vikrantkulkarni07" style="border-radius:50%;margin:5px;" alt="vikrantkulkarni07" /></a><a href="https://github.com/vipul674"><img src="https://github.com/vipul674.png" width="50px" loading="lazy" title="vipul674" style="border-radius:50%;margin:5px;" alt="vipul674" /></a><a href="https://github.com/viru0909-dev"><img src="https://github.com/viru0909-dev.png" width="50px" loading="lazy" title="viru0909-dev" style="border-radius:50%;margin:5px;" alt="viru0909-dev" /></a><a href="https://github.com/vishireddy"><img src="https://github.com/vishireddy.png" width="50px" loading="lazy" title="vishireddy" style="border-radius:50%;margin:5px;" alt="vishireddy" /></a><a href="https://github.com/vivekktrivedi06-hue"><img src="https://github.com/vivekktrivedi06-hue.png" width="50px" loading="lazy" title="vivekktrivedi06-hue" style="border-radius:50%;margin:5px;" alt="vivekktrivedi06-hue" /></a><a href="https://github.com/yuvraj-k-singh"><img src="https://github.com/yuvraj-k-singh.png" width="50px" loading="lazy" title="yuvraj-k-singh" style="border-radius:50%;margin:5px;" alt="yuvraj-k-singh" /></a>
<!-- CONTRIBUTORS_END -->

Updates automatically as new contributors merge pull requests. 
Want to see your avatar here? [Pick up an issue](https://github.com/viru0909-dev/nyay-setu-working/issues) and start contributing.


## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for the full license text and guidelines on bulk-adding license headers to all source files in the repository.

<hr/>

<p align="center">
  Built with purpose for a more accessible Indian Judiciary.<br/>
  <em>Nyay Setu — न्याय हर किसी का अधिकार है।</em>
</p>

## Local Development Setup

### Prerequisites

- Node.js
- Java 17
- Maven
- Python 3.10+
- Git

---

### Clone Repository

```bash
git clone https://github.com/viru0909-dev/nyay-setu-working.git
cd nyay-setu-working
```

---

### Frontend Setup

```bash
cd frontend/nyaysetu-frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

### Backend Setup

```bash
cd backend/nyaysetu-backend
mvn spring-boot:run
```

Backend runs on:

```bash
http://localhost:8080
```

---

### NLP Service Setup

```bash
cd nlp-orchestrator
pip install -r requirements.txt
python main.py
```

---

### Common Issues

#### Login / Network Error

Ensure backend is running before starting frontend login flow.

#### Maven Errors

Always run Maven commands inside:

```bash
backend/nyaysetu-backend
```

#### Deployment Build Errors

Linux deployment environments are case-sensitive.
Ensure import paths exactly match filenames.


# Court Media Asynchronous Processing Pipeline

This microservice decouples resource-intensive video processing from the main application tier using an asynchronous worker pool, ensuring court rooms stay lag-free.

##  Features Implemented
- **Asynchronous Queueing:** Uses RabbitMQ decoupling to ingest files safely.
- **DLQ Fault Tolerance:** Configured a Dead Letter Queue (`court-media-dlq`) to catch broken streams without corrupting session data.
- **Legal Chain-of-Custody Overlays:** Uses FFmpeg's `drawtext` video matrix filters to burn unalterable, high-contrast Case IDs and timestamps directly onto video frames.

##  Local Verification Run
1. Install dependencies:
   ```bash
   npm install
