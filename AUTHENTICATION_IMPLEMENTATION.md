# NyaySetu User Authentication Implementation (Issue #937)

## 📋 Overview

This document provides a comprehensive guide to the user authentication system implemented in NyaySetu, covering both frontend and backend layers. The system uses JWT-based stateless authentication with BCrypt password hashing for maximum security.

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Java Spring Boot 3.2.3
- Spring Security with JWT
- PostgreSQL Database
- BCrypt password encoding
- Email service for password reset

**Frontend:**
- React 18.2 with Vite
- Zustand for state management
- React Router for navigation
- Axios for HTTP requests with JWT interceptors
- i18n for internationalization

### Authentication Flow

```
┌─────────────────┐
│   User/Frontend │
└────────┬────────┘
         │
         ├─────────────► POST /api/v1/auth/register ────────┐
         │                  (email, password, name, role)    │
         │                                                    ▼
         │                                              ┌──────────────┐
         │                                              │ Backend Auth │
         │                                              │  Controller  │
         │                                              └──────┬───────┘
         │                                                     │
         │                                    ┌────────────────┴────────────────┐
         │                                    ▼                                 ▼
         │                            ┌──────────────────┐          ┌─────────────────────┐
         │                            │ AuthService      │          │ Password Validation │
         │                            │ - Register user  │          │ & Email Duplicate   │
         │                            │ - Hash password  │          │ Check              │
         │                            │ - Find by email  │          └─────────────────────┘
         │                            └────────┬─────────┘
         │                                     │
         │                                     ▼
         │                            ┌──────────────────┐
         │                            │ UserRepository   │
         │                            │ - Save user      │
         │                            │ - Find by email  │
         │                            │ - Check unique   │
         │                            └────────┬─────────┘
         │                                     │
         │◄─────────────────────────────────────┤
         │  JWT token + user data               │
         │                                     │
         ├─────────────► POST /api/v1/auth/login ───────┐
         │             (email, password)               │
         │                                              ▼
         │                                    ┌──────────────────┐
         │                                    │ AuthController   │
         │                                    │ - Authenticate   │
         │                                    │ - Generate JWT   │
         │                                    └──────────────────┘
         │
         ├─────────────► Other Protected Endpoints ────┐
         │             (with Authorization: Bearer JWT)  │
         │                                               ▼
         │                                    ┌──────────────────┐
         │                                    │ JwtAuthFilter    │
         │                                    │ - Validate token │
         │                                    │ - Extract user   │
         │                                    └──────────────────┘
         │
         └──────────────────────────────────────────────►
```

## 🔐 Security Features

### 1. Password Security
- **Algorithm**: BCrypt with salt
- **Requirements**: 
  - Minimum 8 characters
  - At least 1 uppercase letter (A-Z)
  - At least 1 number (0-9)
  - At least 1 special character (@#$!%*?&)
- **Validation Regex**: `^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$!%*?&]).{8,}$`

### 2. JWT Token Management
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **Algorithm**: HMAC-SHA256
- **Signing Key**: Configurable via `JWT_SECRET` environment variable

### 3. Session Management
- **Stateless**: No server-side sessions
- **Token Storage**: localStorage (can be upgraded to HttpOnly cookies)
- **Auto-logout**: On 401/403 responses
- **Session Expiry**: Automatic detection and redirect

### 4. Endpoint Protection
- **Public Endpoints**: `/auth/register`, `/auth/login`, `/auth/refresh`
- **Protected Endpoints**: All other endpoints require valid JWT
- **CORS Configuration**: Restricted to configured origins

## 📡 API Endpoints

### Authentication Endpoints

#### 1. Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!",
  "role": "LITIGANT"  // Optional, defaults to LITIGANT
}

Response 200 OK:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "LITIGANT"
  }
}

Response 400 Bad Request (Duplicate Email):
{
  "message": "Email already exists. Please use a different email or login."
}

Response 400 Bad Request (Weak Password):
{
  "message": "Password must be at least 8 characters and include an uppercase letter, a number, and a special character (@#$!%*?&)."
}
```

#### 2. Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200 OK:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "LITIGANT"
  }
}

Response 401 Unauthorized (Invalid Credentials):
{
  "message": "Invalid credentials"
}
```

#### 3. Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response 200 OK:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token refreshed successfully"
}

Response 401 Unauthorized (Invalid Refresh Token):
{
  "message": "Refresh token expired or invalid. Please login again."
}
```

#### 4. Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response 200 OK:
{
  "message": "Password reset email sent successfully",
  "email": "user@example.com"
}

Response 400 Bad Request (User Not Found):
{
  "message": "User not found"
}
```

