# NyaySetu - Complete System Documentation

**Version:** 1.0  
**Last Updated:** 2026-02-06

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [REST API Endpoints](#rest-api-endpoints)
5. [Frontend Pages](#frontend-pages)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Key Workflows](#key-workflows)

---

## System Overview

**NyaySetu** is a comprehensive digital justice platform that streamlines the Indian judicial system by connecting litigants, lawyers, judges, and police through a unified Progressive Web App (PWA).

### Core Features

- **AI-Powered Legal Assistant** (Vakil Friend) - Helps litigants draft petitions
- **FIR Management** - Digital FIR filing with SHA-256 verification
- **Case Management** - End-to-end case lifecycle tracking
- **Virtual Hearings** - Video conferencing for court proceedings
- **Evidence Vault** - Blockchain-secured document storage
- **Multi-Role Dashboard** - Customized interfaces for each user type

---

## Technology Stack

### Backend
- **Framework:** Spring Boot 3.x (Java 17)
- **Database:** PostgreSQL
- **Security:** Spring Security + JWT Authentication
- **AI Integration:** Groq API (Llama models)
- **Document Storage:** Local filesystem with SHA-256 hashing
- **Email:** JavaMail for notifications

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **State Management:** Zustand
- **Styling:** Custom CSS (no Tailwind)
- **UI Libraries:** Framer Motion, Lucide Icons
- **PWA:** vite-plugin-pwa, Workbox

---

## Database Schema

### Core Entities

#### 1. **User** (`ny_user`)
Primary authentication and user management table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment user ID |
| `email` | VARCHAR (UNIQUE) | User email address |
| `name` | VARCHAR | User's full name |
| `password` | VARCHAR | BCrypt hashed password |
| `role` | ENUM | Role: ADMIN, JUDGE, LAWYER, LITIGANT, POLICE |

**Relationships:**
- One-to-Many with `CaseEntity` (as client)
- One-to-Many with `CaseEntity` (as lawyer)
- One-to-Many with `FirRecord` (as filing officer)

---

#### 2. **CaseEntity** (`case_entity`)
Central table for all legal cases.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique case identifier |
| `title` | VARCHAR | Case title/name |
| `description` | TEXT | Case description |
| `case_type` | VARCHAR | CIVIL, CRIMINAL, FAMILY, PROPERTY, COMMERCIAL |
| `status` | ENUM | CaseStatus enum |
| `stage` | ENUM | CaseStage enum |
| `urgency` | VARCHAR | NORMAL, URGENT, CRITICAL |
| `petitioner` | VARCHAR | Petitioner name |
| `respondent` | VARCHAR | Respondent name |
| `respondent_email` | VARCHAR | Respondent contact |
| `respondent_phone` | VARCHAR | Respondent phone |
| `respondent_address` | TEXT | Respondent address |
| `filed_date` | TIMESTAMP | Case filing date |
| `next_hearing` | TIMESTAMP | Next hearing date |
| `assigned_judge` | VARCHAR | Judge name |
| `client_id` | BIGINT (FK) | Reference to User (litigant) |
| `lawyer_id` | BIGINT (FK) | Reference to User (lawyer) |
| `judge_id` | BIGINT | Judge user ID |
| `filing_method` | VARCHAR | VAKIL_FRIEND, MANUAL |
| `source_fir_id` | BIGINT | FIR ID if case originated from FIR |
| `summons_status` | VARCHAR | PENDING, SERVED, FAILED |
| `summons_delivered` | BOOLEAN | Summons delivery status |
| `bsa_634_certified` | BOOLEAN | BSA Section 63(4) certification |
| `draft_approval_status` | VARCHAR | AWAITING_CLIENT, APPROVED, REJECTED |
| `current_judicial_stage` | INT | Stage 1-7 in judicial process |
| `blocking_errors` | TEXT | Groq validation errors |
| `ai_generated_summary` | TEXT | AI case summary |
| `draft_petition` | TEXT | AI-generated draft |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Enums:**
- `CaseStatus`: PENDING, ACTIVE, CLOSED, ARCHIVED
- `CaseStage`: DRAFT, FILING, NOTICE, HEARING, EVIDENCE, JUDGMENT, APPEAL

**Computed Properties:**
- `isTrialReady()`: Returns true if summons delivered + BSA certified + no blocking errors
- `canSubmitToCourt()`: Returns true if draft approved by client
- `getCaseHealth()`: Returns HEALTHY, BLOCKED, NEEDS_CERTIFICATION, etc.

---

#### 3. **FirRecord** (`fir_record`)
First Information Report records filed by police or citizens.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment FIR ID |
| `fir_number` | VARCHAR | Unique FIR number |
| `title` | VARCHAR | FIR title |
| `description` | TEXT | FIR details |
| `category` | VARCHAR | Crime category |
| `filing_date` | TIMESTAMP | When FIR was filed |
| `status` | VARCHAR | PENDING, REGISTERED, UNDER_INVESTIGATION, SUBMITTED_TO_COURT, REJECTED |
| `officer_id` | BIGINT (FK) | Police officer who filed |
| `filer_id` | BIGINT (FK) | Citizen who filed (if client-filed) |
| `file_path` | VARCHAR | Path to uploaded FIR document |
| `sha256_hash` | VARCHAR | SHA-256 hash for integrity |
| `review_notes` | TEXT | Police review comments |
| `investigation_findings` | TEXT | Investigation results |
| `court_case_id` | UUID (FK) | Linked CaseEntity if submitted |
| `created_at` | TIMESTAMP | Creation timestamp |

---

#### 4. **Hearing** (`hearing`)
Court hearing schedules and records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment hearing ID |
| `case_id` | UUID (FK) | Reference to CaseEntity |
| `hearing_date` | TIMESTAMP | Scheduled hearing date/time |
| `status` | ENUM | HearingStatus (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, POSTPONED) |
| `type` | VARCHAR | PRELIMINARY, EVIDENCE, ARGUMENT, VERDICT |
| `meeting_link` | VARCHAR | Video conferencing URL |
| `notes` | TEXT | Hearing notes |
| `outcome` | ENUM | HearingOutcomeType |
| `created_at` | TIMESTAMP | Creation timestamp |

---

#### 5. **CaseEvidence** (`case_evidence`)
Evidence documents attached to cases.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment evidence ID |
| `case_id` | UUID (FK) | Reference to CaseEntity |
| `title` | VARCHAR | Evidence title |
| `description` | TEXT | Evidence description |
| `file_path` | VARCHAR | Path to evidence file |
| `sha256_hash` | VARCHAR | SHA-256 hash for integrity |
| `uploaded_by_id` | BIGINT (FK) | User who uploaded |
| `upload_date` | TIMESTAMP | Upload timestamp |
| `verified` | BOOLEAN | Whether evidence is verified |
| `certification_status` | VARCHAR | BSA Section 63(4) status |

---

#### 6. **DocumentEntity** (`document_entity`)
General document storage.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment document ID |
| `title` | VARCHAR | Document title |
| `description` | TEXT | Document description |
| `file_path` | VARCHAR | Path to document file |
| `file_type` | VARCHAR | MIME type |
| `owner_id` | BIGINT (FK) | User who owns document |
| `case_id` | UUID (FK) | Associated case (if any) |
| `storage_type` | ENUM | LOCAL, S3, IPFS |
| `sha256_hash` | VARCHAR | SHA-256 hash |
| `upload_timestamp` | TIMESTAMP | Upload time |

---

#### 7. **VakilAiDiaryEntry** (`vakil_ai_diary_entry`)
Stores AI chat interactions between litigant and Vakil Friend.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment entry ID |
| `user_id` | BIGINT (FK) | Litigant user ID |
| `case_id` | UUID (FK) | Associated case |
| `entry_text` | TEXT | AI conversation/analysis |
| `sha256_hash` | VARCHAR | SHA-256 for tamper protection |
| `created_at` | TIMESTAMP | Entry creation time |

---

#### 8. **CourtOrder** (`court_order`)
Judicial orders issued by judges.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment order ID |
| `case_id` | UUID (FK) | Associated case |
| `order_type` | VARCHAR | SUMMONS, NOTICE, INTERIM, FINAL |
| `order_text` | TEXT | Order content |
| `issued_by_id` | BIGINT (FK) | Judge who issued |
| `issued_date` | TIMESTAMP | Issue timestamp |
| `delivery_status` | VARCHAR | PENDING, DELIVERED, FAILED |

---

### Supporting Entities

- **UserProfile**: Extended user information (phone, address, etc.)
- **CaseMessage**: Chat messages between case parties
- **CaseNote**: Private notes added by lawyers/judges
- **CaseTimeline**: Timeline events for case history
- **HearingParticipant**: Tracks who attended hearings
- **AuditLog**: System-wide audit trail
- **PasswordResetToken**: Password reset tokens
- **VerificationRequest**: Identity verification requests
- **FaceData**: Face recognition enrollment data

---

## REST API Endpoints

Base URL: `http://localhost:8080/api`

### 1. Authentication API (`/api/auth`)

**Controller:** `AuthController`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/register` | Register new user | `RegisterRequest` | `AuthResponse` (token + user) |
| POST | `/auth/login` | Login with email/password | `LoginRequest` | `AuthResponse` (token + user) |
| POST | `/auth/forgot-password` | Request password reset | `ForgotPasswordRequest` | Success message |
| GET | `/auth/verify-reset-token` | Verify reset token validity | `?token=xxx` | Token validity status |
| POST | `/auth/reset-password` | Reset password with token | `ResetPasswordRequest` | Success message |
| POST | `/auth/enroll-face` | Enroll face for biometric login | `FaceEnrollRequest` | Success status |
| POST | `/auth/login-face` | Login using face recognition | `FaceLoginRequest` | `AuthResponse` |
| DELETE | `/auth/disable-face-login` | Disable face login | `?userId=xxx` | Success message |
| GET | `/auth/face-login-status` | Check face login status | `?userId=xxx` | Face login enabled status |
| GET | `/auth/ping` | Health check | - | "pong" |

**DTOs:**
```java
// LoginRequest
{
  "email": "user@example.com",
  "password": "password123",
  "role": "LITIGANT"  // Optional
}

// AuthResponse
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "LITIGANT"
  }
}
```

---

### 2. Case Management API (`/api/cases`)

**Controller:** `CaseManagementController`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/cases` | Create new case | `CreateCaseRequest` | `CaseDTO` |
| GET | `/cases` | Get all cases for current user | - | `List<CaseDTO>` |
| GET | `/cases/{id}` | Get case by ID | - | `CaseDTO` |
| PUT | `/cases/{id}` | Update case | `CaseDTO` | `CaseDTO` |
| DELETE | `/cases/{id}` | Delete case | - | Success message |
| POST | `/cases/{id}/submit-draft` | Lawyer submits draft petition | `{draftContent}` | Success status |
| POST | `/cases/{id}/review-draft` | Client reviews draft | `{approved, comments}` | Success status |
| PUT | `/cases/{id}/approve-draft` | Client approves draft | `{approved, comments}` | Success status |
| POST | `/cases/{id}/order-notice` | Order respondent notice | - | Success message |
| POST | `/cases/{id}/parties` | Add party to case | `{partyName, partyType, partyEmail}` | Success message |
| PUT | `/cases/{id}/respondent-details` | Update respondent info | `RespondentDetailsDTO` | Success message |

