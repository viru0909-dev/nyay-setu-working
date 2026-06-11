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
│  ├─ Spring Boot (8080)      ← Main API hub                    │
│  ├─ LawGPT (8000)           ← RAG + Doc generation            │
│  ├─ NLP Orchestrator (8001) ← Legal reasoning, Forensics, OCR │
│  └─ Signaling Server (3001) ← WebRTC for video calls          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Endpoint Reference by Role

### 👨‍⚖️ LITIGANT (Client/Petitioner)

```bash
# Case Management
POST   /cases                        → Create case
GET    /cases                        → Get my cases
GET    /cases/{id}                   → Get case details
PUT    /cases/{id}                   → Update case

# Documents
POST   /documents/upload             → Upload document
GET    /documents                    → Get my documents
POST   /documents/{id}/analyze       → Trigger AI analysis
GET    /documents/{id}/analysis      → Get analysis results

# Evidence
POST   /evidence/upload              → Upload evidence (blockchain)
GET    /evidence/case/{caseId}       → View evidence for case

# Hearings
GET    /hearings/my                  → Get my scheduled hearings
POST   /hearings/{hearingId}/join    → Join hearing
POST   /hearings/{hearingId}/leave   → Leave hearing

# Messages
GET    /cases/{caseId}/messages      → Read case messages
POST   /cases/{caseId}/messages      → Send message to lawyer

# Profile
POST   /profile/create-or-update     → Update profile
POST   /profile/{userId}/upload-picture → Profile picture

# Lawyer Proposal
POST   /cases/{caseId}/respond-proposal → Accept/reject lawyer
```

### 👨‍⚖️ LAWYER

```bash
# Client Cases
GET    /lawyer/cases                 → Get my client cases
GET    /lawyer/clients               → Get my clients list
GET    /lawyer/stats                 → Get my statistics

# Draft Management
POST   /lawyer/draft                 → Generate draft from template
POST   /lawyer/draft/save            → Save draft (no submission)

# Case Workflow
POST   /cases/{id}/submit-draft      → Submit draft for approval
GET    /cases                        → Get assigned cases
POST   /cases/{id}/file-in-court     → File case in court (after approval)

# Documents
GET    /documents/user/cases         → Get my case summaries
GET    /documents/case/{caseId}      → Get case documents

# Hearings
POST   /hearings/schedule            → Schedule hearing
GET    /hearings/{hearingId}         → View hearing details
POST   /hearings/{hearingId}/join    → Join hearing

# Messages
POST   /cases/{caseId}/messages      → Message with client
```

### ⚖️ JUDGE

```bash
# Case Assignment
GET    /judge/cases                  → Get my assigned cases
GET    /judge/unassigned             → Get cases available to claim
POST   /judge/cases/{id}/claim       → Take case from pool

# Summons & Orders
POST   /judge/cases/{id}/issue-summons → Issue digital summons
GET    /orders/case/{caseId}         → Get case orders
POST   /orders                       → Create court order
PUT    /orders/{orderId}             → Update order
GET    /orders/my-orders             → Get my issued orders

# Hearings
POST   /hearings/schedule            → Schedule hearing
POST   /hearings/{hearingId}/participants → Add participant
PUT    /hearings/{hearingId}/complete → Complete hearing
POST   /hearings/{hearingId}/outcome → Record hearing outcome

# Case Transitions
POST   /cases/transition/{id}/take-cognizance → Take cognizance
POST   /cases/{id}/start-hearings    → Start hearing phase
POST   /cases/{id}/deliver-verdict   → Deliver verdict

# Documents
GET    /documents/case/{caseId}      → View case documents
GET    /documents/{id}/analysis      → View AI analysis

# Analytics
GET    /judge/analytics              → Judge dashboard stats
```

### 🚔 POLICE

