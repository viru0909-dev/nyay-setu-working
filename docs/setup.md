# Nyay Saarthi - Complete Setup Guide

This guide covers the deep technical setup required to get Nyay Saarthi running, beyond the simple quick start commands.

## Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 15+
- Groq API Key (free at [groq.com](https://groq.com/))
- Ollama (for local AI - optional)

## 1. Local Database Setup

Connect to your PostgreSQL instance via terminal or pgAdmin and run:

```sql
-- Create database
CREATE DATABASE nyaysetu_db;

-- Create user (optional)
CREATE USER nyaysetu WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nyaysetu_db TO nyaysetu;
```

## 2. Backend Environment Variables

Instead of relying on a fragile `.env` file at the root, the backend requires a proper Spring configuration.

Create `backend/nyaysetu-backend/src/main/resources/application.properties` with the following:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/nyaysetu_db
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT Authentication
jwt.secret=your-256-bit-secret-key-change-this-in-production
jwt.expiration=86400000

# Groq AI Keys
groq.api.key=your_groq_api_key
groq.model=llama-3.1-8b-instant

# Email Notifications (optional)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# File Upload Location
file.upload-dir=uploads/

# CORS Configuration
cors.allowed.origins=http://localhost:5173,http://localhost:4174
```

## 3. Running the Components

**Backend (Spring Boot):**
```bash
cd backend/nyaysetu-backend
mvn clean install
mvn spring-boot:run
```
*(The backend will start and expose its API at: http://localhost:8080)*

**Frontend (React/Vite PWA):**
```bash
cd frontend/nyaysetu-frontend
npm install
npm run dev
```
*(The frontend application will start on: http://localhost:5173)*

## 4. Test Data

Once both servers are running, navigate to `http://localhost:5173/signup` to create your first user. 

If you are using the local SQL `DataLoader` provided in the source code, you can use these test credentials:
- **Email:** admin@nyaysetu.com
- **Password:** admin123
- **Role:** ADMIN