---

### 3. FIR Management API (`/api/fir`)

**Controller:** `FirController`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/fir/upload` | Upload FIR document | `MultipartFile + metadata` | `FirUploadResponse` |
| GET | `/fir/my-firs` | Get FIRs filed by current officer | - | `List<FirRecord>` |
| GET | `/fir/{id}` | Get FIR details | - | `FirRecord` |
| POST | `/fir/{id}/verify` | Verify FIR integrity | `MultipartFile` | Verification result |
| GET | `/fir/stats` | Get police dashboard statistics | - | `{totalFirs, pending, registered}` |
| GET | `/fir/pending` | Get all pending FIRs | - | `List<FirRecord>` |
| PUT | `/fir/{id}/status` | Update FIR status | `?status=REGISTERED&reviewNotes=...` | Updated `FirRecord` |
| POST | `/fir/{id}/start-investigation` | Begin investigation | - | Success message |
| POST | `/fir/{id}/submit-investigation` | Submit findings to court | `{findings}` | Created `CaseDTO` |
| GET | `/fir/under-investigation` | Get FIRs under investigation | - | `List<FirRecord>` |
| POST | `/fir/{id}/evidence` | Upload evidence to FIR | `MultipartFile + description` | Success message |
| GET | `/fir/{id}/generate-summary` | AI summary of FIR | - | AI-generated summary |
| GET | `/fir/{id}/draft-submission` | AI charge sheet draft | - | AI-generated charge sheet |
| GET | `/fir/summons-tasks` | Get pending summons deliveries | - | List of summons tasks |
| POST | `/fir/{caseId}/complete-summons` | Mark summons as served | - | Success message |

---

### 4. Hearing API (`/api/hearings`)

**Controller:** `HearingController`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/hearings` | Schedule new hearing | `{caseId, hearingDate, type}` | `Hearing` |
| GET | `/hearings/case/{caseId}` | Get all hearings for a case | - | `List<Hearing>` |
| GET | `/hearings/{id}` | Get hearing details | - | `Hearing` |
| PUT | `/hearings/{id}` | Update hearing | `Hearing` | Updated `Hearing` |
| DELETE | `/hearings/{id}` | Cancel hearing | - | Success message |
| POST | `/hearings/{id}/start` | Start hearing (video call) | - | Meeting link |
| POST | `/hearings/{id}/complete` | Complete hearing | `{notes, outcome}` | Updated `Hearing` |
| GET | `/hearings/upcoming` | Get upcoming hearings | - | `List<Hearing>` |

