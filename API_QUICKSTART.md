# API Documentation Quick Start

Welcome to Nyay Setu API! This guide helps you get started with our **100+ API endpoints** in minutes.

## 🚀 5-Minute Setup

### 1. Start All Services
```bash
docker-compose up -d
```

### 2. Create Account & Login
```bash
# Save token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}' | jq -r '.token')

echo "Token: $TOKEN"
```

### 3. Make Your First API Call
```bash
curl -X GET http://localhost:8080/cases \
  -H "Authorization: Bearer $TOKEN"
```

✅ Success! You're connected to the API.

---

## 📚 Documentation Files

| File | Purpose | Best For |
|------|---------|----------|
| **openapi.yaml** | Complete API specification | Swagger/OpenAPI tools |
| **API_TESTING_GUIDE.md** | Comprehensive testing guide | Learning to test APIs |
| **API_ENDPOINTS_COMPREHENSIVE.md** | Detailed endpoint documentation | Finding specific endpoints |
| **API_QUICK_REFERENCE.md** | Quick lookup by role | Quick answers |
| **API_INTEGRATION_CHECKLIST.md** | Integration checklist | Building features |
| **Nyay_Setu_API_Collection.postman_collection.json** | Postman collection | Interactive testing |

---

## 🔑 Quick API Reference

### Authentication
```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -d '{"email":"user@example.com","password":"pass"}'

# Use token in requests
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/cases
```

### Cases
```bash
# List cases
curl http://localhost:8080/cases -H "Authorization: Bearer $TOKEN"

# Create case
curl -X POST http://localhost:8080/cases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Case Title","court":"District Court","caseType":"CIVIL"}'

# Get case
curl http://localhost:8080/cases/{caseId} -H "Authorization: Bearer $TOKEN"
```

### Documents
```bash
# Upload document
curl -X POST http://localhost:8080/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "caseId={caseId}" \
  -F "documentType=COMPLAINT" \
  -F "file=@document.pdf"

# Analyze document (AI)
curl -X POST http://localhost:8080/documents/{documentId}/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"analysisType":"LEGAL_REVIEW"}'
```

### Legal Documents (LawGPT)
```bash
# Generate Affidavit
curl -X POST http://localhost:8000/lawgpt/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType":"AFFIDAVIT",
    "caseId":"{caseId}",
    "context":{"deponentName":"John","statements":["I own property"]},
    "language":"EN"
  }'
```

### Legal Reasoning (NLP)
```bash
# Analyze with legal reasoning (streaming)
curl -X POST http://localhost:8001/nlp/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: text/event-stream" \
  -d '{"caseId":"{caseId}","query":"What are legal implications?"}'
```

---

## 🛠️ Testing Methods

### Method 1: Postman (Easiest)
1. Open Postman
2. Import `Nyay_Setu_API_Collection.postman_collection.json`
3. Click "Login" request
4. Click "Send"
5. All endpoints ready to use

### Method 2: cURL (Terminal)
```bash
# See "Quick API Reference" above
```

### Method 3: Python
```python
import requests

# Login
response = requests.post('http://localhost:8080/auth/login', 
  json={'email':'user@example.com', 'password':'pass'})
token = response.json()['token']

# List cases
cases = requests.get('http://localhost:8080/cases',
  headers={'Authorization': f'Bearer {token}'})
print(cases.json())
```

### Method 4: JavaScript
```javascript
// Login
const login = await fetch('http://localhost:8080/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email:'user@example.com', password:'pass'})
});
const {token} = await login.json();

// List cases
const cases = await fetch('http://localhost:8080/cases', {
  headers: {'Authorization': `Bearer ${token}`}
});
console.log(await cases.json());
```

---

## 📊 Service Architecture

```
┌─ Backend (Port 8080) ────────────────────┐
│ Cases, Documents, Evidence, Hearings, etc │
└──────────────────────────────────────────┘

┌─ LawGPT (Port 8000) ─────────────────────┐
│ AI Document Generation                    │
│ (Affidavit, RTI, Complaint, etc)         │
└──────────────────────────────────────────┘

┌─ NLP Orchestrator (Port 8001) ───────────┐
│ Legal Reasoning, Forensics, Modi OCR      │
└──────────────────────────────────────────┘

┌─ Signaling Server (Port 3001) ───────────┐
│ WebRTC Communication                      │
└──────────────────────────────────────────┘
```

