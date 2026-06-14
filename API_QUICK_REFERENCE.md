# Nyay Setu API Quick Reference Guide

## Service Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Nyay Setu Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (React/Vite)                                          │
│  ├─ Port: 3000/5173                                            │
│  └─ WebSocket: ws://localhost:3001 (Hearing video)             │
│                                                                 │
│  Backend Services:                                              │
│  ├─ Spring Boot (8080)      ← Main API hub (/api/v1/*)        │
│  ├─ LawGPT (8000)           ← RAG + Doc generation            │
│  ├─ NLP Orchestrator (8001) ← Legal reasoning, Forensics, OCR │
│  └─ Signaling Server (3001) ← WebRTC for video calls          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

> **Routing note:** All Spring Boot (`localhost:8080`) endpoints are globally prefixed with `/api/v1` via `WebMvcConfig`. LawGPT and NLP Orchestrator are standalone Python/FastAPI services and are **not** affected by this prefix.

## Quick Endpoint Reference by Role

### 👨‍⚖️ LITIGANT (Client/Petitioner)

```bash
# Case Management
POST   /api/v1/cases                        → Create case
GET    /api/v1/cases                        → Get my cases
GET    /api/v1/cases/{id}                   → Get case details
PUT    /api/v1/cases/{id}                   → Update case

# Documents
POST   /api/v1/documents/upload             → Upload document
GET    /api/v1/documents                    → Get my documents
POST   /api/v1/documents/{id}/analyze       → Trigger AI analysis
GET    /api/v1/documents/{id}/analysis      → Get analysis results

# Evidence
POST   /api/v1/evidence/upload              → Upload evidence (blockchain)
GET    /api/v1/evidence/case/{caseId}       → View evidence for case

# Hearings
GET    /api/v1/hearings/my                  → Get my scheduled hearings
POST   /api/v1/hearings/{hearingId}/join    → Join hearing
POST   /api/v1/hearings/{hearingId}/leave   → Leave hearing

# Messages
GET    /api/v1/cases/{caseId}/messages      → Read case messages
POST   /api/v1/cases/{caseId}/messages      → Send message to lawyer

# Profile
POST   /api/v1/profile/create-or-update     → Update profile
POST   /api/v1/profile/{userId}/upload-picture → Profile picture

# Lawyer Proposal
POST   /api/v1/cases/{caseId}/respond-proposal → Accept/reject lawyer
```

### 👨‍⚖️ LAWYER

```bash
# Client Cases
GET    /api/v1/lawyer/cases                 → Get my client cases
GET    /api/v1/lawyer/clients               → Get my clients list
GET    /api/v1/lawyer/stats                 → Get my statistics

# Draft Management
POST   /api/v1/lawyer/draft                 → Generate draft from template
POST   /api/v1/lawyer/draft/save            → Save draft (no submission)

# Case Workflow
POST   /api/v1/cases/{id}/submit-draft      → Submit draft for approval
GET    /api/v1/cases                        → Get assigned cases
POST   /api/v1/cases/{id}/file-in-court     → File case in court (after approval)

# Documents
GET    /api/v1/documents/user/cases         → Get my case summaries
GET    /api/v1/documents/case/{caseId}      → Get case documents

# Hearings
POST   /api/v1/hearings/schedule            → Schedule hearing
GET    /api/v1/hearings/{hearingId}         → View hearing details
POST   /api/v1/hearings/{hearingId}/join    → Join hearing

# Messages
POST   /api/v1/cases/{caseId}/messages      → Message with client
```

### ⚖️ JUDGE

```bash
# Case Assignment
GET    /api/v1/judge/cases                  → Get my assigned cases
GET    /api/v1/judge/unassigned             → Get cases available to claim
POST   /api/v1/judge/cases/{id}/claim       → Take case from pool

# Summons & Orders
POST   /api/v1/judge/cases/{id}/issue-summons → Issue digital summons
GET    /api/v1/orders/case/{caseId}         → Get case orders
POST   /api/v1/orders                       → Create court order
PUT    /api/v1/orders/{orderId}             → Update order
GET    /api/v1/orders/my-orders             → Get my issued orders

# Hearings
POST   /api/v1/hearings/schedule            → Schedule hearing
POST   /api/v1/hearings/{hearingId}/participants → Add participant
PUT    /api/v1/hearings/{hearingId}/complete → Complete hearing
POST   /api/v1/hearings/{hearingId}/outcome → Record hearing outcome

# Case Transitions
POST   /api/v1/cases/transition/{id}/take-cognizance → Take cognizance
POST   /api/v1/cases/{id}/start-hearings    → Start hearing phase
POST   /api/v1/cases/{id}/deliver-verdict   → Deliver verdict

# Documents
GET    /api/v1/documents/case/{caseId}      → View case documents
GET    /api/v1/documents/{id}/analysis      → View AI analysis

# Analytics
GET    /api/v1/judge/analytics              → Judge dashboard stats
```

### 🚔 POLICE

```bash
# FIR Management
POST   /api/v1/police/fir/upload            → Upload FIR with SHA-256 stamp
GET    /api/v1/police/fir/list              → My FIRs
GET    /api/v1/police/fir/pending           → FIRs pending review
PUT    /api/v1/police/fir/{id}/status       → Approve/Reject FIR
POST   /api/v1/police/fir/{id}/verify       → Verify FIR integrity

# Summons Delivery
GET    /api/v1/police/summons/pending       → Pending delivery tasks
POST   /api/v1/police/summons/{caseId}/complete → Mark summons served

# Investigation
POST   /api/v1/police/investigation/{id}/start    → Start investigation
POST   /api/v1/police/investigation/{id}/evidence → Add evidence
POST   /api/v1/police/investigation/{id}/submit   → Submit findings
GET    /api/v1/police/investigation/list          → All investigations

# Statistics
GET    /api/v1/police/stats                 → Police dashboard stats
GET    /api/v1/police/health                → Service health check
```

---

## Authentication Flow

```
1. REGISTER → POST /api/v1/auth/register
   Response: JWT + Refresh Token + User Info
   
2. LOGIN → POST /api/v1/auth/login
   Response: JWT (short-lived, ~15 min) + Refresh Token (long-lived)
   
3. PROTECTED REQUESTS → Header: Authorization: Bearer {JWT}
   
4. TOKEN EXPIRED? → POST /api/v1/auth/refresh
   Body: {refreshToken}
   Response: New JWT
   
5. PASSWORD RESET:
   a. POST /api/v1/auth/forgot-password {email}
   b. Check email for reset link with token
   c. GET /api/v1/auth/verify-reset-token?token={token}
   d. POST /api/v1/auth/reset-password {token, newPassword}
```

---

## Document Generation (LawGPT)

```bash
# RAG Retrieval (Java calls Python — LawGPT service, port 8000)
POST http://localhost:8000/context
{
  "question": "What is Section 498A?",
  "max_results": 3
}

# Document Generation (LawGPT service, port 8000)
POST http://localhost:8000/generate
{
  "doc_type": "affidavit|rti|complaint|notice",
  "fields": {
    "petitioner_name": "John Doe",
    "petitioner_address": "123 Main St",
    "respondent_name": "Jane Smith",
    "case_description": "...",
    "incident_date": "2024-01-15",
    "relief_sought": "Interim order"
  },
  "language": "en|hi|hinglish"
}

Response: Generated legal document text + sources
```

---

## Legal Reasoning Pipeline (NLP Orchestrator)

### Real-time Streaming (Production)

```bash
# NLP Orchestrator service, port 8001
POST http://localhost:8001/api/legal/analyze-stream

Body: {
  "query": "What are the remedies under Section 12 of CPC?",
  "language": "en"
}

Server-Sent Events (SSE) stream:
├─ avatar_update        → "Aapka sawaal samajh raha hoon..."
├─ sub_questions        → [decomposed questions list]
├─ sub_answer          → Individual answers
├─ synthesis_token     → Real-time tokens (streaming)
├─ final_answer        → Complete markdown + Hinglish
└─ done                → Pipeline complete
```

### 5-Layer Pipeline Flow

```
Input Query
    ↓
[1] Decompose → Break into sub-questions
    ↓
[2] Route → Select AI model for each
    ↓
[3] Research → Parallel: Groq + Gemini + Indian Kanoon
    ↓
[4] Synthesize → Combine results + validate citations
    ↓
[5] Speak → Convert to Hinglish dialogue
    ↓
Output: Markdown + Hinglish + Citation validation
```

---

## Evidence & Blockchain

```bash
# Upload with blockchain hash
POST /api/v1/evidence/upload
{
  "file": <binary>,
  "caseId": "uuid",
  "title": "Crime scene photo",
  "evidenceType": "PHOTO"
}

Response: {
  "id": "evidence-uuid",
  "blockHash": "sha256hash",
  "blockIndex": 5,
  "verificationStatus": "VERIFIED"
}

# Verify integrity
GET /api/v1/evidence/{evidenceId}/verify
→ {
    "isVerified": true,
    "blockHash": "sha256...",
    "timestamp": "2024-06-01T10:30:00Z"
  }

# Verify entire chain
GET /api/v1/evidence/case/{caseId}/verify-chain
→ {
    "chainValid": true,
    "hashes": ["hash1", "hash2", ...],
    "timestamps": ["2024-06-01T10:00:00Z", ...]
  }
```

---

## Virtual Hearings (WebRTC)

### Socket.IO Events

```javascript
// Client connects and joins room
socket.emit('join-room', {
  roomId: 'hearing-uuid',
  userId: 'user-uuid',
  userName: 'Judge Smith'
});

// Server broadcasts
socket.on('user-connected', (userId, userName) => {
  // New participant joined
});

socket.on('existing-participants', (participantIds) => {
  // Get list of already-in-room participants
  // Initiate WebRTC peer connections
});

// WebRTC signaling
socket.emit('signal', {
  to: 'target-socket-id',
  signal: {type: 'offer', sdp: '...'}, // or 'answer' or 'candidate'
  userName: 'Alice'
});

socket.on('signal', ({signal, from, userName}) => {
  // Receive peer's signal, add to RTCPeerConnection
});

// Media controls
socket.emit('toggle-audio', {roomId, isAudioOn: true});
socket.emit('toggle-video', {roomId, isVideoOn: true});

// Leave
socket.emit('leave-room', roomId);
socket.on('user-disconnected', (socketId) => {
  // Peer left, close RTCPeerConnection
});
```

---

## Case State Machine

```
                   ┌─────────────────────────────────────────┐
                   │         LITIGANT SUBMITS                │
                   └─────────────────────────────────────────┘
                                    ↓
                              [DRAFT]
                                    ↓
                    ┌─────────────────────────────┐
                    │  LAWYER SUBMITS DRAFT       │
                    │  (submit-draft endpoint)    │
                    └─────────────────────────────┘
                                    ↓
                            [UNDER_REVIEW]
                                    ↓
         ┌──────────────────────────────────────────────┐
         │  CLIENT APPROVES DRAFT                       │
         │  POST /api/v1/cases/{id}/approve-draft       │
         └──────────────────────────────────────────────┘
                                    ↓
                            [SUBMITTED]
                                    ↓
         ┌──────────────────────────────────────────────┐
         │  JUDGE TAKES COGNIZANCE                      │
         │  POST /api/v1/judge/cases/{id}/claim         │
         └──────────────────────────────────────────────┘
                                    ↓
                      [COGNIZANCE_PERIOD]
                                    ↓
         ┌──────────────────────────────────────────────┐
         │  JUDGE ISSUES SUMMONS                        │
         │  POST /api/v1/judge/cases/{id}/issue-summons │
         └──────────────────────────────────────────────┘
                                    ↓
                        [SUMMONS_SERVED]
                                    ↓
                    ┌───────────────────────────┐
                    │  HEARINGS BEGIN           │
                    │  /api/v1/hearings/schedule│
                    └───────────────────────────┘
                                    ↓
                          [IN_PROGRESS]
                     (hearing → evidence → arguments)
                                    ↓
         ┌──────────────────────────────────────────────┐
         │  JUDGE DELIVERS VERDICT                      │
         │  POST /api/v1/cases/{id}/deliver-verdict     │
         └──────────────────────────────────────────────┘
                                    ↓
                          [COMPLETED]
```

---

## Error Handling & Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | User lacks permission (wrong role) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Operation violates state (e.g., already approved) |
| 500 | Server Error | Unexpected error (check logs) |
| 503 | Unavailable | LawGPT not initialized, Ollama down |

---

## Testing Checklist

### Authentication
- [ ] Register new user
- [ ] Login and get JWT
- [ ] Use JWT in Authorization header
- [ ] Refresh token when expired
- [ ] Forgot password → reset password flow

### Case Lifecycle
- [ ] Litigant creates case
- [ ] Lawyer views and drafts
- [ ] Client approves draft
- [ ] Lawyer files in court
- [ ] Judge claims case
- [ ] Judge issues summons
- [ ] Hearing scheduled
- [ ] Hearing join/leave
- [ ] Verdict delivered

### Document Management
- [ ] Upload document
- [ ] Trigger AI analysis
- [ ] Retrieve analysis results
- [ ] Download with certificate
- [ ] Verify document hash

### Blockchain Evidence
- [ ] Upload evidence
- [ ] Verify single evidence
- [ ] Verify entire chain
- [ ] Download certificate

### Legal AI
- [ ] Call `/api/legal/analyze-stream` on NLP Orchestrator (SSE)
- [ ] Verify SSE events stream properly
- [ ] Generate legal documents via LawGPT
- [ ] Verify Hindi/Hinglish output

### WebRTC Hearings
- [ ] Socket.IO connection
- [ ] Join-room event
- [ ] Receive existing-participants
- [ ] Exchange WebRTC offers/answers
- [ ] Stream audio/video
- [ ] Toggle audio/video state

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check JWT token in Authorization header. Refresh if expired. |
| 403 Forbidden | Check user role. Ensure correct role for operation. |
| Case not found | Verify case UUID format and ownership. |
| Document analysis pending | Call GET `/api/v1/documents/{id}/has-analysis` to check status. |
| Ollama not available | Ensure Ollama service running on port 11434. `ollama serve` |
| Signaling server connection fails | Check WebSocket URL and CORS in server.js |
| Evidence hash mismatch | File corrupted. Re-upload and verify hash. |
| LawGPT index not loaded | Run `python lawgpt/ingest.py` to build FAISS index. |

---

## Integration Tips

1. **Polling Analysis Results:** After `/api/v1/documents/{id}/analyze`, poll `/api/v1/documents/{id}/has-analysis` every 2-3 seconds
2. **SSE Handling:** Use `EventSource` or `fetch` with `ReadableStream` for streaming endpoints
3. **WebRTC Signals:** Ensure all signal payloads are JSON-serializable
4. **Role-Based UI:** Check user role before rendering admin/judge panels
5. **Offline Support:** Documents have offline.html fallback in frontend
6. **Rate Limiting:** Plan for throttling on high-volume endpoints (document upload, analysis)

---

**Generated:** June 2, 2026 | Version: 1.0 | For Production Use