---

### 5. Evidence API (`/api/evidence`)

**Controller:** `EvidenceController`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/evidence/upload` | Upload evidence | `MultipartFile + metadata` | `CaseEvidence` |
| GET | `/evidence/case/{caseId}` | Get all evidence for case | - | `List<CaseEvidence>` |
| GET | `/evidence/{id}` | Get evidence details | - | `CaseEvidence` |
| POST | `/evidence/{id}/verify` | Verify evidence integrity | `MultipartFile` | Verification result |
| DELETE | `/evidence/{id}` | Delete evidence | - | Success message |
| POST | `/evidence/{id}/certify` | BSA Section 63(4) certification | - | Certification details |

---

### 6. Vakil Friend (AI Assistant) API (`/api/vakil-friend`)

**Controller:** `VakilFriendController`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/vakil-friend/chat` | Send message to AI | `{userId, caseId, message}` | AI response |
| POST | `/vakil-friend/analyze-document` | AI document analysis | `MultipartFile` | Analysis result |
| POST | `/vakil-friend/generate-petition` | Generate petition draft | `{caseDetails}` | Draft petition text |
| GET | `/vakil-friend/diary/{caseId}` | Get AI diary for case | - | `List<VakilAiDiaryEntry>` |
| POST | `/vakil-friend/save-to-vault` | Save analyzed doc to vault | `{caseId, document}` | Success message |

