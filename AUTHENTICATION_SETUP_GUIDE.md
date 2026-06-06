# Authentication System Setup & Deployment Guide

## 📋 Table of Contents
1. Local Development Setup
2. Environment Configuration
3. Database Setup
4. Frontend Setup
5. Backend Setup
6. Testing the Implementation
7. Production Deployment
8. Troubleshooting

---

## 1️⃣ Local Development Setup

### Prerequisites
- Java 17 or higher
- Node.js 18+
- PostgreSQL 12+
- Git
- Maven 3.8+
- npm or yarn

### Initial Setup

```bash
# Clone repository
git clone https://github.com/viru0909-dev/nyay-setu-working.git
cd nyay-setu-working

# Create .env file for backend
cat > backend/nyaysetu-backend/.env << 'EOF'
# Database
DB_URL=jdbc:postgresql://localhost:5432/nyaysetu
DB_USERNAME=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=$(openssl rand -base64 32)

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# SMTP (Optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
EOF

# Create .env file for frontend
cat > frontend/nyaysetu-frontend/.env << 'EOF'
VITE_API_BASE_URL=http://localhost:8080
VITE_ENV=development
EOF
```

---

## 2️⃣ Environment Configuration

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| JWT_SECRET | ✓ | None | 256-bit key for JWT signing |
| DB_URL | ✓ | None | PostgreSQL connection URL |
| DB_USERNAME | ✓ | None | Database username |
| DB_PASSWORD | ✓ | None | Database password |
| CORS_ALLOWED_ORIGINS | ✓ | http://localhost:5173 | Comma-separated frontend URLs |
| SMTP_HOST | ✗ | smtp.gmail.com | Email server hostname |
| SMTP_PORT | ✗ | 587 | Email server port |
| SMTP_USERNAME | ✗ | None | Email account username |
| SMTP_PASSWORD | ✗ | None | Email account password |
| FRONTEND_URL | ✗ | http://localhost:5173 | Frontend URL for email links |
| JWT_EXPIRATION_MS | ✗ | 86400000 | JWT expiration in milliseconds |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_API_BASE_URL | ✓ | http://localhost:8080 | Backend API base URL |
| VITE_ENV | ✗ | production | Environment type |

### Generate Secure JWT Secret

```bash
# Using OpenSSL
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"

# Using Python
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
echo "JWT_SECRET=$JWT_SECRET"

# Using Node.js
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "JWT_SECRET=$JWT_SECRET"
```

---

## 3️⃣ Database Setup

### PostgreSQL Installation

#### Windows
```bash
# Download from https://www.postgresql.org/download/windows/
# Run installer and set password for postgres user
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nyaysetu;
CREATE USER nyaysetu_user WITH PASSWORD 'secure_password';
ALTER ROLE nyaysetu_user SET client_encoding TO 'utf8';
ALTER ROLE nyaysetu_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE nyaysetu_user SET default_transaction_deferrable TO ON;
ALTER ROLE nyaysetu_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE nyaysetu TO nyaysetu_user;
\q
```

### Verify Connection

```bash
psql -h localhost -U nyaysetu_user -d nyaysetu -c "SELECT 1;"
```

---

## 4️⃣ Frontend Setup

### Install Dependencies

```bash
cd frontend/nyaysetu-frontend
npm install
# or
yarn install
```

### Development Server

```bash
npm run dev
# Output: http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output: dist/ folder

# Preview build
npm run preview
```

### Verify Authentication Pages Load

```
http://localhost:5173/login
http://localhost:5173/signup
http://localhost:5173/reset-password/:token
```

---

## 5️⃣ Backend Setup

### Build Backend

```bash
cd backend/nyaysetu-backend

# Maven build
mvn clean package -DskipTests

# Build with tests
mvn clean package
```

### Run Backend

#### Development Mode

```bash
# Set environment variables
export JWT_SECRET=$(openssl rand -base64 32)
export DB_URL=jdbc:postgresql://localhost:5432/nyaysetu
export DB_USERNAME=nyaysetu_user
export DB_PASSWORD=secure_password
export CORS_ALLOWED_ORIGINS=http://localhost:5173

# Run spring boot
mvn spring-boot:run

# Or
java -jar target/nyaysetu-backend.jar
```

#### Docker

```bash
# Build image
docker build -t nyaysetu-backend:latest .

# Run container
docker run -e JWT_SECRET=$JWT_SECRET \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/nyaysetu \
  -e DB_USERNAME=nyaysetu_user \
  -e DB_PASSWORD=secure_password \
  -e CORS_ALLOWED_ORIGINS=http://localhost:5173 \
  -p 8080:8080 \
  nyaysetu-backend:latest
```

### Verify Backend Health

```bash
curl http://localhost:8080/api/v1/auth/ping
# Expected: pong
```

### View API Documentation

```
http://localhost:8080/swagger-ui.html
http://localhost:8080/v3/api-docs
```

---

## 6️⃣ Testing the Implementation

### Manual Authentication Flow

#### 1. Register New User

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123!",
    "role": "LITIGANT"
  }'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User",
    "role": "LITIGANT"
  }
}
```

#### 2. Login User

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Save token for next requests
TOKEN="<token-from-response>"
```

#### 3. Access Protected Endpoint

```bash
curl -X GET http://localhost:8080/api/v1/cases \
  -H "Authorization: Bearer $TOKEN"
```

#### 4. Refresh Token

```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh-token>"
  }'
```

### Automated Test Suite

```bash
# Run backend tests
cd backend/nyaysetu-backend
mvn test -Dtest=AuthControllerTest
mvn test -Dtest=AuthServiceTest

# Run frontend tests
cd frontend/nyaysetu-frontend
npm run test
```

### Integration Tests

