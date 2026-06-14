# Authentication Quick Reference Guide

## 🚀 Quick Start

### For Users

#### Sign Up (New Users)
1. Click "Sign Up" button on landing page
2. Enter full name, email, password, confirm password
3. Choose role (Litigant, Lawyer, Judge)
4. Verify password strength indicator (all 4 checks must pass):
   - ✓ At least 8 characters
   - ✓ At least one uppercase letter (A-Z)
   - ✓ At least one number (0-9)
   - ✓ At least one special character (@#$!%*?&)
5. Click "Sign Up"
6. Optional: Enroll face biometric for future login
7. Redirected to dashboard

#### Log In
1. Enter email and password
2. Optionally select a specific role
3. Click "Log In"
4. Redirected to role-specific dashboard

#### Forgot Password
1. Click "Forgot Password" on login page
2. Enter email address
3. Check email for reset link (expires in 30 minutes)
4. Click link in email
5. Enter new password
6. Click "Reset Password"
7. Log in with new password

#### Face Login (If Enrolled)
1. Click "Log In with Face"
2. Allow camera access
3. Position face in camera frame
4. System verifies biometric
5. Auto-logged in if match succeeds

---

## 👨‍💻 For Developers

### Backend API Calls

#### Using cURL

**Register:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123!",
    "role": "LITIGANT"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Refresh Token:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token-here"}'
```

**Protected Endpoint:**
```bash
curl -X GET http://localhost:8080/api/v1/cases \
  -H "Authorization: Bearer your-access-token-here"
```

#### Using Postman

1. Create POST request to `http://localhost:8080/api/v1/auth/login`
2. Set Body → JSON
3. Input: `{"email":"test@example.com","password":"TestPass123!"}`
4. Send
5. Copy `token` or `accessToken` from response
6. In Headers, add: `Authorization: Bearer <token>`
7. Use header for protected endpoints

#### Using JavaScript/Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1'
});

// Register
const register = async () => {
  const response = await api.post('/auth/register', {
    email: 'test@example.com',
    name: 'Test User',
    password: 'TestPass123!',
    role: 'LITIGANT'
  });
  return response.data;
};

// Login
const login = async () => {
  const response = await api.post('/auth/login', {
    email: 'test@example.com',
    password: 'TestPass123!'
  });
  const { token } = response.data;
  localStorage.setItem('token', token);
  return response.data;
};

// Protected call
const getCases = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/cases', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete Registration Flow

**Steps:**
1. Open http://localhost:5173
2. Click "Sign Up"
3. Fill form:
   - Name: "Rajesh Kumar"
   - Email: "rajesh@example.com"
   - Password: "MySecurePass123!"
   - Confirm: "MySecurePass123!"
   - Role: "LITIGANT"
4. Verify password strength is "Strong"
5. Click "Sign Up"

**Expected Results:**
- ✓ No errors displayed
- ✓ Redirected to Litigant dashboard
- ✓ User name appears in header
- ✓ Token stored in localStorage

**Backend Verification:**
```bash
# Check user was created
curl http://localhost:8080/api/v1/users/search?email=rajesh@example.com \
  -H "Authorization: Bearer <admin-token>"
```

---

### Scenario 2: Login with Invalid Credentials

**Steps:**
1. Open http://localhost:5173
2. Click "Log In"
3. Enter:
   - Email: "rajesh@example.com"
   - Password: "WrongPassword123!"
4. Click "Log In"

**Expected Results:**
- ✓ Error message: "Invalid email or password"
- ✓ Not redirected
- ✓ Form remains visible

---

### Scenario 3: Register with Weak Password

**Steps:**
1. Open Sign Up page
2. Fill form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "weak"
   - Confirm: "weak"
3. Observe password strength indicator

**Expected Results:**
- ✓ Strength shown as "Weak"
- ✓ Missing requirements highlighted in red:
  - At least 8 characters ✗
  - Uppercase letter ✗
  - Number ✗
  - Special character ✗
- ✓ Sign Up button may be disabled or error shown on submit

---

### Scenario 4: Duplicate Email Registration

**Steps:**
1. Try to register with an email that already exists
2. Fill form with existing email

**Expected Results:**
- ✓ Error message: "Email already exists. Please use a different email or login."

---

### Scenario 5: Password Reset Flow

**Steps:**
1. On login page, click "Forgot Password"
2. Enter email: "rajesh@example.com"
3. Check development console for reset link (or email in production)
4. Copy reset link to browser
5. Enter new password: "NewPassword123!"
6. Confirm: "NewPassword123!"
7. Click "Reset Password"
8. Redirected to login
9. Log in with new password

**Expected Results:**
- ✓ Old password no longer works
- ✓ New password works for login
- ✓ Token is generated and stored

---

### Scenario 6: Token Expiry and Refresh