---

### 7. Judge API (`/api/judge`)

**Controller:** `JudgeController`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/judge/docket` | Get judge's case docket | - | `List<CaseDTO>` |
| GET | `/judge/unassigned` | Get unassigned cases | - | `List<CaseDTO>` |
| POST | `/judge/assign/{caseId}` | Assign case to self | - | Updated `CaseDTO` |
| POST | `/judge/orders/{caseId}` | Issue court order | `CourtOrderRequest` | `CourtOrder` |
| { GET | `/judge/analytics` | Court analytics dashboard | - | Analytics data |
| POST | `/judge/summons/{caseId}` | Order summons | - | Success message |

---

### 8. Lawyer API (`/api/lawyer`)

**Controller:** `LawyerController`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/lawyer/cases` | Get lawyer's cases | - | `List<CaseDTO>` |
| GET | `/lawyer/clients` | Get lawyer's clients | - | `List<User>` |
| POST | `/lawyer/accept-case/{caseId}` | Accept case assignment | - | Success message |
| POST | `/lawyer/propose-strategy/{caseId}` | Propose case strategy | `{strategy}` | Success message |
| GET | `/lawyer/hearings` | Get upcoming hearings | - | `List<Hearing>` |

---

### 9. Notification API (`/api/notifications`)

**Controller:** `NotificationController`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/notifications` | Get user's notifications | - | `List<Notification>` |
| GET | `/notifications/unread-count` | Get unread count | - | `{count}` |
| PUT | `/notifications/{id}/read` | Mark notification as read | - | Success message |
| PUT | `/notifications/mark-all-read` | Mark all as read | - | Success message |

---

### 10. Profile API (`/api/profile`)

**Controller:** `ProfileController`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/profile` | Get current user profile | - | `UserProfile` |
| PUT | `/profile` | Update profile | `UserProfile` | Updated `UserProfile` |
| POST | `/profile/avatar` | Upload profile picture | `MultipartFile` | Image URL |