Create `AuthIntegrationTest.java`:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AuthIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void testCompleteAuthFlow() {
        String baseUrl = "http://localhost:" + port;
        
        // Register
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail("test@example.com");
        registerReq.setName("Test User");
        registerReq.setPassword("TestPass123!");
        registerReq.setRole(Role.LITIGANT);
        
        ResponseEntity<Map> registerResponse = restTemplate.postForEntity(
            baseUrl + "/api/v1/auth/register",
            registerReq,
            Map.class
        );
        
        assertEquals(HttpStatus.OK, registerResponse.getStatusCode());
        String token = (String) registerResponse.getBody().get("token");
        assertNotNull(token);
        
        // Login
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("test@example.com");
        loginReq.setPassword("TestPass123!");
        
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity(
            baseUrl + "/api/v1/auth/login",
            loginReq,
            Map.class
        );
        
        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        assertNotNull(loginResponse.getBody().get("token"));
    }
}
```

---

## 7️⃣ Production Deployment

### Pre-Deployment Checklist

- [ ] JWT_SECRET is set and secure
- [ ] Database backup configured
- [ ] HTTPS enabled
- [ ] CORS origins restricted
- [ ] SMTP configured for email
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] SSL certificates valid
- [ ] Database migrations tested

### Docker Compose Deployment

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: nyaysetu
      POSTGRES_USER: nyaysetu_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    image: nyaysetu-backend:latest
    environment:
      JWT_SECRET: ${JWT_SECRET}
      DB_URL: jdbc:postgresql://postgres:5432/nyaysetu
      DB_USERNAME: nyaysetu_user
      DB_PASSWORD: ${DB_PASSWORD}
      CORS_ALLOWED_ORIGINS: ${FRONTEND_URL}
      SMTP_USERNAME: ${SMTP_USERNAME}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  frontend:
    image: nyaysetu-frontend:latest
    environment:
      VITE_API_BASE_URL: ${BACKEND_URL}
    ports:
      - "80:3000"

volumes:
  postgres-data:
```

Deploy:

```bash
# Set production environment variables
export JWT_SECRET=$(openssl rand -base64 32)
export DB_PASSWORD=secure_db_password
export FRONTEND_URL=https://yourdomain.com
export BACKEND_URL=https://api.yourdomain.com

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

Create `auth-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nyaysetu-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nyaysetu-backend
  template:
    metadata:
      labels:
        app: nyaysetu-backend
    spec:
      containers:
      - name: backend
        image: nyaysetu-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: jwt-secret
        - name: DB_URL
          valueFrom:
            configMapKeyRef:
              name: auth-config
              key: db-url
        - name: CORS_ALLOWED_ORIGINS
          valueFrom:
            configMapKeyRef:
              name: auth-config
              key: cors-origins
```

---

## 8️⃣ Troubleshooting

### Issue: "Failed to connect to database"

**Solution**:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -h localhost -U nyaysetu_user -d nyaysetu -c "SELECT 1;"

# Verify DB_URL format
# Should be: jdbc:postgresql://host:5432/dbname
```

### Issue: "JWT_SECRET is required"

**Solution**:
```bash
# Set in environment
export JWT_SECRET=$(openssl rand -base64 32)

# Or in application.properties
jwt.secret=<your-256-bit-key>
```

### Issue: "CORS policy blocked"

**Solution**:
```bash
# Add frontend URL to CORS_ALLOWED_ORIGINS
export CORS_ALLOWED_ORIGINS="http://localhost:5173,https://yourdomain.com"
```

### Issue: "Password reset email not received"

**Solution**:
```bash
# Check SMTP configuration
export SMTP_USERNAME="your-email@gmail.com"
export SMTP_PASSWORD="your-app-specific-password"

# For Gmail, use App Password (not account password)
# https://myaccount.google.com/apppasswords

# Check backend logs for errors
docker logs <container-id> | grep -i "mail"
```

### Issue: "Token expired immediately"

**Solution**:
```bash
# Check system clock
date

# Increase expiration time for testing
export JWT_EXPIRATION_MS=3600000  # 1 hour
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:8080/api/v1/auth/ping

# Database health
curl http://localhost:8080/actuator/health

# Full health report
curl http://localhost:8080/actuator/health/details
```

### Log Rotation

```bash
# View logs
tail -f logs/app.log

# Rotate logs
./gradlew logrotate

# Archive old logs
find logs -name "*.log" -mtime +30 -delete
```

### Database Maintenance

```bash
# Backup database
pg_dump -h localhost -U nyaysetu_user nyaysetu > backup.sql

# Restore database
psql -h localhost -U nyaysetu_user nyaysetu < backup.sql

# Cleanup expired reset tokens
DELETE FROM password_reset_tokens WHERE expiry_date < NOW();
```

### Performance Monitoring

```bash
# Monitor connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

# Monitor slow queries
SELECT query, mean_exec_time FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```

---

## 🔐 Security Hardening

### SSL/TLS Configuration

```properties
# application.properties
server.ssl.key-store=keystore.jks
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
server.ssl.key-store-type=JKS
```

### Rate Limiting

```java
@Configuration
public class RateLimitConfig {
    @Bean
    public RateLimitFilter rateLimitFilter() {
        return new RateLimitFilter();
        // Max 5 login attempts per minute
    }
}
```

### HTTPS Redirect

```properties
# application.properties
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
```

---

## 📞 Support & Documentation

- **Full Documentation**: `AUTHENTICATION_IMPLEMENTATION.md`
- **Quick Reference**: `AUTHENTICATION_QUICK_REFERENCE.md`
- **API Documentation**: `API_DOCUMENTATION_SUMMARY.md`

---

**Last Updated**: June 2026
**Setup Guide Version**: 1.0
