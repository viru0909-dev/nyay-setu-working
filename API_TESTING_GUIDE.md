# API Testing & Integration Guide for Contributors

## Overview

This guide provides comprehensive instructions for developers and contributors to understand, test, and integrate with the Nyay Setu APIs. The platform consists of multiple microservices exposing **100+ API endpoints** across different domains.

## Table of Contents

1. [Getting Started](#getting-started)
2. [API Architecture](#api-architecture)
3. [Authentication](#authentication)
4. [Testing with Postman](#testing-with-postman)
5. [Testing with cURL](#testing-with-curl)
6. [Testing with Code](#testing-with-code)
7. [API Endpoint Categories](#api-endpoint-categories)
8. [Common Workflows](#common-workflows)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

- **Node.js** (v14+) for signaling server
- **Java 11+** for backend
- **Python 3.8+** for microservices
- **Docker & Docker Compose** (optional but recommended)
- **Postman** (optional) for API testing
- **cURL** or similar HTTP client

### Quick Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### Local Development Setup

#### 1. Backend Service (Spring Boot)
```bash
cd backend/nyaysetu-backend
mvn clean install
mvn spring-boot:run

# Runs on http://localhost:8080
```

#### 2. LawGPT Service (Python)
```bash
cd lawgpt-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Runs on http://localhost:8000
```

#### 3. NLP Orchestrator (Python)
```bash
cd nlp-orchestrator
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

# Runs on http://localhost:8001
```

#### 4. Signaling Server (Node.js)
```bash
cd signaling-server
npm install
npm start

# Runs on http://localhost:3001
```

---

## API Architecture

### Service Topology

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                    │
│                     http://localhost:3000                    │
└────────────┬────────────┬─────────────────┬──────────────────┘
             │            │                 │
    ┌────────▼────┐  ┌────▼─────┐  ┌──────▼────────┐
    │   Backend   │  │  LawGPT  │  │ NLP Orchestrator│
    │  (Port 8080)│  │(Port 8000)│  │   (Port 8001)  │
    └────────┬────┘  └────┬─────┘  └──────┬────────┘
             │            │                 │
             └────────────┼─────────────────┘
                          │
         ┌────────────────▼─────────────────┐
         │   External Services              │
         │ - Groq AI                        │
         │ - Google Gemini                  │
         │ - Ollama (Local LLM)            │
         │ - Kanoon.org (Legal Research)   │
         └────────────────────────────────┘

    ┌──────────────────────────────────┐
    │   Signaling Server (Port 3001)   │
    │   WebSocket for Video Calls      │
    └──────────────────────────────────┘
```

### Service Responsibilities

| Service | Purpose | Key Features |
|---------|---------|--------------|
| **Backend** | Core business logic | Auth, Cases, Documents, Evidence, Hearings, Orders |
| **LawGPT** | Document generation | Affidavits, RTI, Complaints, Notices, Petitions |
| **NLP Orchestrator** | Legal reasoning | 5-layer analysis, Forensics, Modi OCR, Streaming |
| **Signaling Server** | Real-time communication | WebRTC, Video calls, Peer-to-peer |

---

## Authentication

### JWT Token Flow

All API requests require authentication using JWT tokens.

#### Step 1: Register a User
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "role": "LAWYER",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+919876543210"
  }'
```

#### Step 2: Login to Get Token
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "LAWYER"
  }
}
```

#### Step 3: Use Token in Requests
```bash
curl -X GET http://localhost:8080/cases \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Token Refresh

When a token expires (24 hours), use the refresh token:

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### User Roles

| Role | Permissions | Endpoints |
|------|------------|-----------|
| **USER** | View own cases | Case listing, document viewing |
| **LAWYER** | Create/manage cases | All case operations, draft generation |
| **JUDGE** | Case assignment, orders | Case cognizance, summons, orders |
| **POLICE** | FIR management | FIR operations, investigation |
| **ADMIN** | Full system access | All endpoints |

---

## Testing with Postman

### Setup Instructions

1. **Import Collection**
   - Open Postman
   - Click "Import" → Select `Nyay_Setu_API_Collection.postman_collection.json`
   - Collection is automatically imported with all endpoints

2. **Create Environment**
   - Click "Environments" → "Create New"
   - Add variables:
     ```
     baseUrl: http://localhost:8080
     authToken: (auto-filled after login)
     refreshToken: (auto-filled after login)
     caseId: (auto-filled after case creation)
     documentId: (auto-filled after document upload)
     ```

3. **Run Login Request First**
   - Go to "Authentication" → "Login"
   - Click "Send"
   - Token automatically sets in environment

4. **Use Auto-populated Variables**
   - All subsequent requests use stored `authToken`
   - IDs are auto-populated from previous responses

### Testing Workflow Example

**Step 1: Login**
```
1. Open "Authentication" folder
2. Click "Login" request
3. Click "Send"
4. Check response - token is auto-saved
```

**Step 2: Create a Case**
```
1. Open "Cases" folder
2. Click "Create Case"
3. Update body with your details
4. Click "Send"
5. Case ID is auto-saved to environment
```

**Step 3: Upload Document**
```
1. Open "Documents" folder
2. Click "Upload Document"
3. Select file to upload
4. Click "Send"
5. Document ID is auto-saved
```

**Step 4: Analyze Document**
```
1. Click "Analyze Document"
2. Click "Send"
3. View AI analysis results
```

### Advanced Postman Features

#### Running Collections with Newman
```bash
# Install Newman
npm install -g newman

# Run collection with environment
newman run Nyay_Setu_API_Collection.postman_collection.json \
  -e postman_environment.json \
  --reporter cli
```

#### Generate Test Results
```bash
# Output JSON report
newman run Nyay_Setu_API_Collection.postman_collection.json \
  -e postman_environment.json \
  --reporter json --reporter-json-export results.json
```

---

## Testing with cURL

### Basic Authentication

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

### Example Workflows

#### 1. Create a Case
```bash
curl -X POST http://localhost:8080/cases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smith vs. Johnson - Property Dispute",
    "description": "Civil dispute regarding property ownership",
    "court": "District Court, Delhi",
    "caseType": "CIVIL",
    "parties": [
      {"name": "John Smith", "role": "PLAINTIFF"},
      {"name": "Jane Johnson", "role": "DEFENDANT"}
    ]
  }' | jq '.'
```

#### 2. List Cases
```bash
curl -X GET "http://localhost:8080/cases?page=0&size=20&sort=createdAt,desc" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

#### 3. Upload Document
```bash
CASE_ID="uuid-of-your-case"

curl -X POST http://localhost:8080/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "caseId=$CASE_ID" \
  -F "documentType=COMPLAINT" \
  -F "file=@/path/to/document.pdf"
```

#### 4. Generate Legal Document
```bash
curl -X POST http://localhost:8000/lawgpt/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "AFFIDAVIT",
    "caseId": "'$CASE_ID'",
    "context": {
      "deponentName": "John Smith",
      "deponentRole": "PLAINTIFF",
      "statements": ["I own the property since 2020"]
    },
    "language": "EN"
  }' | jq '.'
```

#### 5. Analyze Case with NLP (Streaming)
```bash
curl -X POST http://localhost:8001/nlp/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "caseId": "'$CASE_ID'",
    "query": "What are the legal implications?",
    "analysisDepth": "STANDARD"
  }' \
  --raw
```

---

## Testing with Code

### Python Example

```python
import requests
import json
from typing import Dict, Optional

class NyaySetuClient:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()
    
    def login(self, email: str, password: str) -> bool:
        """Login and store token"""
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data['token']
            self.session.headers.update({
                'Authorization': f'Bearer {self.token}'
            })
            return True
        return False
    
    def create_case(self, case_data: Dict) -> Optional[Dict]:
        """Create a new case"""
        response = self.session.post(
            f"{self.base_url}/cases",
            json=case_data
        )
        if response.status_code == 201:
            return response.json()
        raise Exception(f"Error: {response.status_code} - {response.text}")
    
    def upload_document(self, case_id: str, file_path: str, 
                       doc_type: str = "COMPLAINT") -> Optional[Dict]:
        """Upload a document"""
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {
                'caseId': case_id,
                'documentType': doc_type
            }
            response = self.session.post(
                f"{self.base_url}/documents/upload",
                files=files,
                data=data
            )
        if response.status_code == 201:
            return response.json()
        raise Exception(f"Error: {response.status_code} - {response.text}")
    
    def list_cases(self, page: int = 0, size: int = 20) -> Dict:
        """List all cases"""
        response = self.session.get(
            f"{self.base_url}/cases",
            params={'page': page, 'size': size, 'sort': 'createdAt,desc'}
        )
        return response.json()
    
    def get_case(self, case_id: str) -> Dict:
        """Get case details"""
        response = self.session.get(f"{self.base_url}/cases/{case_id}")
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Case not found: {case_id}")
    
    def generate_legal_document(self, case_id: str, doc_type: str,
                               context: Dict, language: str = "EN") -> Dict:
        """Generate AI-powered legal document"""
        response = self.session.post(
            "http://localhost:8000/lawgpt/generate",
            json={
                "documentType": doc_type,
                "caseId": case_id,
                "context": context,
                "language": language
            }
        )
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Generation failed: {response.status_code}")

# Usage Example
if __name__ == "__main__":
    client = NyaySetuClient()
    
    # Login
    if client.login("user@example.com", "SecurePassword123"):
        print("✓ Logged in successfully")
    else:
        print("✗ Login failed")
        exit(1)
    
    # Create case
    case_data = {
        "title": "Smith vs. Johnson - Property Dispute",
        "description": "Property boundary dispute",
        "court": "District Court, Delhi",
        "caseType": "CIVIL",
        "parties": [
            {"name": "John Smith", "role": "PLAINTIFF"},
            {"name": "Jane Johnson", "role": "DEFENDANT"}
        ]
    }
    case = client.create_case(case_data)
    case_id = case['id']
    print(f"✓ Case created: {case_id}")
    
    # Upload document
    # doc = client.upload_document(case_id, "path/to/document.pdf")
    # print(f"✓ Document uploaded: {doc['id']}")
    
    # List cases
    cases = client.list_cases()
    print(f"✓ Found {cases['totalElements']} cases")
    
    # Generate legal document
    # affidavit = client.generate_legal_document(
    #     case_id, 
    #     "AFFIDAVIT",
    #     {
    #         "deponentName": "John Smith",
    #         "deponentRole": "PLAINTIFF",
    #         "statements": ["I own the property since 2020"]
    #     }
    # )
    # print(f"✓ Affidavit generated")
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

class NyaySetuClient {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
    this.token = null;
    this.client = axios.create();
  }

  async login(email, password) {
    try {
      const response = await this.client.post(`${this.baseUrl}/auth/login`, {
        email,
        password
      });
      this.token = response.data.token;
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      return response.data;
    } catch (error) {
      console.error('Login failed:', error.response?.data);
      throw error;
    }
  }

  async createCase(caseData) {
    try {
      const response = await this.client.post(`${this.baseUrl}/cases`, caseData);
      return response.data;
    } catch (error) {
      console.error('Case creation failed:', error.response?.data);
      throw error;
    }
  }

  async listCases(page = 0, size = 20) {
    try {
      const response = await this.client.get(`${this.baseUrl}/cases`, {
        params: { page, size, sort: 'createdAt,desc' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to list cases:', error.response?.data);
      throw error;
    }
  }

  async generateDocument(documentType, caseId, context, language = 'EN') {
    try {
      const response = await axios.post(`http://localhost:8000/lawgpt/generate`, {
        documentType,
        caseId,
        context,
        language
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Document generation failed:', error.response?.data);
      throw error;
    }
  }
}

// Usage Example
(async () => {
  const client = new NyaySetuClient();
  
  // Login
  await client.login('user@example.com', 'SecurePassword123');
  console.log('✓ Logged in successfully');
  
  // Create case
  const case_ = await client.createCase({
    title: 'Smith vs. Johnson - Property Dispute',
    description: 'Property boundary dispute',
    court: 'District Court, Delhi',
    caseType: 'CIVIL',
    parties: [
      { name: 'John Smith', role: 'PLAINTIFF' },
      { name: 'Jane Johnson', role: 'DEFENDANT' }
    ]
  });
  console.log('✓ Case created:', case_.id);
  
  // List cases
  const cases = await client.listCases();
  console.log(`✓ Found ${cases.totalElements} cases`);
})();
```

---

## API Endpoint Categories

### 1. Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Password reset

### 2. Case Management
- `GET /cases` - List cases
- `POST /cases` - Create case
- `GET /cases/{caseId}` - Get case details
- `PUT /cases/{caseId}` - Update case
- `DELETE /cases/{caseId}` - Archive case
- `POST /cases/{caseId}/status` - Change case status

### 3. Document Management
- `POST /documents/upload` - Upload document
- `GET /documents` - List documents
- `GET /documents/{documentId}` - Get document details
- `POST /documents/{documentId}/analyze` - AI analysis
- `GET /documents/{documentId}/download` - Download document

### 4. Evidence Management
- `POST /evidence` - Add evidence
- `GET /evidence` - List evidence
- `GET /evidence/{evidenceId}` - Get evidence details
- `POST /evidence/{evidenceId}/verify` - Blockchain verification

### 5. Hearings
- `POST /hearings` - Schedule hearing
- `GET /hearings` - List hearings
- `PUT /hearings/{hearingId}` - Update hearing
- `POST /hearings/{hearingId}/record` - Record hearing outcome

### 6. Court Orders
- `POST /orders` - Issue order
- `GET /orders` - List orders
- `PUT /orders/{orderId}` - Update order

### 7. Legal Document Generation (LawGPT)
- `POST /lawgpt/generate` - Generate document
- `GET /lawgpt/templates` - List templates

### 8. Legal Reasoning (NLP Orchestrator)
- `POST /nlp/analyze` - Analyze case (with streaming)
- `POST /forensics/analyze` - Forensic analysis
- `POST /modi/ocr` - Modi script OCR

---

## Common Workflows

### Workflow 1: Creating and Managing a Case

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lawyer@example.com","password":"Pass123"}' \
  | jq -r '.token')

# 2. Create case
CASE=$(curl -s -X POST http://localhost:8080/cases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smith vs Johnson",
    "court": "District Court",
    "caseType": "CIVIL",
    "parties": [
      {"name": "John Smith", "role": "PLAINTIFF"},
      {"name": "Jane Johnson", "role": "DEFENDANT"}
    ]
  }')

CASE_ID=$(echo $CASE | jq -r '.id')

# 3. Upload document
curl -X POST http://localhost:8080/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "caseId=$CASE_ID" \
  -F "documentType=COMPLAINT" \
  -F "file=@complaint.pdf"

# 4. Schedule hearing
curl -X POST http://localhost:8080/hearings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "'$CASE_ID'",
    "scheduledDate": "2026-07-15T10:00:00Z",
    "courtroom": "Room 301",
    "hearingType": "PHYSICAL"
  }'
```

### Workflow 2: Document Generation and Analysis

```bash
# 1. Generate affidavit
AFFIDAVIT=$(curl -s -X POST http://localhost:8000/lawgpt/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "AFFIDAVIT",
    "caseId": "'$CASE_ID'",
    "context": {
      "deponentName": "John Smith",
      "deponentRole": "PLAINTIFF",
      "statements": ["I own the property", "Dispute started in 2023"]
    },
    "language": "EN"
  }')

# 2. Analyze case with legal reasoning
curl -X POST http://localhost:8001/nlp/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "caseId": "'$CASE_ID'",
    "query": "What are legal remedies for property dispute?",
    "analysisDepth": "DEEP"
  }'
```

### Workflow 3: Evidence Management with Blockchain

```bash
# 1. Add evidence with chain of custody
EVIDENCE=$(curl -s -X POST http://localhost:8080/evidence \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "'$CASE_ID'",
    "title": "Property Deed",
    "description": "Original property deed with stamps",
    "evidenceType": "DOCUMENT",
    "chainOfCustody": {
      "collectedBy": "John Smith",
      "collectionDate": "2026-06-01T10:30:00Z",
      "location": "Registry Office"
    }
  }')

EVIDENCE_ID=$(echo $EVIDENCE | jq -r '.evidenceId')
HASH=$(echo $EVIDENCE | jq -r '.blockchainHash')

echo "Evidence stored with blockchain hash: $HASH"

# 2. Verify evidence integrity
curl -X POST http://localhost:8080/evidence/$EVIDENCE_ID/verify \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### Common Issues

#### 1. Authentication Failures

**Error:** `401 Unauthorized`

**Solutions:**
```bash
# Check if token is expired
# Solution 1: Re-login to get new token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123"}' \
  | jq -r '.token')

# Solution 2: Refresh token
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

#### 2. Connection Refused

**Error:** `Connection refused`

**Solutions:**
```bash
# Check if services are running
docker-compose ps

# Start services
docker-compose up -d

# Check specific service port
netstat -an | grep 8080  # For backend
```

#### 3. Document Upload Fails

**Error:** `413 Payload Too Large`

**Solutions:**
- Maximum file size is 10MB
- Compress PDF or reduce resolution
- Split large documents

#### 4. SSE Streaming Not Working

**Error:** No streaming response from `/nlp/analyze`

**Solutions:**
```bash
# Ensure Accept header is set
curl -X POST http://localhost:8001/nlp/analyze \
  -H "Accept: text/event-stream" \
  ...
```

#### 5. CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solutions:**
- Check backend CORS configuration
- Frontend should use same base URL or proxy

### Debug Mode

Enable debug logging:

```bash
# Backend (Spring Boot)
export LOG_LEVEL=DEBUG
mvn spring-boot:run

# Python services
export LOG_LEVEL=DEBUG
python main.py
```

### Health Check Endpoints

```bash
# Backend health
curl http://localhost:8080/actuator/health

# LawGPT health
curl http://localhost:8000/health

# NLP Orchestrator health
curl http://localhost:8001/health

# Signaling server (if available)
curl http://localhost:3001/health
```

---

## Best Practices

### 1. API Design & Usage

✅ **DO:**
- Always authenticate before API calls
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Include descriptive error handling
- Set reasonable timeouts
- Validate input data before sending

❌ **DON'T:**
- Hardcode tokens in code
- Make synchronous blocking calls in UI
- Ignore error responses
- Send sensitive data in GET parameters
- Make unlimited parallel requests

### 2. Security

✅ **DO:**
- Store tokens securely (httpOnly cookies for web)
- Use HTTPS in production
- Implement rate limiting
- Validate file uploads
- Log security events

❌ **DON'T:**
- Expose tokens in logs
- Store passwords in code
- Trust client-side validation only
- Allow arbitrary file uploads
- Use default credentials

### 3. Performance

✅ **DO:**
- Cache responses appropriately
- Use pagination for large lists
- Implement connection pooling
- Monitor API response times
- Use pagination filters

❌ **DON'T:**
- Load all data at once
- Make duplicate API calls
- Ignore timeouts
- Create new connections per request

### 4. Testing

✅ **DO:**
- Test all CRUD operations
- Test error scenarios
- Test with actual data
- Test concurrent requests
- Document test cases

❌ **DON'T:**
- Only test happy paths
- Test in production
- Skip authorization tests
- Forget edge cases

### 5. Documentation

✅ **DO:**
- Document API requirements
- Provide code examples
- Explain error codes
- List required headers
- Include sample requests/responses

❌ **DON'T:**
- Use vague descriptions
- Assume knowledge
- Omit authentication details
- Forget error cases

### 6. Error Handling

Implement proper error handling:

```python
try:
    response = client.create_case(case_data)
except requests.exceptions.ConnectionError:
    print("Backend service is not running")
except requests.exceptions.Timeout:
    print("Request timed out")
except requests.exceptions.HTTPError as e:
    print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

---

## Additional Resources

- **OpenAPI Documentation:** See `openapi.yaml`
- **Postman Collection:** Import `Nyay_Setu_API_Collection.postman_collection.json`
- **API Quick Reference:** See `API_QUICK_REFERENCE.md`
- **Full Endpoint List:** See `API_ENDPOINTS_COMPREHENSIVE.md`
- **Contributing Guide:** See `CONTRIBUTING.md`

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review comprehensive endpoint documentation
3. Check service logs: `docker-compose logs -f [service-name]`
4. Create GitHub issue with details
5. Contact team at support@nyaysetu.in