---

## Frontend Pages

### Public Pages

#### 1. **Landing** (`/`)
- **File:** `pages/Landing.jsx`
- **Purpose:** Landing page with hero, features, PWA install section
- **Key Features:**
  - Hero section with call-to-action
  - Features grid (AI Assistant, Constitution Reader, Case Filing, etc.)
  - How It Works section
  - Trust Indicators
  - News Section
  - PWA Install section (triggers browser install prompt)
  - Footer with links

#### 2. **Login** (`/login`)
- **File:** `pages/Login.jsx`
- **Purpose:** User authentication
- **Features:**
  - Email/password login
  - Role selection (Admin, Judge, Lawyer, Litigant, Police)
  - Face recognition login (if enrolled)
  - "Forgot Password" link
  - Redirects to role-appropriate dashboard

#### 3. **Signup** (`/signup`)
- **File:** `pages/Signup.jsx`
- **Purpose:** New user registration
- **Features:**
  - Name, email, password fields
  - Role selection
  - Terms acceptance
  - Redirects to login after successful registration

#### 4. **Reset Password** (`/reset-password`)
- **File:** `pages/ResetPassword.jsx`
- **Purpose:** Password recovery
- **Features:**
  - Token-based password reset
  - Email verification
  - New password entry

#### 5. **About** (`/about`)
- **File:** `pages/About.jsx`
- **Purpose:** About NyaySetu platform

#### 6. **Constitution** (`/constitution`)
- **File:** `pages/Constitution.jsx`
- **Purpose:** Indian Constitution reader/browser

---

### Litigant Pages (`/litigant/*`)

#### 1. **Litigant Dashboard** (`/litigant`)
- **File:** `litigant/LitigantDashboard.jsx`
- **Purpose:** Main dashboard for litigants
- **Features:**
  - Overview of active cases
  - Upcoming hearings
  - Recent notifications
  - Quick actions (File Case, Chat with Lawyer)

#### 2. **File Unified Page** (`/litigant/file`)
- **File:** `litigant/FileUnifiedPage.jsx`
- **Purpose:** AI-powered case filing wizard
- **Features:**
  - Step-by-step case filing
  - Vakil Friend AI assistance
  - Document upload
  - Petition generation

#### 3. **Vakil Friend Page** (`/litigant/vakil-friend`)
- **File:** `litigant/VakilFriendPage.jsx`
- **Purpose:** AI legal assistant chat
- **Features:**
  - Real-time AI chat
  - Document analysis
  - Legal advice
  - Petition drafting
  - Save to Evidence Vault

#### 4. **Case Detail Page** (`/litigant/cases/:id`)
- **File:** `litigant/CaseDetailPage.jsx`
- **Purpose:** Detailed view of a specific case
- **Features:**
  - Case information
  - Timeline
  - Documents & evidence
  - Communication with lawyer
  - Hearing schedule