**Steps:**
1. Login successfully
2. Store token expiry time
3. Wait for token to expire (15 minutes in production, configurable)
4. Try to access protected endpoint

**Expected Results:**
- ✓ Frontend detects 401 error
- ✓ Frontend calls refresh endpoint with refreshToken
- ✓ New accessToken received
- ✓ Original request retried with new token
- ✓ Request succeeds

**Manual Test:**
```javascript
// In browser console
const token = localStorage.getItem('token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token expires at:', new Date(payload.exp * 1000));
```

---

### Scenario 7: Session Persistence

**Steps:**
1. Log in successfully
2. Close browser window completely
3. Reopen browser and navigate to app
4. Go to protected page without logging in

**Expected Results:**
- ✓ User remains logged in
- ✓ No redirect to login
- ✓ User data still available

---

### Scenario 8: Auto-Logout on Expired Session

**Steps:**
1. Log in successfully
2. Manually delete or expire token from localStorage
3. Try to access protected endpoint
4. Or wait for refresh token to expire

**Expected Results:**
- ✓ Auto-logout triggered
- ✓ Redirected to login page
- ✓ Message: "Your session expired. Please log in again."

---

## 🔍 Debugging Guide

### Check Token Content

```javascript
// In browser console
const token = localStorage.getItem('token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('User:', payload.sub);
console.log('Expires:', new Date(payload.exp * 1000));
console.log('Issued At:', new Date(payload.iat * 1000));
```

### Verify JWT Secret

```bash
# In backend logs - should see JWT secret validation
docker logs <container-id> | grep -i "jwt"
```

### Test SMTP Email Sending

```bash
# Check SMTP configuration in logs
docker logs <container-id> | grep -i "smtp"

# If no SMTP configured, check fallback logs
docker logs <container-id> | grep -i "password reset"
```

### Enable Debug Logging

```properties
# In application.properties
logging.level.com.nyaysetu.backend.controller.AuthController=DEBUG
logging.level.com.nyaysetu.backend.service.AuthService=DEBUG
logging.level.com.nyaysetu.backend.filter.JwtAuthFilter=DEBUG
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "JWT_SECRET environment variable is required"

**Cause**: JWT_SECRET not set in non-dev environment
**Solution**:
```bash
export JWT_SECRET=$(openssl rand -base64 32)
java -jar app.jar
```

---

### Issue 2: "Access to XMLHttpRequest blocked by CORS policy"

**Cause**: Frontend URL not in CORS_ALLOWED_ORIGINS
**Solution**:
```bash
export CORS_ALLOWED_ORIGINS="http://localhost:5173,https://yourdomain.com"
```

---

### Issue 3: "Failed to send email"

**Cause**: SMTP configuration incorrect
**Solution**:
```bash
export SMTP_USERNAME="your-email@gmail.com"
export SMTP_PASSWORD="your-app-password"  # Not regular password
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
```

---

### Issue 4: "Token expired" immediately after login

**Cause**: JWT expiration too short or system clock skew
**Solution**:
```bash
# Check system time
date

# Increase JWT expiration temporarily for testing
export JWT_EXPIRATION_MS=3600000  # 1 hour
```

---

### Issue 5: "User not found" error after registration

**Cause**: Email not committed to database
**Solution**: Check database connection and transaction settings

```bash
# Verify database is running
psql -h localhost -U postgres -c "SELECT COUNT(*) FROM ny_user;"
```

---

## 📊 Monitoring & Metrics

### Key Metrics to Track

```
Auth Endpoint Metrics:
- /auth/register - POST requests/failures
- /auth/login - POST requests/failures
- /auth/refresh - POST requests/failures
- 401 Errors - Token validation failures
- 403 Errors - Authorization failures
```

### Log Monitoring

```bash
# Monitor auth-related logs
tail -f logs/app.log | grep -i "auth"

# Monitor JWT validation
tail -f logs/app.log | grep -i "jwt"

# Monitor failed logins
tail -f logs/app.log | grep -i "invalid credentials"
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is set and strong (256+ bits)
- [ ] HTTPS enabled in production
- [ ] CORS restricted to known origins
- [ ] SMTP credentials not in logs
- [ ] Database backups enabled
- [ ] Rate limiting on auth endpoints
- [ ] Failed login attempts tracked
- [ ] Password reset tokens expire (30 min)
- [ ] Used reset tokens marked as used
- [ ] Email verification for new accounts (optional)

---

## 📞 Support Resources

- **Authentication Guide**: See `AUTHENTICATION_IMPLEMENTATION.md`
- **API Documentation**: See `API_DOCUMENTATION_SUMMARY.md`
- **Issue Tracker**: GitHub Issue #937
- **Contact**: Development team

---

**Last Updated**: June 2026
**Quick Reference Version**: 1.0