#### 5. Verify Reset Token
```http
GET /api/v1/auth/verify-reset-token?token=abc123xyz...

Response 200 OK:
{
  "valid": true
}

Response 400 Bad Request (Invalid Token):
{
  "valid": false,
  "message": "Token expired"
}
```

#### 6. Reset Password
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "abc123xyz...",
  "newPassword": "NewSecurePass123!"
}

Response 200 OK:
{
  "message": "Password reset successful"
}

Response 400 Bad Request (Invalid Token):
{
  "message": "Token already used"
}
```

#### 7. Enroll Face (Biometric)
```http
POST /api/v1/auth/face/enroll
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "faceDescriptor": "[0.123, 0.456, ...]"
}

Response 200 OK:
{
  "message": "Face enrolled successfully"
}
```

#### 8. Login with Face
```http
POST /api/v1/auth/face/login
Content-Type: application/json

{
  "email": "user@example.com",
  "faceDescriptor": "[0.123, 0.456, ...]"
}

Response 200 OK:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}

Response 401 Unauthorized (Face mismatch):
{
  "message": "Face verification failed"
}
```

## 🖥️ Backend Implementation

### AuthService
**File**: `backend/nyaysetu-backend/src/main/java/com/nyaysetu/backend/service/AuthService.java`

**Responsibilities**:
- User registration with password encoding
- User lookup by email
- Spring Security UserDetailsService implementation
- Password verification

```java
// Key Methods:
public void register(String email, String name, String password, Role role)
public User findByEmail(String email)
public UserDetails loadUserByUsername(String email)
public void updateUser(User user)
```

### JwtService
**File**: `backend/nyaysetu-backend/src/main/java/com/nyaysetu/backend/service/JwtService.java`

**Responsibilities**:
- JWT token generation (access and refresh)
- Token validation and expiry checking
- Claim extraction

```java
// Key Methods:
public String generateToken(Map<String, Object> claims, UserDetails userDetails)
public String generateRefreshToken(UserDetails userDetails)
public boolean isTokenValid(String token, UserDetails userDetails)
public String extractUsername(String token)
```

### AuthController
**File**: `backend/nyaysetu-backend/src/main/java/com/nyaysetu/backend/controller/AuthController.java`

**Endpoints**:
- POST `/auth/register` - User registration
- POST `/auth/login` - User login
- POST `/auth/refresh` - Token refresh
- POST `/auth/forgot-password` - Initiate password reset
- GET `/auth/verify-reset-token` - Verify reset token
- POST `/auth/reset-password` - Complete password reset
- POST `/auth/face/enroll` - Enroll biometric data
- POST `/auth/face/login` - Biometric authentication

### SecurityConfig
**File**: `backend/nyaysetu-backend/src/main/java/com/nyaysetu/backend/config/SecurityConfig.java`

**Configuration**:
- BCrypt password encoder
- CORS configuration
- JWT authentication filter
- Spring Security filter chain
- Session policy (STATELESS)

### User Entity
**File**: `backend/nyaysetu-backend/src/main/java/com/nyaysetu/backend/entity/User.java`

**Fields**:
- `id`: Auto-generated primary key
- `email`: Unique, required
- `name`: User's full name
- `password`: BCrypt-encoded password
- `role`: User role (LITIGANT, LAWYER, JUDGE, ADMIN)
- `deletedAt`: Soft delete timestamp

## 🎨 Frontend Implementation

### Pages

#### Login Page
**File**: `frontend/nyaysetu-frontend/src/pages/Login.jsx`

**Features**:
- Email and password input fields
- Role selection dropdown (optional)
- Password visibility toggle
- Form validation with error messages
- Forgot password link
- Face login option
- Continue as guest option
- Responsive design

#### Signup Page
**File**: `frontend/nyaysetu-frontend/src/pages/Signup.jsx`

**Features**:
- Full name, email, password inputs
- Password confirmation with mismatch detection
- Password strength indicator (visual feedback)
- Role selection with descriptions
- Real-time password validation
- Client-side validation matching backend requirements
- Optional face biometric enrollment
- Error handling with user-friendly messages

#### Password Reset Page
**File**: `frontend/nyaysetu-frontend/src/pages/ResetPassword.jsx`

**Features**:
- Token verification
- New password and confirmation inputs
- Password strength requirements
- Success/error messaging
- Redirect to login on success

### State Management

#### authStore.js
**File**: `frontend/nyaysetu-frontend/src/store/authStore.js`

**Features** (Zustand):
- `setAuth(user, token)` - Set authenticated user
- `logout()` - Clear auth state
- `initAuth()` - Initialize auth from localStorage
- `setGuest()` - Enable guest mode
- Token expiry detection
- Guest session management

**State Properties**:
- `user`: Current user object
- `token`: JWT access token
- `isAuthenticated`: Boolean
- `isGuest`: Boolean for guest mode

### API Service

#### api.js
**File**: `frontend/nyaysetu-frontend/src/services/api.js`

**Features**:
- Axios instance with JWT interceptor
- Automatic token injection in Authorization header
- Error handling with user notifications
- Auto-logout on 401/403
- Base URL configuration for dev/prod

**Key Exports**:
```javascript
authAPI.login(credentials)
authAPI.register(userData)
authAPI.logout()
```

### Components

#### FaceLoginModal
**File**: `frontend/nyaysetu-frontend/src/components/auth/FaceLoginModal.jsx`

- Modal for face authentication
- Camera access handling
- Face detection and verification

#### FaceCapture
**File**: `frontend/nyaysetu-frontend/src/components/auth/FaceCapture.jsx`

- Biometric enrollment component
- Face detection during signup

## ⚙️ Configuration

### Backend Configuration

**File**: `backend/nyaysetu-backend/src/main/resources/application.properties`

```properties
# JWT Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION_MS:86400000}

