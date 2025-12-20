# 🏃 How to Run NyaySetu Locally

Follow these steps to get the full AI-powered judiciary platform running on your machine.

---

## 1. Prerequisites
- **PostgreSQL**: Installed and running on port `5432`.
- **Java 17 & Maven**: For the backend.
- **Node.js 18+**: For the frontend.

---

## 2. One-Time Setup

### A. Environment Files
Run the setup script to generate your `.env` files and a random JWT security key:
```bash
chmod +x setup.sh
./setup.sh
```

### B. Database Creation
Run the SQL script to create the `nyaysetu` database:
```bash
psql -U postgres -f local_setup.sql
```

---

## 3. Starting the Application

### A. Backend (Spring Boot)
Open a terminal:
```bash
cd backend/nyaysetu-backend
mvn spring-boot:run
```
*The database tables will be created automatically via Flyway on the first start.*

### B. Frontend (React + Vite)
Open another terminal:
```bash
cd frontend/nyaysetu-frontend
npm install
npm run dev
```

---

## 🔑 AI Configuration (Optional)
To use the AI features (Vakil Friend, Brain, etc.), add your **Groq API Key** to `backend/nyaysetu-backend/.env`:
```env
GROQ_API_KEY=gsk_your_key_here
```
Get a free key at [console.groq.com](https://console.groq.com).

---
*Built for the Future of Justice.*