```bash
# FIR Management
POST   /police/fir/upload            → Upload FIR with SHA-256 stamp
GET    /police/fir/list              → My FIRs
GET    /police/fir/pending           → FIRs pending review
PUT    /police/fir/{id}/status       → Approve/Reject FIR
POST   /police/fir/{id}/verify       → Verify FIR integrity

# Summons Delivery
GET    /police/summons/pending       → Pending delivery tasks
POST   /police/summons/{caseId}/complete → Mark summons served

# Investigation
POST   /police/investigation/{id}/start    → Start investigation
POST   /police/investigation/{id}/evidence → Add evidence
POST   /police/investigation/{id}/submit   → Submit findings
GET    /police/investigation/list          → All investigations

# Statistics
GET    /police/stats                 → Police dashboard stats
GET    /police/health                → Service health check
```

---

## Authentication Flow

```
1. REGISTER → POST /auth/register
   Response: JWT + Refresh Token + User Info
   
2. LOGIN → POST /auth/login  
   Response: JWT (short-lived, ~15 min) + Refresh Token (long-lived)
   
3. PROTECTED REQUESTS → Header: Authorization: Bearer {JWT}
   
4. TOKEN EXPIRED? → POST /auth/refresh
   Body: {refreshToken}
   Response: New JWT
   
5. PASSWORD RESET:
   a. POST /auth/forgot-password {email}
   b. Check email for reset link with token
   c. GET /auth/verify-reset-token?token={token}
   d. POST /auth/reset-password {token, newPassword}
```

---

## Document Generation (LawGPT)

```bash
# RAG Retrieval (Java calls Python)
POST http://localhost:8000/context
{
  "question": "What is Section 498A?",
  "max_results": 3
}

# Document Generation
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
POST /evidence/upload
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
GET /evidence/{evidenceId}/verify
→ {
    "isVerified": true,
    "blockHash": "sha256...",
    "timestamp": "2024-06-01T10:30:00Z"
  }

# Verify entire chain
GET /evidence/case/{caseId}/verify-chain
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
         │  POST /cases/{id}/approve-draft {approved}   │
         └──────────────────────────────────────────────┘
                                    ↓
                            [SUBMITTED]
                                    ↓
         ┌──────────────────────────────────────────────┐
         │  JUDGE TAKES COGNIZANCE                      │
         │  POST /judge/cases/{id}/claim                │
         └──────────────────────────────────────────────┘
                                    ↓
                      [COGNIZANCE_PERIOD]
                                    ↓
         ┌──────────────────────────────────────────────┐
         │  JUDGE ISSUES SUMMONS                        │
         │  POST /judge/cases/{id}/issue-summons        │
         └──────────────────────────────────────────────┘
                                    ↓
                        [SUMMONS_SERVED]
                                    ↓
                    ┌───────────────────────────┐
                    │  HEARINGS BEGIN           │
                    │  /hearings/schedule       │
                    └───────────────────────────┘
                                    ↓
                          [IN_PROGRESS]
                     (hearing → evidence → arguments)
                                    ↓
         ┌──────────────────────────────────────────────┐
         │  JUDGE DELIVERS VERDICT                      │
         │  POST /cases/{id}/deliver-verdict            │
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
- [ ] Call /api/legal/analyze-stream (SSE)
- [ ] Verify SSE events stream properly
- [ ] Generate legal documents
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
| Document analysis pending | Call GET `/documents/{id}/has-analysis` to check status. |
| Ollama not available | Ensure Ollama service running on port 11434. `ollama serve` |
| Signaling server connection fails | Check WebSocket URL and CORS in server.js |
| Evidence hash mismatch | File corrupted. Re-upload and verify hash. |
| LawGPT index not loaded | Run `python lawgpt/ingest.py` to build FAISS index. |

---

## Integration Tips

1. **Polling Analysis Results:** After `/documents/{id}/analyze`, poll `/documents/{id}/has-analysis` every 2-3 seconds
2. **SSE Handling:** Use `EventSource` or `fetch` with `ReadableStream` for streaming endpoints
3. **WebRTC Signals:** Ensure all signal payloads are JSON-serializable
4. **Role-Based UI:** Check user role before rendering admin/judge panels
5. **Offline Support:** Documents have offline.html fallback in frontend
6. **Rate Limiting:** Plan for throttling on high-volume endpoints (document upload, analysis)

---

**Generated:** June 2, 2026 | Version: 1.0 | For Production Use

