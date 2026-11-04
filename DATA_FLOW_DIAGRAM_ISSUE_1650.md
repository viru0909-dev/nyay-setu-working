# Data Flow Diagram - Issue #1650
## Input Validation & Sanitization Flow

## Overview
This document illustrates how user input flows through validation and sanitization layers in the Vakil Friend Chat.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INPUT                              │
│                  (Types message in textarea)                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND VALIDATION (Real-time)                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ handleInputChange(e)                                     │  │
│  │ ├─ Update inputMessage state                            │  │
│  │ ├─ Check length                                         │  │
│  │ └─ Set validationError if invalid                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Visual Feedback:                                              │
│  • Character counter: "XXX / 2000"                             │
│  • Color: Gray → Orange → Red                                  │
│  • Border: Gray → Red (if error)                               │
│  • Error message: "⚠️ Message exceeds..."                      │
│  • Send button: Enabled/Disabled                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                   User clicks Send
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND VALIDATION (Pre-submit)                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ validateMessage(message)                                 │  │
│  │ ├─ Check if empty/whitespace                            │  │
│  │ ├─ Check if > 2000 characters                           │  │
│  │ └─ Return error or null                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  If error: Stop and display error message                      │
│  If valid: Continue to sanitization                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND SANITIZATION                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ sanitizeInput(message)                                   │  │
│  │ ├─ Remove <script> tags                                 │  │
│  │ ├─ Remove event handlers (onclick, etc.)                │  │
│  │ ├─ Remove javascript: protocol                          │  │
│  │ ├─ Remove data: URIs                                    │  │
│  │ └─ Remove <iframe>, <embed>, <object>                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Output: Partially sanitized message                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   HTTP REQUEST                                  │
│                                                                 │
│  POST /api/v1/vakil-friend/chat/{sessionId}                    │
│  {                                                              │
│    "message": "sanitized user input",                          │
│    "language": "en",                                            │
│    "ocrContext": "...",                                         │
│    "audioData": null                                            │
│  }                                                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND CONTROLLER                            │
│              VakilFriendController.chat()                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ @Valid @RequestBody ChatMessageRequest request          │  │
│  │                                                          │  │
│  │ Spring Boot Validation:                                 │  │
│  │ ├─ @NotBlank: Reject if empty/whitespace               │  │
│  │ └─ @Size(max=2000): Reject if > 2000 chars             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  If validation fails:                                           │
│  └─ HTTP 400 Bad Request                                        │
│     {                                                           │
│       "status": 400,                                            │
│       "error": "Validation failed",                             │
│       "message": "Message must not exceed 2000 characters"      │
│     }                                                           │
│                                                                 │
│  If validation passes: Forward to Service                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICE                              │
│              VakilFriendService.chat()                          │
│                                                                 │
│  Step 1: Session Validation                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ • Session exists?                                        │  │
│  │ • User owns session?                                     │  │
│  │ • Session is ACTIVE?                                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Step 2: Input Sanitization                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ userMessage = sanitizeUserInput(request.getMessage())    │  │
│  │                                                          │  │
│  │ Sanitization:                                            │  │
│  │ ├─ Remove <script> tags and content                     │  │
│  │ ├─ Remove ALL event handlers                            │  │
│  │ ├─ Remove javascript: protocol                          │  │
│  │ ├─ Remove malicious data: URIs                          │  │
│  │ ├─ Remove <iframe>, <embed>, <object> tags              │  │
│  │ ├─ Remove <style> tags                                  │  │
│  │ ├─ Escape < to &lt;                                     │  │
│  │ ├─ Escape > to &gt;                                     │  │
│  │ └─ Preserve Unicode (Hindi, Marathi, emojis)            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Step 3: Audio Transcription (if audioData present)            │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ • Transcribe audio → text                                │  │
│  │ • Sanitize transcribed text                              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Step 4: Translation (if needed)                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ • Translate userLang → English                           │  │
│  │ • Add OCR context if present                             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Step 5: PII Sanitization (for Groq API)                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ • Mask Aadhaar, PAN, phone numbers                       │  │
│  │ • Mask caste, medical info                               │  │
│  │ • Replace with pseudonyms                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Step 6: AI Processing                                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ • Retrieve RAG context (if available)                    │  │
│  │ • Send to Groq API                                       │  │
│  │ • Get AI response                                        │  │
│  │ • Translate response back to userLang                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Step 7: Persistence                                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ • Store sanitized message in conversation history        │  │
│  │ • Store AI response                                      │  │
│  │ • Log to Case Diary (if linked to case)                 │  │
│  │ • Update session                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE STORAGE                             │
│                                                                 │
│  chat_sessions.conversation_data (JSON):                       │
│  [                                                              │
│    {                                                            │
│      "role": "user",                                            │
│      "content": "Fully sanitized message (English)"            │
│    },                                                           │
│    {                                                            │
│      "role": "assistant",                                       │
│      "content": "AI response (English)"                         │
│    }                                                            │
│  ]                                                              │
│                                                                 │
│  ✅ Stored content is:                                         │
│  • HTML-safe (escaped)                                         │
│  • XSS-free (no scripts)                                       │
│  • PII-protected (for external API calls)                      │
│  • Multilingual (Unicode preserved)                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HTTP RESPONSE                                │
│                                                                 │
│  {                                                              │
│    "message": "Translated AI response in user language",       │
│    "readyToFile": false,                                        │
│    "transcribedText": null                                      │
│  }                                                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ • Clear input field                                      │  │
│  │ • Clear validation error                                 │  │
│  │ • Display user message in chat                           │  │
│  │ • Display AI response in chat                            │  │
│  │ • Scroll to bottom                                       │  │
│  │ • Enable voice output (if avatar active)                 │  │
│  │ └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ReactMarkdown safely renders response:                        │
│  • Markdown supported                                          │
│  • HTML escaped by sanitization                                │
│  • No XSS execution possible                                   │
└─────────────────────────────────────────────────────────────────┘

