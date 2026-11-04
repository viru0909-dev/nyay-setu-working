# Vakil Friend Chat - Input Validation & Sanitization Testing Guide

## Overview
This document provides comprehensive testing instructions for the input validation and sanitization features implemented for GitHub Issue #1650.

## Implementation Summary

### Backend Changes

#### 1. ChatMessageRequest DTO (`backend/nyaysetu-backend/src/main/java/com/nyaysetu/backend/dto/ChatMessageRequest.java`)
- Added `@Size(max = 2000)` validation constraint
- Enhanced `@NotBlank` validation message
- Maximum message length: **2000 characters**

#### 2. VakilFriendService (`backend/nyaysetu-backend/src/main/java/com/nyaysetu/backend/service/VakilFriendService.java`)
- Added `sanitizeUserInput()` method to prevent XSS attacks
- Sanitization is applied BEFORE processing user messages
- Sanitization is also applied to transcribed audio input
- Preserves legitimate text, punctuation, and Unicode characters (including Indian languages)

**Sanitization Features:**
- Removes `<script>` tags and their content
- Removes event handlers (onclick, onerror, etc.)
- Removes `javascript:` protocol
- Removes data URIs that could contain scripts
- Removes `<iframe>`, `<embed>`, and `<object>` tags
- Removes `<style>` tags
- Escapes remaining angle brackets (`<` → `&lt;`, `>` → `&gt;`)

### Frontend Changes

#### 1. VakilFriendPage Component (`frontend/nyaysetu-frontend/src/pages/litigant/VakilFriendPage.jsx`)
- Added character counter display (current/max)
- Added real-time input validation
- Added validation error messages
- Enhanced Send button state management
- Added client-side sanitization

**Features:**
- Character count displayed: `XXX / 2000`
- Color-coded counter:
  - Gray: Normal (< 1800 chars)
  - Orange: Warning (≥ 1800 chars)
  - Red: Exceeded (> 2000 chars)
- Send button disabled when:
  - Message is empty or whitespace-only
  - Message exceeds 2000 characters
  - Validation error exists
  - User is rate-limited
  - System is loading

---

## Test Cases

### Test Case 1: Empty Message
**Description:** Verify that empty messages cannot be submitted

**Steps:**
1. Open Vakil Friend Chat
2. Leave the input field empty
3. Click the Send button

**Expected Result:**
- Send button should be disabled (grayed out)
- No message should be sent
- No error message displayed (button is simply disabled)

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 2: Whitespace-Only Message
**Description:** Verify that messages containing only spaces/tabs/newlines cannot be submitted

**Test Input:**
```
"   " (multiple spaces)
"		" (tabs)
```

**Steps:**
1. Type only whitespace characters in the input field
2. Try to click the Send button

**Expected Result:**
- Send button should be disabled
- Validation error: "Message cannot be empty"
- No message should be sent

**Backend Response (if bypassed):**
- HTTP 400 Bad Request
- Error: "Message cannot be empty or contain only whitespace"

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 3: Normal Message
**Description:** Verify that normal messages are sent successfully

**Test Input:**
```
"I need help filing a case for property dispute."
```

**Steps:**
1. Type the message in the input field
2. Character counter should show: "46 / 2000"
3. Click Send button

**Expected Result:**
- Message sent successfully
- Input field cleared
- Character counter reset
- AI response received

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 4: Message at Maximum Limit
**Description:** Verify that messages at exactly 2000 characters are accepted

**Test Input:**
Create a message with exactly 2000 characters (use a text generator)

**Steps:**
1. Paste 2000-character message
2. Character counter should show: "2000 / 2000" (in orange/warning color)
3. Click Send button

**Expected Result:**
- Message sent successfully
- No validation error
- Backend accepts the message

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 5: Message Exceeding Maximum Limit
**Description:** Verify that messages over 2000 characters are rejected

**Test Input:**
Create a message with 2001+ characters

**Steps:**
1. Paste 2100-character message
2. Observe character counter

**Expected Result:**
- Character counter shows: "2100 / 2000" (in red)
- Validation error displayed: "⚠️ Message exceeds 2000 characters"
- Send button disabled (grayed out, cursor not-allowed)
- Message cannot be sent

**Backend Response (if bypassed):**
- HTTP 400 Bad Request
- Error: "Message must not exceed 2000 characters"

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 6: XSS - Script Tag Injection
**Description:** Verify that script tags are sanitized

**Test Input:**
```html
<script>alert('XSS')</script>Hello, I need legal help
```

**Expected Result:**
- Frontend sanitization: Script tag removed before sending
- Backend sanitization: Script tag removed if bypassed frontend
- Stored message: "Hello, I need legal help"
- No script execution in UI

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 7: XSS - Event Handler Injection
**Description:** Verify that event handlers are sanitized

**Test Input:**
```html
<img src=x onerror="alert('XSS')">
<div onclick="alert('XSS')">Click me</div>
```

**Expected Result:**
- Event handlers removed
- Angle brackets escaped: `&lt;img src=x&gt;`
- No script execution

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 8: XSS - JavaScript Protocol
**Description:** Verify that javascript: protocol is removed

