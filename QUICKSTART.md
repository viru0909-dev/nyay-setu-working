# Quick Start Guide

## Run Everything

### 1. Start Backend Services (Docker)
```bash
docker-compose up -d
```

Wait 2-3 minutes for services to start.

### 2. Start Frontend Locally
```bash
cd frontend/nyaysetu-frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## Access URLs

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:9000
- **Eureka**: http://localhost:8761

---

## Test Login

**URL**: http://localhost:5173/login

**Credentials**:
- admin@nyay.com / admin123
- judge@nyay.com / judge123
- lawyer@nyay.com / lawyer123

---

## Service Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Gateway | 9000 |
| Auth | 8081 |
| Case | 8082 |
| Document | 8083 |
| Meeting | 8084 |
| **AI** | **8085** |
| Audit | 8086 |
| Verification | 8087 |
| PostgreSQL | 5432 |

---

## Check Status

```bash
# All services
docker-compose ps

# Logs
docker-compose logs -f gateway-service

# Gateway health
curl http://localhost:9000/actuator/health
```

---

## Stop Everything

```bash
# Frontend: Ctrl+C in terminal
# Backend:
docker-compose down
```