#### 5. **Case Diary Page** (`/litigant/diary/:id`)
- **File:** `litigant/CaseDiaryPage.jsx`
- **Purpose:** SHA-256 protected case diary
- **Features:**
  - Chronological case events
  - AI conversation logs
  - Tamper-proof entries

#### 6. **Hearings Page** (`/litigant/hearings`)
- **File:** `litigant/HearingsPage.jsx`
- **Purpose:** View and join hearings
- **Features:**
  - Upcoming hearings list
  - Past hearings
  - Join virtual hearing button

#### 7. **Lawyer Chat Page** (`/litigant/lawyer-chat`)
- **File:** `litigant/LawyerChatPage.jsx`
- **Purpose:** Direct messaging with assigned lawyer
- **Features:**
  - Real-time chat
  - File sharing
  - Case discussion

#### 8. **Profile Page** (`/litigant/profile`)
- **File:** `litigant/ProfilePage.jsx`
- **Purpose:** User profile management
- **Features:**
  - Personal information
  - Security settings
  - Notification preferences

---

### Lawyer Pages (`/lawyer/*`)

#### 1. **Lawyer Dashboard** (`/lawyer`)
- **File:** `dashboards/LawyerDashboard.jsx`
- **Purpose:** Main dashboard for lawyers
- **Features:**
  - Active cases overview
  - Client requests
  - Upcoming hearings
  - Revenue analytics

#### 2. **Lawyer Cases Page** (`/lawyer/cases`)
- **File:** `lawyer/LawyerCasesPage.jsx`
- **Purpose:** Manage all assigned cases
- **Features:**
  - Case list with filters
  - Status tracking
  - Quick actions

#### 3. **Case Workspace** (`/lawyer/cases/:id/workspace`)
- **File:** `lawyer/CaseWorkspace.jsx`
- **Purpose:** Comprehensive case management workspace
- **Features:**
  - Multi-tab interface (Overview, Evidence, Timeline, Drafts)
  - Document management
  - Case notes
  - Client communication

#### 4. **Case Preparation Page** (`/lawyer/cases/:id/prepare`)
- **File:** `lawyer/CasePreparationPage.jsx`
- **Purpose:** Prepare case for trial
- **Features:**
  - Evidence review
  - Witness preparation
  - Legal research

#### 5. **Evidence Vault Page** (`/lawyer/evidence-vault`)
- **File:** `lawyer/EvidenceVaultPage.jsx`
- **Purpose:** Centralized evidence management
- **Features:**
  - Upload evidence with SHA-256
  - BSA Section 63(4) certification
  - Evidence verification

#### 6. **My Clients Page** (`/lawyer/clients`)
- **File:** `lawyer/MyClientsPage.jsx`
- **Purpose:** Manage client relationships
- **Features:**
  - Client list
  - Communication history
  - Case associations

#### 7. **Client Chat Page** (`/lawyer/clients/:id/chat`)
- **File:** `lawyer/ClientChatPage.jsx`
- **Purpose:** Direct messaging with clients

#### 8. **Lawyer Hearings Page** (`/lawyer/hearings`)
- **File:** `lawyer/LawyerHearingsPage.jsx`
- **Purpose:** Hearing schedule and preparation

#### 9. **AI Legal Assistant Page** (`/lawyer/ai-assistant`)
- **File:** `lawyer/AILegalAssistantPage.jsx`
- **Purpose:** AI-powered legal research and drafting

#### 10. **Analytics Page** (`/lawyer/analytics`)
- **File:** `lawyer/AnalyticsPage.jsx`
- **Purpose:** Performance metrics and insights

#### 11. **Offline Drafts Page** (`/lawyer/drafts`)
- **File:** `lawyer/OfflineDraftsPage.jsx`
- **Purpose:** Manage offline-created drafts (PWA feature)

#### 12. **Lawyer Profile Page** (`/lawyer/profile`)
- **File:** `lawyer/LawyerProfilePage.jsx`
- **Purpose:** Profile and practice management

---

### Judge Pages (`/judge/*`)

#### 1. **Judicial Overview** (`/judge`)
- **File:** `judge/JudicialOverview.jsx`
- **Purpose:** Judge's main dashboard
- **Features:**
  - Case statistics
  - Pending decisions
  - Hearing schedule