---

## 🎯 Common Tasks

### Create & Manage a Case
```bash
# 1. Login (get token first)

# 2. Create case
CASE=$(curl -X POST http://localhost:8080/cases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Smith vs Johnson",
    "court":"District Court",
    "caseType":"CIVIL",
    "parties":[
      {"name":"John Smith","role":"PLAINTIFF"},
      {"name":"Jane Johnson","role":"DEFENDANT"}
    ]
  }')

CASE_ID=$(echo $CASE | jq '.id')

# 3. Upload document
curl -X POST http://localhost:8080/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "caseId=$CASE_ID" \
  -F "documentType=COMPLAINT" \
  -F "file=@complaint.pdf"

# 4. Generate affidavit
curl -X POST http://localhost:8000/lawgpt/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType":"AFFIDAVIT",
    "caseId":"'$CASE_ID'",
    "context":{
      "deponentName":"John Smith",
      "statements":["I own the property"]
    }
  }'
```

### Handle Streaming Response
```bash
# For SSE streaming, pipe to line handler
curl -X POST http://localhost:8001/nlp/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: text/event-stream" \
  -d '{"caseId":"'$CASE_ID'","query":"Legal implications?"}' | grep -o 'data:.*'
```

---

## ⚡ API Status & Health

```bash
# Check all services
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:8000/health          # LawGPT
curl http://localhost:8001/health          # NLP Orchestrator

# View all running services
docker-compose ps
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **401 Unauthorized** | Get new token: `curl -X POST .../auth/login` |
| **Connection refused** | Start services: `docker-compose up -d` |
| **404 Not found** | Check endpoint path in documentation |
| **CORS error** | Use backend as proxy or check CORS config |
| **Timeout** | Check service logs: `docker-compose logs -f [service]` |

---

## 📖 Learn More

- **Full Testing Guide** → [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)
- **All Endpoints** → [API_ENDPOINTS_COMPREHENSIVE.md](API_ENDPOINTS_COMPREHENSIVE.md)
- **Quick Lookup** → [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
- **OpenAPI Spec** → [openapi.yaml](openapi.yaml)
- **Integration Checklist** → [API_INTEGRATION_CHECKLIST.md](API_INTEGRATION_CHECKLIST.md)

---

## 🚀 Next Steps

1. **Import Postman Collection** - Easiest way to explore APIs
2. **Read API_TESTING_GUIDE.md** - Learn comprehensive testing
3. **Try Sample Workflows** - Create a case end-to-end
4. **Review Authentication** - Understand JWT token flow
5. **Integrate in Code** - Use Python/JavaScript examples

---

## 💡 Tips

- Save token in environment variable: `export TOKEN="your-token"`
- Use `jq` for JSON formatting: `curl ... | jq '.'`
- Check service logs for errors: `docker-compose logs [service]`
- Set base URL environment variable: `export BASE_URL="http://localhost:8080"`
- Copy exact commands from Postman for cURL equivalents

---

## ❓ FAQ

**Q: How do I authenticate?**
A: POST `/auth/login` with email/password to get JWT token, then use in `Authorization: Bearer <token>` header.

**Q: Can I test without Postman?**
A: Yes! Use cURL, Python, JavaScript, or any HTTP client. See examples above.

**Q: How long is token valid?**
A: Tokens expire in 24 hours. Use refresh token to get new token.

**Q: What are streaming endpoints?**
A: `/nlp/analyze` returns Server-Sent Events (SSE). Use `Accept: text/event-stream` header.

**Q: How is evidence secured?**
A: Evidence is hashed with SHA-256 and stored on blockchain for immutability verification.

**Q: Can I generate legal documents?**
A: Yes! Use LawGPT service (`/lawgpt/generate`) for affidavits, RTI, complaints, etc.

**Q: How do I upload files?**
A: Use multipart form-data with `/documents/upload` endpoint (max 10MB).

---

## 📞 Support

- **Issues?** Check [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md#troubleshooting)
- **Stuck?** Review [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
- **Questions?** Create GitHub issue
- **Help?** Email: support@nyaysetu.in

---

Happy coding! 🎉