```

---

## Error Flow

### Empty/Whitespace Message

```
User Input: "   "
    │
    ▼
Frontend Validation (handleInputChange)
    │
    ├─ inputMessage.trim().length === 0
    │
    ▼
Set validationError: "Message cannot be empty"
    │
    ▼
Send button disabled
    │
    ▼
User cannot submit
```

### Oversized Message

```
User Input: <2001 character string>
    │
    ▼
Frontend Validation (real-time)
    │
    ├─ inputMessage.length > 2000
    │
    ▼
Visual Feedback:
├─ Counter turns RED: "2001 / 2000"
├─ Border turns RED
├─ Error message: "⚠️ Message exceeds 2000 characters"
└─ Send button DISABLED
    │
    ▼
User must trim message before sending
```

### XSS Attempt

```
User Input: "<script>alert('XSS')</script>Hello"
    │
    ▼
Frontend Sanitization
    │
    ├─ Remove <script> tags
    │
    ▼
Sanitized: "Hello"
    │
    ▼
HTTP Request: {"message": "Hello"}
    │
    ▼
Backend Sanitization (defense in depth)
    │
    ├─ Additional sanitization
    │
    ▼
Stored in DB: "Hello"
    │
    ▼
Displayed safely in chat: "Hello"
```

### Backend Validation Bypass Attempt

```
Direct API Call (bypassing frontend):
POST /api/v1/vakil-friend/chat/{sessionId}
{"message": "<2001 character string>"}
    │
    ▼
Backend Controller
    │
    ├─ @Valid annotation triggers validation
    ├─ @Size(max=2000) constraint violated
    │
    ▼
HTTP 400 Bad Request
{
  "status": 400,
  "error": "Bad Request",
  "message": "Message must not exceed 2000 characters"
}
    │
    ▼
