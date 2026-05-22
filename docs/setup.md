# Nyay Saarthi — Complete Setup Guide

This guide covers the technical setup required to get Nyay Saarthi running locally, including database configuration, environment variables, and Docker orchestration.

<hr/>

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Option A: Docker Deployment (Recommended)](#option-a-docker-deployment-recommended)
- [Option B: Manual Local Setup](#option-b-manual-local-setup)
- [Database Structure](#database-structure)
- [Troubleshooting](#troubleshooting)

<hr/>

## Prerequisites

Ensure you have the following installed before proceeding:
- **Node.js** `>= 20.x`
- **Java** `17`
- **Maven** `3.9+`
- **PostgreSQL** `15+`
- **Python** `3.12+` (for NLP Orchestrator)
- **Docker & Docker Compose** (highly recommended)

You will also need a **Groq API Key** for the AI features. You can get one for free at [console.groq.com](https://console.groq.com/).

<hr/>

## Environment Variables

Copy the provided `.env.example` file to create your own `.env` file at the root of the project:

```bash
cp .env.example .env
```

### Required Configuration (`.env`)

```env
# ── Database ─────────────────────────────────
DB_NAME=nyaysetu
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password

# ── Backend Security ─────────────────────────
# Generate a random 256-bit string for this
JWT_SECRET=your_jwt_secret_key_change_in_production
SPRING_PROFILES_ACTIVE=dev

# ── AI Configuration ─────────────────────────
GROQ_API_KEY=gsk_your_actual_key_here
# Optional: Fallback Gemini Key
GOOGLE_GEMINI_API_KEY=your_gemini_key

# ── Networking & CORS ────────────────────────
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost
```

> **Production requirement:** When running with `SPRING_PROFILES_ACTIVE=prod`, you **must** set `JWT_SECRET` as an environment variable. The backend now fails fast at startup in production if `JWT_SECRET` is missing or falls back to the default development secret.

<hr/>

## Option A: Docker Deployment (Recommended)

The easiest way to run the entire stack (Database, Spring Boot Backend, Python NLP Orchestrator, and React Frontend) is via Docker Compose.

1. Ensure Docker Desktop is running.
2. Verify your `.env` file is properly configured.
3. Run the following command from the root directory:

```bash
docker-compose up --build -d
```

### Service Endpoints (Docker)
| Service | URL |
|---|---|
| Frontend (React) | `http://localhost` (Port 80) |
| Backend API (Spring Boot) | `http://localhost:8080` |
| NLP Orchestrator (FastAPI)| `http://localhost:8001` |
| PostgreSQL Database | `localhost:5432` |

To view logs:
```bash
docker-compose logs -f
```

<hr/>

## Option B: Manual Local Setup

If you prefer to run the services individually for development, follow these steps in order.

### 1. Database Setup
Ensure PostgreSQL is running locally on port `5432`. Create the database:
```bash
psql -U postgres -c "CREATE DATABASE nyaysetu;"
```

### 2. Run the NLP Orchestrator (Python)
This service handles AI prompt generation and processing.
```bash
cd nlp-orchestrator
pip install -r requirements.txt
# Requires GROQ_API_KEY to be set in your terminal or .env
uvicorn main:app --reload --port 8001
```

### 3. Run the Backend (Java/Spring Boot)
The Spring Boot backend will automatically run Flyway migrations to set up the database tables on startup.
```bash
cd backend/nyaysetu-backend
# Ensure the backend can read the root .env file, or export the vars manually
mvn spring-boot:run
```
*Runs on `http://localhost:8080`*

### 4. Run the Frontend (React/Vite)
```bash
cd frontend/nyaysetu-frontend
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

<hr/>

## Database Structure

When the backend starts successfully, it will create several tables. Key tables include:
- `users`: Core user accounts and roles.
- `cases`: Case details, status, and assignments.
- `evidence`: Hashed evidence metadata.
- `firs`: Police first information reports.
- `court_hearings`: Scheduled virtual hearings.

### Test Credentials
If you have the development `DataLoader` enabled, these test accounts are seeded on startup:
- **Admin:** `admin@nyaysetu.com` / `admin123`
- **Judge:** `judge@nyaysetu.com` / `judge123`
- **Lawyer:** `lawyer@nyaysetu.com` / `lawyer123`

<hr/>

## Troubleshooting

| Issue | Solution |
|---|---|
| **Database Connection Refused** | Ensure PostgreSQL is running and credentials match your `.env` file. |
| **JWT Signature Exception** | Your `JWT_SECRET` is too short or changed. It must be at least 256 bits. |
| **CORS Errors on Login** | Ensure `CORS_ALLOWED_ORIGINS` in your `.env` matches your exact frontend URL (including the port). |
| **AI Features Not Working** | Verify `GROQ_API_KEY` is valid and the NLP Orchestrator is running on port 8001. |
