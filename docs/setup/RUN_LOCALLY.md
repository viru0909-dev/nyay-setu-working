# Running NYAY-SETU Locally (IDE Development)

## ✅ Fixed Configuration

**Changed Eureka URL**: `eureka-server:8761` → `localhost:8761` in gateway-service

---

## 🚀 Start Services in This Order

### 1. Start Eureka Server (Port 8761)
In IntelliJ:
- Open `eureka-server` module
- Run `EurekaServerApplication.java`
- **Verify**: http://localhost:8761 shows Eureka dashboard

### 2. Start All Backend Services

Run these Spring Boot applications in IntelliJ (any order):

| Service | Port | Main Class | Database |
|---------|------|------------|----------|
| Auth | 8081 | AuthServiceApplication | nyaysetu_auth |
| Case | 8082 | CaseServiceApplication | nyaysetu_case |
| Document | 8083 | DocumentServiceApplication | nyaysetu_document |
| Meeting | 8084 | MeetingServiceApplication | nyaysetu_meeting |
| **AI** | **8085** | AiServiceApplication | nyaysetu_ai |
| Audit | 8086 | AuditServiceApplication | nyaysetu_audit |
| Verification | 8087 | UserVerificationServiceApplication | nyaysetu_verification |
| **Gateway** | **9000** | GatewayServiceApplication | - |

**Wait** until all services register with Eureka!

### 3. Start Frontend (Port 5173)

```bash
cd frontend/nyaysetu-frontend
npm run dev
```

---

## 🔧 Prerequisites

### PostgreSQL Running

Make sure PostgreSQL is running with these databases:

```bash
# Check if running
pg_isready -U postgres

# If not, start PostgreSQL
# (varies by installation method)
```

**Required databases**:
- nyaysetu_auth
- nyaysetu_case  
- nyaysetu_document
- nyaysetu_meeting
- nyaysetu_ai
- nyaysetu_audit
- nyaysetu_verification

### Create databases if needed:

```sql
CREATE DATABASE nyaysetu_auth;
CREATE DATABASE nyaysetu_case;
CREATE DATABASE nyaysetu_document;
CREATE DATABASE nyaysetu_meeting;
CREATE DATABASE nyaysetu_ai;
CREATE DATABASE nyaysetu_audit;
CREATE DATABASE nyaysetu_verification;
```

---

## ✅ Verify Everything

### 1. Check Eureka Dashboard
http://localhost:8761

You should see all 7 services registered:
- AUTH-SERVICE
- CASE-SERVICE
- DOCUMENT-SERVICE
- MEETING-SERVICE
- AI-SERVICE ✨
- AUDIT-SERVICE
- USER-VERIFICATION-SERVICE

### 2. Check Gateway
```bash
curl http://localhost:9000/actuator/health
```

### 3. Check Frontend
Open: http://localhost:5173

---

## 🧪 Test Login

1. **Open**: http://localhost:5173/login
2. **Use**: admin@nyay.com / admin123
3. **API goes through**: localhost:9000 (gateway)

---

## 🐛 Troubleshooting

### "eureka-server: nodename nor servname provided"
❌ **Problem**: Service trying to connect to Docker hostname  
✅ **Fix**: Already fixed! Gateway now uses `localhost:8761`

### Frontend won't start
```bash
cd frontend/nyaysetu-frontend
rm -rf node_modules dist .vite
npm install
npm run dev
```

### Service can't connect to PostgreSQL
**Check** application.yml has:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/nyaysetu_auth
    username: postgres
    password: password
```

### Port already in use
```bash
# Find and kill process
lsof -ti:9000 | xargs kill -9
```

---

## 📝 Important for Local Development

When running **locally** (not in Docker):
- ✅ Use `localhost` for all service URLs
- ✅ PostgreSQL on `localhost:5432`
- ✅ Eureka on `localhost:8761`  
- ✅ Gateway on `localhost:9000`
- ✅ Frontend on `localhost:5173`

When running in **Docker**:
- Use service names: `eureka-server`, `postgres`, etc.

---

## 🎯 Current Setup

**Backend**: Running locally in IntelliJ ✅  
**Frontend**: Running with Vite on port 5173  
**Database**: Local PostgreSQL  
**Eureka**: Local on 8761  
**Gateway**: Local on 9000 (routes to all services)

**Everything uses `localhost`!** 🚀