# CORS Configuration
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000}

# Email Configuration (SMTP)
spring.mail.host=${SMTP_HOST:smtp.gmail.com}
spring.mail.port=${SMTP_PORT:587}
spring.mail.username=${SMTP_USERNAME}
spring.mail.password=${SMTP_PASSWORD}

# Password Reset Token Validity (milliseconds)
app.password-reset.token-validity=1800000  # 30 minutes

# Frontend URL (for password reset links)
app.frontend.url=${FRONTEND_URL:http://localhost:5173}
```

### Environment Variables

**Required for Production**:
- `JWT_SECRET`: At least 256 bits for HMAC-SHA256
- `SMTP_USERNAME`: Email account for sending reset emails
- `SMTP_PASSWORD`: Email account password
- `CORS_ALLOWED_ORIGINS`: Frontend URL(s)

**Optional**:
- `FRONTEND_URL`: Frontend URL for password reset links (default: http://localhost:5173)
- `JWT_EXPIRATION_MS`: Access token expiry in milliseconds (default: 86400000 = 24 hours)

## 🔄 Authentication Flow Examples

### Complete Registration Flow

1. User fills signup form and submits
2. Frontend validates password locally
3. Frontend sends POST request to `/api/v1/auth/register`
4. Backend validates email format and password requirements
5. Backend checks for duplicate email (unique constraint)
6. Backend encodes password using BCrypt
7. Backend saves user to database
8. Backend generates JWT token
9. Backend returns token + user data
10. Frontend stores token in localStorage
11. Frontend redirects to dashboard
12. Frontend can proceed to face biometric enrollment (optional)

### Login Flow

1. User enters email and password
2. Frontend validates inputs
3. Frontend sends POST to `/api/v1/auth/login`
4. Backend verifies credentials against stored hash
5. Backend generates access token (15 min) and refresh token (7 days)
6. Frontend receives tokens and stores them
7. Frontend sets Authorization header for future requests
8. On each request, JWT is automatically sent via interceptor
9. Backend validates JWT before processing request

### Token Refresh Flow

1. Access token expires (after 15 minutes)
2. API receives 401 response
3. Frontend sends refresh token to `/api/v1/auth/refresh`
4. Backend validates refresh token
5. Backend generates new access token
6. Frontend updates stored token
7. Frontend retries original request
8. Request succeeds with new token

### Password Reset Flow

1. User clicks "Forgot Password"
2. User enters email address
3. Frontend sends POST to `/api/v1/auth/forgot-password`
4. Backend finds user by email
5. Backend generates reset token (UUID)
6. Backend saves token with 30-minute expiry
7. Backend sends email with reset link
8. User clicks link in email
9. Frontend extracts token from URL
10. Frontend verifies token at `/api/v1/auth/verify-reset-token`
11. User enters new password
12. Frontend validates password
13. Frontend sends POST to `/api/v1/auth/reset-password`
14. Backend marks token as used
15. Backend updates user password
16. Frontend redirects to login

## 🛡️ Security Best Practices

### Client-Side
- ✅ Password validation before submission
- ✅ Token stored in localStorage (can upgrade to HttpOnly)
- ✅ Automatic logout on token expiry
- ✅ CORS protection against unauthorized origins
- ✅ Secure password input with visibility toggle

### Server-Side
- ✅ BCrypt password encoding with salt
- ✅ JWT signing key protected via environment variable
- ✅ Stateless authentication (no session storage needed)
- ✅ Email unique constraint prevents duplicate registrations
- ✅ Password reset tokens expire after 30 minutes
- ✅ Used tokens cannot be reused
- ✅ Rate limiting on auth endpoints
- ✅ XSS sanitization filter
- ✅ SQL injection protection via JPA

### Database
- ✅ Unique constraint on email
- ✅ Password field not nullable
- ✅ Role field enforced via enum
- ✅ Soft delete for audit trail (deleted_at)
- ✅ Password reset token with expiry tracking

## 📝 Database Schema

### User Table
```sql
CREATE TABLE ny_user (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_user_email ON ny_user(email);
CREATE INDEX idx_user_role ON ny_user(role);
```

### Password Reset Token Table
```sql
CREATE TABLE password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES ny_user(id),
  expiry_date TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

CREATE INDEX idx_token_user_id ON password_reset_tokens(user_id);
```

## 🧪 Testing Checklist

### Backend Testing
- [ ] Registration with valid credentials
- [ ] Registration with duplicate email
- [ ] Registration with weak password
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token refresh with valid refresh token
- [ ] Token refresh with expired refresh token
- [ ] Protected endpoint access with valid JWT
- [ ] Protected endpoint access without JWT
- [ ] Protected endpoint access with invalid JWT
- [ ] Password reset request
- [ ] Password reset token verification
- [ ] Password reset with valid token
- [ ] Password reset with expired token

### Frontend Testing
- [ ] Signup form validation
- [ ] Login form validation
- [ ] Password strength indicator
- [ ] Form submission and error handling
- [ ] Successful authentication and redirect
- [ ] Token storage in localStorage
- [ ] Auto-logout on token expiry
- [ ] Session persistence on page reload
- [ ] Forgot password flow
- [ ] Face enrollment (if implemented)
- [ ] Guest mode functionality

## 📚 File Summary

### Backend Files
- `AuthService.java` - Authentication business logic
- `JwtService.java` - Token generation and validation
- `AuthController.java` - Authentication endpoints
- `User.java` - User entity
- `UserRepository.java` - Database access
- `PasswordResetToken.java` - Password reset token entity
- `SecurityConfig.java` - Spring Security configuration
- `EmailService.java` - Email sending service

### Frontend Files
- `Login.jsx` - Login page component
- `Signup.jsx` - Registration page component
- `ResetPassword.jsx` - Password reset page
- `authStore.js` - Zustand state management
- `api.js` - Axios API client
- `FaceLoginModal.jsx` - Biometric login
- `FaceCapture.jsx` - Biometric enrollment

## 🚀 Deployment Guide

### Environment Setup

```bash
# Set required environment variables
export JWT_SECRET="your-256-bit-secret-key"
export SMTP_USERNAME="your-email@gmail.com"
export SMTP_PASSWORD="your-app-password"
export CORS_ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
export FRONTEND_URL="https://yourdomain.com"
export DB_URL="jdbc:postgresql://hostname:5432/dbname"
export DB_USERNAME="postgres-user"
export DB_PASSWORD="postgres-password"
```

### Database Initialization

Migrations are handled automatically by Flyway. No manual setup needed.

### Frontend Build

```bash
cd frontend/nyaysetu-frontend
npm install
npm run build
```

### Backend Build

```bash
cd backend/nyaysetu-backend
mvn clean package
java -jar target/nyaysetu-backend.jar
```

## 🔗 API Integration Examples

### JavaScript/Fetch
```javascript
// Register
const registerResponse = await fetch('http://localhost:8080/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    password: 'SecurePass123!',
    role: 'LITIGANT'
  })
});

