<p align="center">
  <img src="./docs/assets/banner.png" alt="Nyay Saarthi Banner" width="900" />
</p>

<h1 align="center">Nyay Saarthi</h1>

<p align="center">
  <em>A Digital Judiciary Platform for India</em>
</p>

<p align="center">
  <a href="https://github.com/viru0909-dev/nyay-setu-working">
    <img src="https://img.shields.io/badge/Status-Production%20Ready-success" alt="Status" />
  </a>
  <a href="https://groq.com">
    <img src="https://img.shields.io/badge/AI-Groq%20Llama%203.1-orange" alt="AI Powered" />
  </a>
  <a href="https://github.com/viru0909-dev/nyay-setu-working">
    <img src="https://img.shields.io/badge/Stack-Spring%20Boot%20%7C%20React-blue" alt="Full Stack" />
  </a>
  <a href="#contributors">
    <img src="https://img.shields.io/badge/Open%20Source-Welcome-%234caf50" alt="Open Source" />
  </a>
</p>

<hr>

> **Mission Statement**
> 
> Nyay Saarthi bridges the gap between citizens and the legal system. It provides an AI-powered legal assistant, an end-to-end case management dashboard, and secure virtual courts to make justice accessible, affordable, and fast.

Because a large percentage of citizens cannot afford legal fees and courts face a staggering case backlog, this platform is built to automate the initial friction of filings and court proceedings. 

**Live Demo:** [nyaysetu-lovat.vercel.app](https://nyaysetu-lovat.vercel.app/)

## Key Features

- **Vakil Friend:** An integrated AI legal companion that converses in plain language to help citizens file cases, check documents, and understand their rights entirely for free.
- **Unified Dashboards:** Tailored experiences and management portals designed for Litigants, Lawyers, Judges, and Police personnel across the lifecycle of a case.
- **Evidence Vault:** Digital evidence uploads verified with SHA-256 hashing to ensure a tamper-proof and legally compliant record keeping process.
- **Digital FIR Handling:** Allows police to securely upload first information reports, using AI to instantly summarize them and draft charge sheets.
- **Virtual Courtrooms:** Native WebRTC-based video conferencing integrated directly into the case timeline for seamless remote hearings.

## Built With

- **Frontend:** React, Vite, Zustand, Tailwind and CSS Variables (PWA Ready)
- **Backend:** Java 17, Spring Boot, Spring Security (JWT), PostgreSQL
- **AI Infrastructure:** Groq API (Llama 3.1) for extreme low-latency processing, backed by local Ollama instances for strict offline privacy guarantees.
- **Storage:** Local secure hashing block storage.

## Quick Start

Getting started is simple. To spin up the platform locally:

```bash
# 1. Clone the repository
git clone https://github.com/viru0909-dev/nyay-setu-working.git
cd nyay-setu-working

# 2. Run the Frontend
cd frontend/nyaysetu-frontend
npm install && npm run dev

# 3. Run the Backend (in a separate terminal)
cd ../../backend/nyaysetu-backend
# Make sure to set up your database & env vars first!
mvn spring-boot:run
```

**Need the full setup details?** Check out the [Detailed Setup Guide](./docs/setup.md) for database queries, environment variables, and Docker information.

## Documentation

Dive deeper into how Nyay Saarthi operates by checking our dedicated technical docs:

- [System Architecture & Diagrams](./docs/architecture/overview.md)
- [AI Integration Guide](./AI_INTEGRATION_GUIDE.md)
- [API Endpoints & Specs](./SYSTEM_DOCUMENTATION.md)
- [Detailed Setup & Configuration](./docs/setup.md)

## Contributors

We firmly believe in open source and we welcome your contributions. Whether you are here from GSSoC or you simply want to help democratize legal technology, we would love to have you on board!

<br>

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/viru0909-dev">
        <img src="https://github.com/viru0909-dev.png" width="100px;" alt="Virendra Gadekar"/>
        <br />
        <sub><b>Virendra Gadekar</b></sub>
      </a>
      <br />
      <a href="https://github.com/viru0909-dev/nyay-setu-working/commits?author=viru0909-dev" title="Code">💻</a>
    </td>
    <!-- Add new contributors here -->
  </tr>
</table>

<br>

To get started with contributing, please read our [Contributing Guidelines](./CONTRIBUTING.md) which explains our branching strategy, local setup, and PR approval workflow.

You can also check our [Open Issues Tracker](https://github.com/viru0909-dev/nyay-setu-working/issues) for `good first issue` tags.

<hr>

<p align="center">
  <em>Built with purpose for a more accessible Indian Judiciary.</em>
</p>