#### 2. **My Docket** (`/judge/docket`)
- **File:** `judge/MyDocket.jsx`
- **Purpose:** Assigned cases list
- **Features:**
  - Case filters
  - Priority cases
  - Status tracking

#### 3. **Unassigned Pool** (`/judge/unassigned`)
- **File:** `judge/UnassignedPool.jsx`
- **Purpose:** Cases awaiting judge assignment
- **Features:**
  - Available cases
  - Case details preview
  - Self-assign capability

#### 4. **Judge Case Workspace** (`/judge/cases/:id`)
- **File:** `judge/JudgeCaseWorkspace.jsx`
- **Purpose:** Comprehensive case review and management
- **Features:**
  - 7-stage judicial process tabs
  - Evidence review
  - Order drafting
  - Trial readiness checklist

#### 5. **Conduct Hearing Page** (`/judge/hearings/:id`)
- **File:** `judge/ConductHearingPage.jsx`
- **Purpose:** Conduct virtual/physical hearing
- **Features:**
  - Video conferencing
  - Real-time notes
  - Evidence presentation

#### 6. **Live Hearing** (`/judge/hearings/:id/live`)
- **File:** `judge/LiveHearing.jsx`
- **Purpose:** Active hearing session

#### 7. **Court Analytics Page** (`/judge/analytics`)
- **File:** `judge/CourtAnalyticsPage.jsx`
- **Purpose:** Judicial performance analytics
- **Features:**
  - Case disposal rate
  - Pending cases by category
  - Time-to-disposition metrics

---

### Police Pages (`/police/*`)

#### 1. **Police Dashboard** (`/police`)
- **File:** `police/PoliceDashboard.jsx`
- **Purpose:** Main dashboard for police officers
- **Features:**
  - FIR statistics
  - Pending investigations
  - Summons delivery tasks

#### 2. **Upload FIR Page** (`/police/upload`)
- **File:** `police/UploadFirPage.jsx`
- **Purpose:** Upload and register new FIRs
- **Features:**
  - FIR document upload
  - SHA-256 hashing
  - Metadata entry

#### 3. **My FIRs Page** (`/police/firs`)
- **File:** `police/MyFirsPage.jsx`
- **Purpose:** View all FIRs filed by officer
- **Features:**
  - FIR list with filters
  - Status tracking
  - Investigation assignment

#### 4. **Police Investigations Page** (`/police/investigations`)
- **File:** `police/PoliceInvestigationsPage.jsx`
- **Purpose:** Manage ongoing investigations
- **Features:**
  - Investigation list
  - Evidence upload
  - Submit findings to court

#### 5. **Investigation Details Page** (`/police/investigation/:id`)
- **File:** `police/InvestigationDetailsPage.jsx`
- **Purpose:** Detailed investigation management
- **Features:**
  - FIR details
  - Evidence collection
  - AI summary generation
  - Court submission

---

### Admin Pages (`/admin/*`)

#### 1. **Admin Dashboard** (`/admin`)
- **File:** `dashboards/AdminDashboard.jsx`
- **Purpose:** System administration
- **Features:**
  - User management
  - System statistics
  - Configuration
  - Audit logs

---

## User Roles & Permissions

### Role Hierarchy

1. **ADMIN** - Full system access
2. **JUDGE** - Case assignment, hearings, orders
3. **LAWYER** - Case management, client representation
4. **LITIGANT** - File cases, track progress
5. **POLICE** - FIR management, investigations

### Permission Matrix

| Feature | ADMIN | JUDGE | LAWYER | LITIGANT | POLICE |
|---------|-------|-------|--------|----------|--------|
| File Case | ✓ | ✓ | ✓ | ✓ | ✗ |
| Assign Judge | ✓ | ✓ | ✗ | ✗ | ✗ |
| Conduct Hearing | ✓ | ✓ | ✗ | ✗ | ✗ |
| Upload Evidence | ✓ | ✓ | ✓ | ✓ | ✓ |
| File FIR | ✓ | ✗ | ✗ | ✓ | ✓ |
| Manage Investigations | ✓ | ✗ | ✗ | ✗ | ✓ |
| Issue Orders | ✓ | ✓ | ✗ | ✗ | ✗ |
| View All Cases | ✓ | ✓ (assigned) | ✗ | ✗ | ✗ |