**Test Input:**
```html
<a href="javascript:alert('XSS')">Click here</a>
```

**Expected Result:**
- `javascript:` protocol removed
- Angle brackets escaped
- No script execution

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 9: XSS - Data URI
**Description:** Verify that malicious data URIs are removed

**Test Input:**
```html
<iframe src="data:text/html,<script>alert('XSS')</script>"></iframe>
```

**Expected Result:**
- Data URI removed
- iframe tag removed
- Content escaped

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 10: Legitimate HTML-like Text
**Description:** Verify that legitimate text containing < and > is preserved

**Test Input:**
```
My rent is <5000 per month and I earn >20000 monthly
A < B and B > C in mathematics
```

**Expected Result:**
- Frontend: `<` and `>` escaped to `&lt;` and `&gt;`
- Backend: Additional sanitization applied
- Message preserved but HTML-safe
- Displayed correctly in chat

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 11: Unicode and Indian Language Content
**Description:** Verify that Hindi/Marathi/Tamil characters are preserved

**Test Input:**
```
मुझे कानूनी मदद चाहिए (Hindi)
मला कायदेशीर मदत हवी (Marathi)
எனக்கு சட்ட உதவி வேண்டும் (Tamil)
ನನಗೆ ಕಾನೂನು ಸಹಾಯ ಬೇಕು (Kannada)
```

**Steps:**
1. Type or paste Indian language text
2. Send message

**Expected Result:**
- All Unicode characters preserved
- Character count accurate
- Message sent and displayed correctly
- Translation/AI processing works normally

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 12: Emojis and Special Characters
**Description:** Verify that emojis and special characters work correctly

**Test Input:**
```
🙏 Namaste! I need help 👨‍⚖️
What about cases involving ₹50,000? 💰
```

**Steps:**
1. Type message with emojis
2. Send message

**Expected Result:**
- Emojis preserved and displayed correctly
- Special characters (₹) work
- Character count accurate

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 13: Rate Limiting
**Description:** Verify rate limiting still works with new validation

**Steps:**
1. Send more than 20 messages in 60 seconds
2. Observe behavior

**Expected Result:**
- After 20 messages: HTTP 429 (Too Many Requests)
- Cooldown timer displayed
- Send button disabled with countdown
- Message displayed: "⏳ You've sent too many messages. Please wait XX seconds before continuing."

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 14: Mixed Content - Real Legal Question with Punctuation
**Description:** Verify realistic legal queries work correctly

**Test Input:**
```
I have a property dispute case. My neighbor has illegally occupied 200 sq. ft. of my land (plot no. 123/45). He refuses to vacate despite multiple notices. Can I file a civil suit? What documents do I need? The incident date is 15/08/2023.
```

**Expected Result:**
- Message sent successfully
- All punctuation preserved
- Numbers and dates preserved
- AI responds appropriately

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 15: OCR Context with Validation
**Description:** Verify OCR-scanned documents work with new validation

**Steps:**
1. Upload a historical document for OCR scanning
2. OCR text extracted and added to context
3. Type a question about the document
4. Send message

**Expected Result:**
- OCR context included in payload
- Message validation applies only to user message, not OCR context
- Combined content processed correctly
- AI responds with document context

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 16: Voice Input with Validation
**Description:** Verify voice messages work with sanitization

**Steps:**
1. Click microphone button
2. Speak a message
3. Stop recording
4. Message transcribed and sent

**Expected Result:**
- Transcribed text sanitized
- If transcription contains HTML-like content, it's escaped
- Character limit applies to transcribed text
- Message sent successfully

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 17: Error Handling - Backend Validation
**Description:** Verify backend validation works when frontend is bypassed

**Steps:**
1. Use API client (Postman/curl) to send invalid request directly
2. Send empty message: `{"message": ""}`
3. Send oversized message: `{"message": "<2001 character string>"}`

**Expected Result:**

**Empty Message:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Message cannot be empty or contain only whitespace"
}
```

**Oversized Message:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Message must not exceed 2000 characters"
}
```

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 18: Character Counter Real-time Update
**Description:** Verify character counter updates in real-time

**Steps:**
1. Type slowly in the input field
2. Observe character counter

**Expected Result:**
- Counter updates with each keystroke
- Color changes:
  - Gray when < 1800 chars
  - Orange when ≥ 1800 chars
  - Red when > 2000 chars
- Font weight increases when approaching/exceeding limit

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 19: Multiple Script Injection Attempts
**Description:** Verify comprehensive XSS protection

**Test Input:**
```html
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<iframe src="javascript:alert(1)">
<body onload=alert(1)>
<input onfocus=alert(1) autofocus>
<select onfocus=alert(1) autofocus>
<textarea onfocus=alert(1) autofocus>
<keygen onfocus=alert(1) autofocus>
<video><source onerror="alert(1)">
<audio src=x onerror=alert(1)>
<details open ontoggle=alert(1)>
<object data="javascript:alert(1)">
<embed src="javascript:alert(1)">
```

