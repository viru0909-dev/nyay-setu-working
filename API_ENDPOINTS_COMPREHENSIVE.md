# Nyay Setu - Comprehensive API Endpoints Documentation

**Last Updated:** June 2, 2026  
**Project:** Nyay Setu - Legal Justice System Platform  
**Scope:** Complete API discovery across Java/Spring Boot, Python microservices, and Node.js signaling server

---

## Table of Contents

1. [Backend APIs (Java/Spring Boot)](#backend-apis-javaspring-boot)
2. [Python Microservices APIs](#python-microservices-apis)
   - [LawGPT Service](#lawgpt-service)
   - [NLP Orchestrator](#nlp-orchestrator)
3. [Signaling Server APIs (Node.js)](#signaling-server-apis-nodejs)
4. [Summary](#summary)

---

## Backend APIs (Java/Spring Boot)

**Base URL:** `http://localhost:8080` (default)  
**Port:** 8080  
**Framework:** Spring Boot with Spring Security, JPA/Hibernate  
**Documentation:** OpenAPI 3.0 (Swagger UI available)

### 1. Authentication Controller (`/auth`)

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/auth/register` | `RegisterRequest` (email, name, password, role) | JWT token + User info | User registration with auto-login. Password requires: 8+ chars, uppercase, number, special char |
| POST | `/auth/login` | `LoginRequest` (email, password) | JWT token + Refresh token + User | User authentication. Returns accessToken and refreshToken |
| POST | `/auth/refresh` | `RefreshTokenRequest` (refreshToken) | New accessToken | Refresh JWT access token using refresh token |
| POST | `/auth/forgot-password` | `ForgotPasswordRequest` (email) | Message + email | Send password reset email |
| GET | `/auth/verify-reset-token` | Query: `token` | `{valid: boolean, message: string}` | Verify password reset token validity and expiry |
| POST | `/auth/reset-password` | `ResetPasswordRequest` (token, newPassword) | Message | Complete password reset workflow |
| GET | `/auth/ping` | - | "pong" | Health check for auth service |

**Authentication:** Requires JWT Bearer token for most endpoints except register/login/forgot-password  
**Authorization:** Role-based (LITIGANT, LAWYER, JUDGE, POLICE, ADMIN)

---

### 2. Case Management Controller (`/cases`)

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/cases` | `CreateCaseRequest` | `CaseDTO` | Create new legal case (requires auth) |
| GET | `/cases` | - | `List<CaseDTO>` | Get all cases for authenticated user |
| GET | `/cases/{id}` | - | `CaseDTO` | Get case details by UUID |
| PUT | `/cases/{id}` | `CaseDTO` | `CaseDTO` | Update case information |
| DELETE | `/cases/{id}` | - | `{message: string}` | Delete case |
| POST | `/cases/{id}/submit-draft` | `{draftContent: string}` | `{success, message}` | **Handover C:** Lawyer submits draft for approval |
| POST | `/cases/{id}/review-draft` | `{approved: boolean, comments: string}` | `{success, message}` | **Handover C:** Client reviews lawyer's draft |
| PUT | `/cases/{id}/approve-draft` | `{approved: boolean, comments: string}` | `{success, message}` | Approve or request changes on draft |
| POST | `/cases/{id}/file-in-court` | - | `{success, message, newStatus}` | **Handover D:** File approved petition in court |
| POST | `/cases/{id}/order-notice` | - | `{success, message}` | Order notice for respondent |
| POST | `/cases/{id}/start-hearings` | - | `{success, message}` | Transition case to hearing phase |
| POST | `/cases/{id}/start-evidence` | - | `{success, message}` | Transition to evidence presentation phase |
| POST | `/cases/{id}/start-arguments` | - | `{success, message}` | Transition to arguments phase |
| POST | `/cases/{id}/start-judgment` | - | `{success, message}` | Transition to judgment preparation phase |
| POST | `/cases/{id}/deliver-verdict` | `{verdictDetails: string}` | `{success, message, newStatus}` | Deliver final verdict |
| POST | `/cases/{id}/parties` | `{respondentName, respondentEmail, respondentPhone}` | `{success, message}` | Add respondent party to case |
| PUT | `/cases/{id}/respondent-details` | Respondent details | Response | Update respondent information |

**State Machine:** DRAFT → SUBMITTED → UNDER_REVIEW → COGNIZANCE_PERIOD → SUMMONS_SERVED → IN_PROGRESS → COMPLETED

---

### 3. Case Transition Controller (`/cases/transition`)

Specialized controller for state machine transitions with audit trail.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/cases/transition/{caseId}/submit-to-court` | - | `{success, message}` | Submit case from draft to court |
| POST | `/cases/transition/{caseId}/save-draft` | `{draftContent, draftType}` | `{success, message}` | Save intermediate draft (no submission) |
| POST | `/cases/transition/{caseId}/approve-draft` | `{approved, comments}` | `{success, message}` | Approve draft and move to next state |
| POST | `/cases/transition/{caseId}/reject-draft` | `{reason}` | `{success, message}` | Reject draft with reason |
| POST | `/cases/transition/{caseId}/take-cognizance` | - | `{success, message}` | Judge takes cognizance (Step 2) |
| POST | `/cases/transition/{caseId}/advance-stage` | `{targetStage}` | `{success, message}` | Advance to specific stage |
| POST | `/cases/transition/{caseId}/summons-served` | - | `{success, message}` | Mark summons as served |
| GET | `/cases/transition/{caseId}/health` | - | Status info | Get transition state health |

---

### 4. Document Management Controller (`/documents`)

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/documents/upload` | Multipart form: file, category, description, caseId | `DocumentDto` | Upload document with optional case association. Triggers AI analysis. |
| POST | `/documents/{id}/analyze` | - | `{message, documentId}` | Trigger AI analysis on document |
| GET | `/documents/{id}/analysis` | - | `DocumentAnalysis` | Retrieve AI analysis results |
| GET | `/documents/{id}/has-analysis` | - | `{documentId, hasAnalysis: boolean}` | Check if analysis exists |
| GET | `/documents` | - | `List<DocumentDto>` | Get all documents for authenticated user |
| GET | `/documents/user/cases` | - | `List<CaseSummaryDto>` | Get user's case summaries |
| GET | `/documents/case/{caseId}` | - | `List<DocumentDto>` | Get documents for specific case (with access control) |
| GET | `/documents/{id}` | - | `DocumentDto` | Get specific document metadata |
| GET | `/documents/{id}/download` | - | Binary file | Download document file |
| DELETE | `/documents/{id}` | - | Response | Delete document (soft delete with audit) |
| GET | `/documents/{id}/certificate` | - | PDF file | Get digital certificate of authenticity |
| GET | `/documents/{id}/verify-hash` | - | `{verified, hash}` | Verify document integrity via SHA-256 hash |

**Document Categories:** AFFIDAVIT, RTI, COMPLAINT, NOTICE, EVIDENCE, OTHER  
**Access Control:** Role-based (JUDGE can see all, PETITIONER/RESPONDENT see filtered)

---

### 5. Document Generation Controller (`/api/documents/generate`)

Legal document generation via LawGPT integration.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/api/documents/generate/preview` | `DocumentGenerationRequest` (type, fields, language) | `{preview: string, estimated_pages}` | Generate document preview before saving |
| POST | `/api/documents/generate/download` | Same as preview | PDF binary | Generate and download document as PDF |

**Supported Doc Types:** affidavit, rti, complaint, notice  
**Languages:** en, hi  
**Fields:** petitioner_name, petitioner_address, respondent_name, respondent_address, case_description, incident_date, relief_sought, court_name, department_name, pio_name

---

### 6. Evidence Controller (`/cases/{caseId}/evidence`)

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/cases/{caseId}/evidence` | Multipart: file, uploaderId | `UploadEvidenceResponse` | Upload evidence file for case |

---

### 7. Blockchain Evidence Controller (`/evidence`)

Blockchain-secured evidence management with SHA-256 hashing and immutability chain.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/evidence/upload` | Multipart: file, caseId, title, description, evidenceType | `{id, title, blockHash, blockIndex, verificationStatus}` | Upload evidence with blockchain hash |
| GET | `/evidence/case/{caseId}` | - | `{caseId, totalCount, evidence[]}` | Get all evidence for case with hashes |
| GET | `/evidence/{evidenceId}/verify` | - | `{isVerified, blockHash, timestamp}` | Verify single evidence integrity |
| GET | `/evidence/case/{caseId}/verify-chain` | - | `{chainValid, hashes[], timestamps[]}` | Verify entire evidence chain integrity |
| GET | `/evidence/{evidenceId}` | - | Evidence details | Get evidence metadata |
| GET | `/evidence/{evidenceId}/certificate` | - | PDF (application/pdf) | Download evidence certificate with hash |

**Evidence Types:** DOCUMENT, PHOTO, VIDEO, AUDIO, EMAIL, OTHER  
**Blockchain Features:** SHA-256 hashing, immutable chain, timestamp proofs, verification certificates

---

### 8. Hearing Controller (`/hearings`)

Virtual court hearing management with WebRTC integration.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/hearings/schedule` | `ScheduleHearingRequest` (caseId, scheduledDate, durationMinutes) | `{id, scheduledDate, status, videoRoomId, message}` | Schedule new hearing. Triggers notifications. |
| POST | `/hearings/{hearingId}/participants` | `AddParticipantRequest` (userId, role) | `{id, hearingId, role, joinedAt, message}` | Add participant to hearing |
| POST | `/hearings/{hearingId}/join` | - | `{videoRoomId, hearingId, status}` | Join hearing room (auth required) |
| POST | `/hearings/{hearingId}/leave` | - | 200 OK | Leave hearing room |
| PUT | `/hearings/{hearingId}/complete` | `CompleteHearingRequest` (judgeNotes) | `Hearing` entity | Complete hearing and record notes |
| POST | `/hearings/{hearingId}/outcome` | `HearingOutcomeRequest` (outcome, details) | `{message, hearingId, status}` | Record hearing outcome/decision |
| GET | `/hearings/{hearingId}` | - | `Hearing` | Get hearing details |
| GET | `/hearings/{hearingId}/participants` | - | `List<HearingParticipant>` | Get all hearing participants |
| GET | `/hearings/case/{caseId}` | - | `List<Map>` with hearing details | Get all hearings for a case |
| GET | `/hearings/my` | - | User's hearings | Get current user's scheduled hearings |

**Hearing Status:** SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, POSTPONED  
**Participant Roles:** JUDGE, PETITIONER, RESPONDENT, LAWYER, WITNESS

---

### 9. Messages Controller (`/cases/{caseId}/messages`)

Communication between case parties.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/cases/{caseId}/messages` | `SendMessageRequest` (senderId, receiverId, content) | `CaseMessage` | Send message between parties |
| GET | `/cases/{caseId}/messages` | - | `List<CaseMessage>` | Get all messages in case thread |

---

### 10. Case Notes Controller (`/cases/{caseId}/notes`)

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/cases/{caseId}/notes` | `{content, author}` | CaseNote | Add note to case |

---

### 11. Case Events Controller (`/cases`)

Timeline of case events for audit trail.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| GET | `/cases/{caseId}/events` | - | `List<CaseEvent>` | Get all events for case |
| GET | `/cases/{caseId}/events/recent` | - | `List<CaseEvent>` | Get recent events (limit) |
| GET | `/cases/judge/{judgeId}/events` | - | Events for judge | Get events for judge's cases |

---

### 12. Court Orders Controller (`/orders`)

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| GET | `/orders/case/{caseId}` | - | `List<Order>` | Get all orders for case |
| POST | `/orders` | `{caseId, orderType, content}` | Order with id | Create new court order (DRAFT) |
| PUT | `/orders/{orderId}` | `{content, orderType, status}` | Updated order | Update order (draft only editable) |
| DELETE | `/orders/{orderId}` | - | Message | Delete draft order |
| GET | `/orders/my-orders` | - | Judge's orders | Get orders issued by current judge |

**Order Types:** INTERIM, FINAL, SUMMONS, INJUNCTION, REJECTION, STAY  
**Order Status:** DRAFT, ISSUED, FINAL, REJECTED

---

### 13. Judge Portal Controller (`/judge`)

Judge-specific dashboard and case management.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| GET | `/judge/cases` | - | `List<CaseEntity>` | Get all cases assigned to judge |
| POST | `/judge/cases/{id}/claim` | - | `{message, caseId}` | Judge claims case from unassigned pool |
| POST | `/judge/cases/{id}/issue-summons` | - | `{message}` | Judge issues digital summons (Step 4) |
| GET | `/judge/unassigned` | - | List of unassigned cases | Get cases available for assignment |
| GET | `/judge/analytics` | - | Analytics object | Get judge's case analytics and stats |

---

### 14. Lawyer Portal Controller (`/lawyer`)

Lawyer-specific operations for case management.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/lawyer/draft` | `{caseId, template}` | `{draft: string}` | Generate draft from template |
| POST | `/lawyer/draft/save` | `{caseId, draft}` | 200 OK | Save draft without submitting |
| GET | `/lawyer/cases` | - | `List<CaseDTO>` | Get lawyer's client cases |
| GET | `/lawyer/clients` | - | `List<ClientInfo>` | Get list of lawyer's clients |
| GET | `/lawyer/stats` | - | Stats object | Get lawyer's case statistics |

---

### 15. Police FIR Portal Controller (`/police`)

Police-specific FIR creation, upload and investigation management.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| GET | `/police/summons/pending` | - | `List<Task>` | Get pending summons delivery tasks |
| POST | `/police/summons/{caseId}/complete` | - | `{message}` | Mark summons as SERVED |
| POST | `/police/fir/upload` | Multipart: file, title, description, caseId | `FirUploadResponse` | Upload FIR with SHA-256 digital stamp |
| GET | `/police/fir/list` | - | `List<FirUploadResponse>` | Get FIRs uploaded by officer |
| GET | `/police/fir/{id}` | - | `FirUploadResponse` | Get FIR details by ID |
| POST | `/police/fir/{id}/verify` | Multipart: file | `FirUploadResponse` | Verify FIR file integrity |
| GET | `/police/stats` | - | `FirStatsResponse` | Get police dashboard statistics |
| GET | `/police/health` | - | `{status, service, message}` | Health check with SHA-256 status |
| GET | `/police/fir/pending` | - | `List<FirUploadResponse>` | Get FIRs pending police review |
| PUT | `/police/fir/{id}/status` | `{status: REGISTERED|REJECTED, reviewNotes}` | FirUploadResponse | Update FIR status after review |
| POST | `/police/investigation/{id}/start` | - | Response | Start investigation on FIR |
| POST | `/police/investigation/{id}/submit` | `{findings}` | Response | Submit investigation report |
| GET | `/police/investigation/list` | - | List of investigations | Get all investigations |
| POST | `/police/investigation/{id}/evidence` | Multipart: file | Response | Add evidence to investigation |
| GET | `/police/investigation/{id}/summary` | - | Investigation summary | Get investigation summary |
| GET | `/police/investigation/{id}/draft-submission` | - | Draft submission | Generate draft submission document |

---

### 16. Profile Controller (`/profile`)

User profile management.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/profile/create-or-update` | `ProfileRequest` (bio, specialization, etc.) | `UserProfile` | Create or update user profile |
| GET | `/profile/{userId}` | - | `UserProfile` or 404 | Get user profile by ID |
| POST | `/profile/{userId}/upload-picture` | Multipart: file | "OK" | Upload profile picture |

---

### 17. AI Services Controller (`/api/ai`)

Local AI integration via Groq and Ollama.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/api/ai/summarize` | `{text}` | `{result}` | Summarize text via Groq |
| POST | `/api/ai/chat` | `{message}` | `{result}` | Chat with AI |
| POST | `/api/ai/chat/ollama` | `{message, model?}` | `OllamaChatResponse` | Chat using Ollama (local LLM) |
| POST | `/api/ai/constitution/qa` | `{message, context?}` | `OllamaChatResponse` | Q&A about Indian Constitution |
| GET | `/api/ai/ollama/status` | - | Status string | Check if Ollama is available |
| GET | `/api/ai/ollama/models` | - | `String[]` | Get available Ollama models |

---

### 18. Case Assignment Controller (`/cases`)

Assign cases to lawyers and judges.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/cases/{caseId}/assign-judge` | `{judgeId}` | Response | Assign judge to case |
| GET | `/cases/lawyers/available` | - | Available lawyers | Get available lawyers for assignment |
| POST | `/cases/{caseId}/propose-lawyer` | `{lawyerId}` | Response | Propose lawyer for case |
| POST | `/cases/{caseId}/respond-proposal` | `{accepted, lawyerId}` | Response | Client accepts/rejects lawyer proposal |
| GET | `/cases/pending-assignment` | - | Cases pending | Get cases waiting for assignment |
| GET | `/cases/judge-workload` | - | Judge workload | Get judge workload info |
| POST | `/cases/{caseId}/take-cognizance` | - | Response | Judge takes cognizance |
| POST | `/cases/{caseId}/update-summons` | `{status}` | Response | Update summons status |
| POST | `/cases/{caseId}/document-status` | `{status}` | Response | Update document status |

---

### 19. Audit Controller (`/audit`)

Audit trail logging for compliance.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/audit/log` | `{action, details, userId}` | Response | Manual audit log entry |

---

### 20. Health Controller (`/health`)

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| GET | `/health` | - | `{status, service, uptime, version, java}` | Service health check with uptime and version |

---

## Python Microservices APIs

### LawGPT Service

**Base URL:** `http://localhost:8000` (default)  
**Framework:** FastAPI  
**Purpose:** RAG (Retrieval-Augmented Generation) for legal document retrieval and legal document generation

#### Context Router (`/routers/context.py`)

RAG retrieval and legal Q&A endpoints.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/context` | `ContextRequest` {query, max_results: 1-20} | `ContextResponse` {context, sources} | Retrieve top-k legal chunks from FAISS vector store. Called by Java RagService proxy. No LLM invocation. |
| POST | `/chat` | `ChatRequest` {question, session_id?} | `ChatResponse` {answer, sources, session_id, model_used} | Standalone chat: retrieve context + call LLM + return grounded answer |
| GET | `/health` | - | `HealthResponse` {status, index_loaded, model, chunk_count} | Health check with index and model status |

**Request Validation:**
- `question`/`query`: Sanitized, max 2000 chars
- `max_results`: 1-20 (default 3)
- Prompt injection detection enabled

**LLM Backend (Dynamic Selection):**
1. Groq: `llama-3.3-70b-versatile` (if GROQ_API_KEY set)
2. Gemini: `gemini-1.5-pro` (if GEMINI_API_KEY set)
3. Ollama: `llama3` (fallback, local)

**Prompt Template:** Legal prompt with context injection, strict citation requirements, refusal to invent sections

---

#### Document Generation Router (`/routers/document.py`)

Legal document generation (affidavit, RTI, complaint, notice).

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/generate` | `GenerateRequest` {doc_type, fields, language} | `GenerateResponse` {doc_type, title, content, legal_context, sources, generated_at} | Generate legal document text with AI |
| POST | `/generate/pdf` | Same as /generate | PDF binary | Generate document as downloadable PDF |

**Document Types:**
- `affidavit`: Formal sworn statement with deponent verification
- `rti`: RTI application under Right to Information Act, 2005
- `complaint`: Legal complaint under CrPC/BNS with section references
- `notice`: Legal notice with demand/relief sought

**Required Fields:**
- `petitioner_name`, `petitioner_address`
- `case_description`, `incident_date`
- `respondent_name`, `respondent_address` (except RTI)
- `relief_sought` (optional but recommended)
- `court_name`, `department_name`, `pio_name` (for RTI)

**Languages:** en (English), hi (Hindi), hinglish (Hybrid)

---

### NLP Orchestrator Service

**Base URL:** `http://localhost:8001` (default)  
**Framework:** FastAPI with Server-Sent Events (SSE)  
**Purpose:** Legal reasoning pipeline: Decompose → Route → Research → Synthesize → Speak (5-layer architecture)

#### Main Endpoints (`main.py`)

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/api/legal/analyze-stream` | `LegalQuery` {query, language} | Server-Sent Events (SSE) | **PRODUCTION**: Full streaming legal reasoning pipeline. Real-time updates. |
| POST | `/api/legal/analyze` | Same as above | JSON response | **TESTING ONLY**: Synchronous version. Returns all results at once. |
| GET | `/health` | - | `{status, service, port}` | Service health check |
| GET | `/models` | - | `{groq, gemini}` with availability | Get available LLM models |

**SSE Event Types (Streaming Pipeline):**
```
avatar_update     → Interim messages while processing
sub_questions     → Decomposed questions list
research_start    → Research phase initiated
sub_answer        → Individual answer for sub-question
synthesis_start   → Synthesis phase initiated
synthesis_token   → Real-time synthesis tokens (streaming)
final_answer      → Complete markdown + hinglish + citations
done              → Pipeline complete
error             → Error occurred
```

**Query Validation:**
- Max length: 2000 characters
- Sanitization: Prompt injection detection
- Languages: en, hi, hinglish
- Domain checking: Legal queries only (non-legal politely refused)

**5-Layer Pipeline:**
1. **Decompose** → Break query into sub-questions
2. **Route** → Determine which AI model handles each question
3. **Research** → Parallel research using Groq, Gemini, Indian Kanoon
4. **Synthesize** → Combine results with streaming tokens
5. **Speak** → Convert to Hinglish for avatar narration

---

#### Forensics Router (`/routers/forensics.py`)

Accident forensic analysis with streaming pipeline.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/forensics/analyze-stream` | `ForensicsRequest` {jobId, videoUrls[], citizenDescription} | Server-Sent Events (SSE) | **SSE STREAMING**: 5-stage accident forensic pipeline with real-time updates |

**SSE Event Types (Forensics Pipeline):**
```
status           → Stage updates (UPLOAD_COMPLETE, EXTRACTING_FRAMES, AI_ANALYSIS, REPORT_READY)
partial_result   → Interim timeline and legal analysis
complete         → Final report and avatar script
error            → Error occurred
```

**Processing Stages:**
1. **Upload** → Download video locally
2. **Extract Frames** → OpenCV frame extraction (30-frame interval)
3. **AI Analysis** → Parallel: Gemini (video timeline) + Groq (legal section lookup)
4. **Report Generation** → Structured forensic report
5. **Avatar Script** → Hinglish narration for avatar

**Features:**
- Blockchain-integrity frame hashing
- IPC/MVA section auto-detection
- Privacy-compliant (DPDP Act 2023): Local cleanup after processing
- Real-time Hindi/Hinglish dialogue

---

#### OCR Router (`/routers/modi_ocr.py`)

Modi script (Devanagari historical) document OCR.

| HTTP | Endpoint | Request Body | Response | Description |
|------|----------|--------------|----------|-------------|
| POST | `/ocr/modi` | Multipart: file (image) | `ModiOCRResponse` {status, predicted_text, processing_time} | Run OCR on Modi script document image with Devanagari cleanup |

**Supported Image Formats:** JPEG, PNG, WebP, BMP, TIFF  
**Processing Time:** Typical 2-5 seconds per image  
**Error Handling:** Validates image validity and content type

---

## Signaling Server APIs (Node.js)

**Base URL:** `http://localhost:3001` (WebSocket)  
**Framework:** Socket.IO  
**Purpose:** WebRTC signaling for peer-to-peer video/audio communication in hearings

### WebSocket Events

The signaling server uses **Socket.IO event-based communication** (not traditional HTTP). Clients establish a persistent WebSocket connection and emit/listen to events.

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{roomId, userId, userName}` | User joins a hearing room. Server broadcasts to others. |
| `signal` | `{to, signal, userName}` | Relay WebRTC signaling (offer/answer/ICE) to peer |
| `leave-room` | `{roomId}` | User leaves room. Server notifies others. |
| `toggle-audio` | `{roomId, isAudioOn}` | Broadcast audio state change to room |
| `toggle-video` | `{roomId, isVideoOn}` | Broadcast video state change to room |
| `disconnect` | (automatic) | Client disconnects. Server cleans up and notifies room. |

#### Server → Client Events (Broadcasts)

| Event | Payload | Description |
|-------|---------|-------------|
| `user-connected` | `{userId, userName}` | New user joined room (broadcast to existing participants) |
| `existing-participants` | `[participantIds]` | List of existing participants (sent to new joiner) |
| `signal` | `{signal, from, userName}` | Incoming WebRTC signal from peer |
| `user-disconnected` | `{socketId}` | User left room (broadcast to remaining) |
| `user-audio-toggle` | `{socketId, isAudioOn}` | Peer's audio state changed |
| `user-video-toggle` | `{socketId, isVideoOn}` | Peer's video state changed |

#### Example Flow (WebRTC Handshake)

```
1. User A connects: emit('join-room', {roomId: 'case-123', userId: 'user-a', userName: 'Alice'})
   → Server broadcasts: emit('user-connected', {userId: 'user-a', userName: 'Alice'})
   → Server sends A: emit('existing-participants', ['socket-b', 'socket-c'])

2. User A initiates call with B:
   → A creates WebRTC offer locally
   → A emits: emit('signal', {to: 'socket-b', signal: <offer>, userName: 'Alice'})
   
3. Server relays to B:
   → emit('signal', {signal: <offer>, from: 'socket-a', userName: 'Alice'})
   
4. B creates answer and emits back:
   → emit('signal', {to: 'socket-a', signal: <answer>, userName: 'Bob'})
   
5. ICE candidates exchanged similarly until connection established
```

#### Room Management

- **Room Storage:** In-memory `Map<roomId, Set<socketIds>>`
- **Empty Room Cleanup:** Auto-deleted when last participant leaves
- **Participant Tracking:** Real-time count visible to all members
- **Reconnection:** New socket ID on reconnect (need to rejoin)

#### CORS Configuration

```javascript
cors: {
    origin: "http://localhost:5173",  // React frontend
    methods: ["GET", "POST"],
    credentials: true
}
```

---

## Summary

### Total Endpoints by Service

| Service | Type | Count | Details |
|---------|------|-------|---------|
| **Backend (Spring Boot)** | REST | 100+ | 20 controllers with 100+ endpoints covering auth, cases, documents, hearings, evidence, orders, profiles, AI, police |
| **LawGPT Service** | REST | 5 | RAG retrieval, Q&A chat, document generation (text + PDF), health |
| **NLP Orchestrator** | REST + SSE | 5 | Legal reasoning pipeline (streaming + sync), forensics analysis, OCR, health, models |
| **Signaling Server** | WebSocket | 7 events | Room management, WebRTC signaling, media state toggles, participant tracking |
| **TOTAL** | Mixed | **100+** | REST, SSE, WebSocket protocols |

### Key Features Across All Services

✅ **Authentication:** JWT-based with refresh tokens  
✅ **Authorization:** Role-based access control (LITIGANT, LAWYER, JUDGE, POLICE, ADMIN)  
✅ **Validation:** Input sanitization, prompt injection detection  
✅ **Streaming:** Server-Sent Events (SSE) for real-time updates (legal reasoning, forensics)  
✅ **Blockchain Security:** SHA-256 evidence hashing with immutability chains  
✅ **AI Integration:** Groq, Gemini, Ollama backends with fallback strategy  
✅ **Document Generation:** AI-powered legal documents (affidavit, RTI, complaint, notice)  
✅ **WebRTC:** Peer-to-peer video/audio for virtual hearings  
✅ **Audit Trail:** Comprehensive logging for compliance  
✅ **Internationalization:** Hindi, Hinglish, English support  
✅ **DPDP Compliance:** Privacy-first video processing with auto-cleanup  
✅ **Error Handling:** Graceful degradation with meaningful error messages

---

## Port Summary

| Service | Port | Protocol |
|---------|------|----------|
| Backend (Spring Boot) | 8080 | HTTP/REST |
| LawGPT Service | 8000 | HTTP/REST |
| NLP Orchestrator | 8001 | HTTP/REST + SSE |
| Signaling Server | 3001 | WebSocket (Socket.IO) |
| Frontend | 3000 or 5173 | HTTP (Vite/React) |

---

**Generated:** June 2, 2026  
**Scope:** Production-ready comprehensive API mapping  
**Next Steps:** Integration testing, API gateway setup, rate limiting, monitoring