---

## Key Workflows

### 1. Case Filing (Litigant + Vakil Friend)

1. **Litigant** navigates to `/litigant/file`
2. **Vakil Friend AI** asks questions about the case
3. **AI** generates case summary and draft petition
4. **Litigant** reviews and approves
5. **Case** created with status: `DRAFT`, stage: `DRAFT`
6. **System** logs conversation to `VakilAiDiaryEntry` (SHA-256 protected)

### 2. Lawyer-Client Draft Approval

1. **Lawyer** submits draft via `POST /api/cases/{id}/submit-draft`
2. **CaseEntity** `draftApprovalStatus` set to `AWAITING_CLIENT`
3. **Litigant** reviews draft
4. **Litigant** approves/rejects via `POST /api/cases/{id}/review-draft`
5. If approved: `draftApprovalStatus` = `APPROVED`, case can proceed
6. If rejected: Lawyer revises and resubmits

### 3. FIR to Court Case Transition (Police)

1. **Police** uploads FIR via `/police/upload`
2. **System** generates SHA-256 hash
3. **Police** reviews pending FIRs (`GET /api/fir/pending`)
4. **Police** updates status to `REGISTERED`
5. **Police** starts investigation (`POST /api/fir/{id}/start-investigation`)
6. **Police** uploads evidence
7. **Police** submits to court (`POST /api/fir/{id}/submit-investigation`)
8. **System** creates `CaseEntity` linked to FIR (`sourceFirId`)
9. **Judge** receives case in unassigned pool

### 4. Judge's 7-Stage Process

1. **Cognizance** - Review case, check BSA certification
2. **Summons** - Issue summons order (`POST /api/judge/summons/{caseId}`)
3. **Appearance** - Verify parties appeared
4. **Evidence** - Review submitted evidence, verify SHA-256 hashes
5. **Arguments** - Conduct hearings
6. **Judgment** - Draft judgment
7. **Verdict** - Issue final order

**Trial Ready Checklist:**
- ✓ `summonsDelivered` = true
- ✓ `bsa634Certified` = true
- ✓ `blockingErrors` = null/empty
- ✓ All evidence verified

---

## Security Features

### 1. **Authentication**
- JWT tokens with 24-hour expiration
- BCrypt password hashing
- Face recognition (optional)

### 2. **Data Integrity**
- SHA-256 hashing for all documents and evidence
- BSA Section 63(4) certification for digital evidence
- Tamper-proof case diary entries

### 3. **Authorization**
- Role-based access control (RBAC)
- Spring Security filters
- API endpoint protection

### 4. **PWA Security**
- Service worker caching
- Offline data encryption
- Secure manifest configuration

---

## Configuration

### Backend (`application.properties`)

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/nyaysetu_db
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT
jwt.secret=your-256-bit-secret-key
jwt.expiration=86400000

# File Upload
file.upload-dir=uploads/
spring.servlet.multipart.max-file-size=50MB

# AI (Groq)
groq.api.key=your_groq_api_key
groq.api.url=https://api.groq.com/openai/v1/chat/completions

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# CORS
cors.allowed.origins=http://localhost:5173,http://localhost:4174
```

### Frontend (Environment Variables)

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_GROQ_API_KEY=your_groq_api_key
```

---

## Deployment

### Development
```bash
# Backend
cd backend/nyaysetu-backend
mvn spring-boot:run

# Frontend
cd frontend/nyaysetu-frontend
npm run dev  # Port 5173
```

### Production
```bash
# Frontend build
npm run build
npm run preview  # Port 4174 (tests PWA)

# Backend
mvn clean package
java -jar target/nyaysetu-backend-0.0.1-SNAPSHOT.jar
```

---

## Support & Contact

For questions or issues, contact: **gadekarvirendra4@gmail.com**

---

**End of Documentation**