Request rejected, no processing occurs
```

---

## Validation Layers

### Layer 1: Frontend Real-time Validation
- **When:** On every keystroke
- **Purpose:** Immediate user feedback
- **Checks:** Length, emptiness
- **Action:** Update UI (counter, colors, errors)

### Layer 2: Frontend Pre-submit Validation
- **When:** When user clicks Send
- **Purpose:** Final check before API call
- **Checks:** Empty, whitespace, length
- **Action:** Block submission if invalid

### Layer 3: Frontend Sanitization
- **When:** Before HTTP request
- **Purpose:** Remove obvious XSS attempts
- **Checks:** Scripts, handlers, dangerous tags
- **Action:** Clean input before transmission

### Layer 4: Backend Validation (Spring Boot)
- **When:** On API request receipt
- **Purpose:** Enforce business rules
- **Checks:** @NotBlank, @Size constraints
- **Action:** Return 400 if invalid

### Layer 5: Backend Sanitization
- **When:** After validation passes
- **Purpose:** Defense in depth XSS protection
- **Checks:** All HTML/JS threats
- **Action:** Sanitize before processing

### Layer 6: PII Sanitization (optional)
- **When:** Before external API call
- **Purpose:** Privacy protection
- **Checks:** Sensitive data patterns
- **Action:** Mask/pseudonymize before Groq API

---

## Security Boundaries

```
┌──────────────────────────────────────────────────────┐
│                    USER BROWSER                       │
│  ┌───────────────────────────────────────────────┐  │
│  │  Client-side Validation & Sanitization        │  │
│  │  (Can be bypassed by malicious user)          │  │
│  └───────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────┘
                     │ HTTPS
                     ▼
┌──────────────────────────────────────────────────────┐
│              SECURITY BOUNDARY (API Gateway)          │
│  • Authentication (JWT)                              │
│  • Rate Limiting (20 req/min)                        │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│                 BACKEND APPLICATION                   │
│  ┌───────────────────────────────────────────────┐  │
│  │  Server-side Validation & Sanitization        │  │
│  │  (TRUSTED - Cannot be bypassed)               │  │
│  │  • @Valid constraints                         │  │
│  │  • sanitizeUserInput()                        │  │
│  │  • Session ownership check                    │  │
│  └───────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│              SECURITY BOUNDARY (PII Layer)            │
│  • PII Sanitizer (before Groq API)                   │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│                 EXTERNAL API (Groq)                   │
│  • Receives sanitized, PII-masked content            │
└──────────────────────────────────────────────────────┘
```

---

## Data Transformation Example

### Original User Input
```
<script>alert('XSS')</script>
I need help with a property dispute.
My rent is <5000 and income >20000.
मुझे कानूनी मदद चाहिए 🙏
```

### After Frontend Sanitization
```
I need help with a property dispute.
My rent is <5000 and income >20000.
मुझे कानूनी मदद चाहिए 🙏
```

### After Backend Sanitization
```
I need help with a property dispute.
My rent is &lt;5000 and income &gt;20000.
मुझे कानूनी मदद चाहिए 🙏
```

### After PII Sanitization (for Groq)
```
I need help with a property dispute.
My rent is &lt;5000 and income &gt;20000.
मुझे कानूनी मदद चाहिए 🙏
(No PII detected - unchanged)
```

### Stored in Database
```json
{
  "role": "user",
  "content": "I need help with a property dispute.\nMy rent is &lt;5000 and income &gt;20000.\nमुझे कानूनी मदद चाहिए 🙏"
}
```

### Displayed to User
```
I need help with a property dispute.
My rent is <5000 and income >20000.
मुझे कानूनी मदद चाहिए 🙏
```
(Rendered safely by ReactMarkdown with HTML escaping)

---

## Performance Characteristics

| Stage | Time | Impact |
|-------|------|--------|
| Frontend real-time validation | ~0.1ms | Negligible |
| Frontend pre-submit validation | ~0.1ms | Negligible |
| Frontend sanitization | ~0.5ms | Negligible |
| HTTP request | ~50-200ms | Network latency |
| Backend validation | ~1ms | Minimal |
| Backend sanitization | ~1-2ms | Minimal |
| Database query | ~5-10ms | Minimal |
| AI API call | ~1-3s | Dominant factor |
| Total user experience | ~1-3s | AI processing time |

---

## Conclusion

The multi-layer validation and sanitization approach provides:
- **Defense in Depth:** Multiple security layers
- **User Experience:** Immediate feedback at every stage
- **Data Integrity:** Only valid, safe data stored
- **Performance:** Minimal overhead (<5ms total)
- **Compatibility:** Preserves multilingual content

Every input passes through 5-6 validation/sanitization layers before being stored, ensuring maximum security without compromising usability.