**Expected Result:**
- All malicious tags and attributes removed
- Remaining text escaped
- No script execution
- Safe content stored in database

**Status:** ✅ Pass / ❌ Fail

---

### Test Case 20: Paste Long Content
**Description:** Verify validation when pasting large content

**Steps:**
1. Copy a 3000-character text
2. Paste into input field
3. Observe validation

**Expected Result:**
- Text pasted
- Character counter shows: "3000 / 2000" (red)
- Validation error displayed immediately
- Send button disabled
- User must trim content before sending

**Status:** ✅ Pass / ❌ Fail

---

## Testing Procedure

### Manual Testing
1. Start the backend server
2. Start the frontend development server
3. Open browser console (F12)
4. Navigate to Vakil Friend Chat
5. Execute each test case
6. Record results in the "Status" field
7. Check browser console for any JavaScript errors
8. Check backend logs for sanitization logs

### API Testing with Postman/curl

**Start a Chat Session:**
```bash
POST /api/v1/vakil-friend/start
Authorization: Bearer <token>
```

**Send Message (Valid):**
```bash
POST /api/v1/vakil-friend/chat/{sessionId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "I need legal help with a property dispute",
  "language": "en"
}
```

**Send Message (Invalid - Empty):**
```bash
POST /api/v1/vakil-friend/chat/{sessionId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "",
  "language": "en"
}
```

**Send Message (Invalid - Too Long):**
```bash
POST /api/v1/vakil-friend/chat/{sessionId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "<2001 character string>",
  "language": "en"
}
```

**Send Message (XSS Attempt):**
```bash
POST /api/v1/vakil-friend/chat/{sessionId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "<script>alert('XSS')</script>Hello",
  "language": "en"
}
```

---

## Security Validation Checklist

- [ ] Frontend prevents empty message submission
- [ ] Frontend prevents oversized message submission
- [ ] Frontend sanitizes HTML/JavaScript before sending
- [ ] Backend validates message length (≤ 2000 chars)
- [ ] Backend rejects empty/whitespace-only messages
- [ ] Backend sanitizes script tags
- [ ] Backend sanitizes event handlers
- [ ] Backend sanitizes javascript: protocol
- [ ] Backend sanitizes data URIs
- [ ] Backend sanitizes iframe/embed/object tags
- [ ] Backend escapes remaining HTML
- [ ] Indian language characters preserved
- [ ] Emojis and Unicode preserved
- [ ] Normal punctuation preserved
- [ ] Rate limiting still functional
- [ ] Voice input sanitized
- [ ] OCR context handled correctly
- [ ] No XSS vulnerabilities
- [ ] No JavaScript execution from user input
- [ ] Database stores sanitized content

---

## Known Limitations

1. **Character Counting:** Emoji characters may count as multiple characters depending on the encoding
2. **Copy-Paste Behavior:** Users can paste content exceeding the limit, but will be prevented from sending
3. **Aggressive Sanitization:** Legitimate text containing HTML syntax (e.g., code examples) will be escaped
4. **Translation Impact:** Sanitization occurs before translation, so translated output is safe

---

## Regression Testing

After implementing these changes, verify that:
- [ ] Existing chat functionality works normally
- [ ] Session creation works
- [ ] Session history loads correctly
- [ ] Document upload and analysis works
- [ ] OCR scanning works
- [ ] Voice input works
- [ ] Case filing completion works
- [ ] Deep research feature works
- [ ] 3D Avatar integration works
- [ ] Multi-language support works
- [ ] Case diary logging works

---

## Deployment Checklist

Before deploying to production:
- [ ] All test cases pass
- [ ] Backend validation tested via API
- [ ] Frontend validation tested in browser
- [ ] XSS protection verified
- [ ] Character limit enforced
- [ ] No console errors
- [ ] No backend exceptions
- [ ] Database migrations (if any) completed
- [ ] Documentation updated
- [ ] Security review completed

---

## Issue Resolution

**GitHub Issue:** #1650 - Input sanitization and length limits for the Vakil Friend Chat

**Changes Made:**
1. ✅ Backend: Added `@Size(max=2000)` validation to `ChatMessageRequest`
2. ✅ Backend: Added XSS sanitization in `VakilFriendService`
3. ✅ Frontend: Added character counter with real-time display
4. ✅ Frontend: Added input validation with error messages
5. ✅ Frontend: Enhanced Send button state management
6. ✅ Frontend: Added client-side sanitization
7. ✅ Security: Protection against XSS, HTML injection, JavaScript injection
8. ✅ UX: Clear visual feedback for users
9. ✅ Compatibility: Preserves Indian languages, emojis, and normal punctuation

**Files Modified:**
- `backend/nyaysetu-backend/src/main/java/com/nyaysetu/backend/dto/ChatMessageRequest.java`
- `backend/nyaysetu-backend/src/main/java/com/nyaysetu/backend/service/VakilFriendService.java`
- `frontend/nyaysetu-frontend/src/pages/litigant/VakilFriendPage.jsx`

---

## Contact

For questions or issues related to this implementation, please refer to GitHub Issue #1650.