// Login
const loginResponse = await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

// Protected Request
const protectedResponse = await fetch('http://localhost:8080/api/v1/cases', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

### cURL
```bash
# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "name":"John Doe",
    "password":"SecurePass123!",
    "role":"LITIGANT"
  }'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Refresh Token
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'
```

## 🐛 Troubleshooting

### JWT Secret Error
**Problem**: "JWT_SECRET environment variable is required in non-development deployments"
**Solution**: Set JWT_SECRET environment variable with at least 256 bits of entropy

### CORS Error
**Problem**: "Access to XMLHttpRequest blocked by CORS policy"
**Solution**: Ensure frontend URL is in CORS_ALLOWED_ORIGINS environment variable

### Email Not Sending
**Problem**: "Failed to send password reset email"
**Solution**: Verify SMTP credentials and Gmail app-specific password (if using Gmail)

### Token Expired Error
**Problem**: "Token refresh failed. Please login again."
**Solution**: Refresh token may have expired (7 days). User needs to login again

### Duplicate Email Error
**Problem**: "Email already exists"
**Solution**: User should use a different email or click "Login" instead of "Sign Up"

## 📞 Support & Documentation

For more information, refer to:
- Spring Security Documentation: https://spring.io/projects/spring-security
- JWT RFC 7519: https://tools.ietf.org/html/rfc7519
- React Router: https://reactrouter.com/
- Zustand: https://github.com/pmndrs/zustand

---

**Last Updated**: June 2026
**Implementation Issue**: #937
**Status**: ✅ Complete
