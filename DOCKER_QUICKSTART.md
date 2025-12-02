# Quick Start Guide - ARM64 Docker Build

## 🎯 All Fixes Applied ✅

### What Was Fixed:
1. ✅ Base image changed to ARM64-compatible `eclipse-temurin:17-jre`
2. ✅ Removed deprecated `version:` from docker-compose.yml
3. ✅ Fixed database init script syntax error
4. ✅ Added missing environment variables (AI_API_KEY, SMTP_*)
5. ✅ Generated ARM64 Dockerfiles for all 9 backend services
6. ✅ Added `platform: linux/arm64` to all services

---

## 🚀 Quick Start (3 Steps)

### Option 1: Automated Script
```bash
cd /Users/virendragadekar/Documents/NYAY-SETU
./scripts/build-and-run.sh
```

### Option 2: Manual Commands
```bash
cd /Users/virendragadekar/Documents/NYAY-SETU

# 1. Set platform
export DOCKER_DEFAULT_PLATFORM=linux/arm64

# 2. Clean & build
docker-compose down -v
docker-compose build --no-cache

# 3. Start services
docker-compose up -d

# 4. Check status
docker-compose ps
```

---

## 📋 Verify Everything Works

```bash
# Check databases created
docker-compose logs postgres | grep "Creating database"

# Check Eureka (should show 8 services)
open http://localhost:8761

# Check Gateway health
curl http://localhost:9000/actuator/health

# View logs
docker-compose logs -f
```

---

## 🔧 Fill Missing Variables

Edit `.env` and add:
- `AI_API_KEY` - Your AI service API key
- `SMTP_HOST` - Email server (e.g., smtp.gmail.com)
- `SMTP_USERNAME` - Email username
- `SMTP_PASSWORD` - Email password

---

## 📚 Full Documentation

See [walkthrough.md](file:///Users/virendragadekar/.gemini/antigravity/brain/cfc43939-8350-4071-930a-48dceb78a702/walkthrough.md) for complete details, troubleshooting, and verification steps.

---

## ✅ Expected Result

All services running on ARM64 with no platform errors!

```
NAME                    STATUS         PORTS
nyaysetu-postgres       Up (healthy)   5432
nyaysetu-eureka         Up (healthy)   8761
nyaysetu-auth           Up (healthy)   8081
nyaysetu-case           Up (healthy)   8082
nyaysetu-document       Up (healthy)   8083
nyaysetu-meeting        Up (healthy)   8084
nyaysetu-ai             Up (healthy)   8085
nyaysetu-audit          Up (healthy)   8086
nyaysetu-verification   Up (healthy)   8087
nyaysetu-gateway        Up (healthy)   9000
nyaysetu-frontend       Up (healthy)   80
```
