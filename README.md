# Nyay Saarthi 🏛️

Nyay Saarthi is a digital judiciary platform for India aimed at bridging the gap between citizens and the legal system. It provides an AI-powered legal assistant, an end-to-end case management dashboard, and secure virtual courts to make justice accessible, affordable, and fast.

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com/viru0909-dev/nyay-setu-working)
[![AI Powered](https://img.shields.io/badge/AI-Groq%20Llama%203.1-orange)](https://groq.com)
[![Full Stack](https://img.shields.io/badge/Stack-Spring%20Boot%20%7C%20React-blue)](https://github.com/viru0909-dev/nyay-setu-working)
[![Open Source](https://img.shields.io/badge/Open%20Source-Welcome-%234caf50)](#-contributing)

Because over 90% of citizens can't afford legal fees and courts face a staggering case backlog, this platform is built to drastically automate the initial friction of filings and court proceedings. 

## ✨ Key Features

- **Vakil Friend:** An integrated AI legal companion that converses in plain language to help citizens file cases, check documents, and understand their rights—entirely free.
- **Unified Dashboards:** Tailored experiences and management portals for Litigants, Lawyers, Judges, and Police across the lifecycle of a case.
- **Evidence Vault:** Digital evidence uploads baked with SHA-256 hashing to ensure tamper-proof, legally compliant record keeping.
- **Digital FIR Handling:** Allows police to upload first information reports, using AI to instantly summarize them and draft charge sheets.
- **Virtual Courtrooms:** Native WebRTC-based video conferencing integrated directly into the case timeline for remote hearings.

## 🛠️ Built With

- **Frontend:** React, Vite, Zustand, Tailwind/CSS variables (PWA ready).
- **Backend:** Java 17, Spring Boot, Spring Security (JWT), PostgreSQL.
- **AI Infrastructure:** Groq API (Llama 3.1) for extreme low-latency intelligence, and local Ollama backups for strict offline privacy.
- **Storage:** Local secure hashing block storage.

## 🚀 Quick Start

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

**Need the full setup details?** Check out our [Detailed Setup Guide](./docs/setup.md) for database queries, environment variables, and Docker information.

## 📚 Documentation

Dive deeper into how Nyay Saarthi ticks:

- [**System Architecture & Diagrams**](./docs/architecture/overview.md)
- [**AI Integration Guide**](./AI_INTEGRATION_GUIDE.md)
- [**API Endpoints & Specs**](./SYSTEM_DOCUMENTATION.md)
- [**Detailed Setup & Env Config**](./docs/setup.md)

## 🤝 Contributing

We strongly believe in open source, and **we welcome contributions!** Whether you're here from GSSoC or just want to help democratize legal tech, we'd love to have you.

To get started with contributing, please read our [**Contributing Guidelines**](./CONTRIBUTING.md) which explains our simple branching, committing, and PR approval process.

Don't have a specific issue in mind yet? Check our [Open Issues Tracker](https://github.com/viru0909-dev/nyay-setu-working/issues) for `good first issue` tags.

## ⚖️ License & Contact

This software is maintained by Virendra Gadekar and contributors.  
If you have questions or want to partner on deployment, reach out via [LinkedIn](https://linkedin.com/in/virendra-gadekar) or check out the [GitHub Profile](https://github.com/viru0909-dev).

---
*Built with ❤️ for a More Accessible Indian Judiciary.*
