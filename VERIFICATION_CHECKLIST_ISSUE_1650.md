# Verification Checklist - Issue #1650
## Input Sanitization and Length Limits for Vakil Friend Chat

Use this checklist to verify the implementation is working correctly.

---

## Pre-Deployment Verification

### Code Review Checklist

#### Backend Code
- [ ] `ChatMessageRequest.java` has `@Size(max = 2000)` annotation
- [ ] `ChatMessageRequest.java` has enhanced `@NotBlank` message
- [ ] `VakilFriendService.java` has `sanitizeUserInput()` method
- [ ] `sanitizeUserInput()` is called in `chat()` method before processing
- [ ] Sanitization also applied to transcribed audio input
- [ ] Method is marked `private` (not exposed)
- [ ] All regex patterns are correct and tested
- [ ] Unicode preservation is confirmed

#### Frontend Code
- [ ] `VakilFriendPage.jsx` has `MAX_MESSAGE_LENGTH = 2000` constant
- [ ] `validationError` state variable added
- [ ] `sanitizeInput()` function exists and is complete
- [ ] `validateMessage()` function exists and is correct
- [ ] `handleInputChange()` function exists and updates state properly
- [ ] `sendMessage()` calls validation before sending
- [ ] `sendMessage()` calls sanitization before sending
- [ ] Textarea has character counter display
- [ ] Character counter shows correct colors (gray/orange/red)
- [ ] Validation error message displays below input
- [ ] Send button disabled state includes all validation checks
- [ ] Input field border changes color on validation error

#### Documentation
- [ ] `IMPLEMENTATION_SUMMARY_ISSUE_1650.md` created
- [ ] `VAKIL_FRIEND_INPUT_VALIDATION_TEST_GUIDE.md` created
- [ ] `QUICK_REFERENCE_ISSUE_1650.md` created
- [ ] `DATA_FLOW_DIAGRAM_ISSUE_1650.md` created
- [ ] `ISSUE_1650_COMPLETED.md` created
- [ ] All documentation is accurate and complete

---

## Functional Testing

### Basic Validation Tests

#### Test 1: Empty Message
- [ ] Open Vakil Friend Chat
- [ ] Leave input field empty
- [ ] Observe Send button is disabled (grayed out)
- [ ] Try clicking Send button - nothing happens
- [ ] **Result:** PASS / FAIL

#### Test 2: Whitespace-Only Message
- [ ] Type only spaces: `     `
- [ ] Observe Send button is disabled
- [ ] Try clicking Send button - nothing happens
- [ ] **Result:** PASS / FAIL

#### Test 3: Normal Message
- [ ] Type: "I need help with a property dispute"
- [ ] Character counter shows: "36 / 2000" (or similar)
- [ ] Counter is gray color
- [ ] Send button is enabled (blue)
- [ ] Click Send button
- [ ] Message sent successfully
- [ ] Input field cleared
- [ ] AI response received
- [ ] **Result:** PASS / FAIL

#### Test 4: Message at Maximum Limit (2000 chars)
- [ ] Paste a 2000-character message (generate one online)
- [ ] Character counter shows: "2000 / 2000"
- [ ] Counter is orange/warning color
- [ ] Send button is still enabled
- [ ] Click Send button
- [ ] Message sent successfully
- [ ] **Result:** PASS / FAIL

#### Test 5: Message Over Maximum Limit
- [ ] Paste a 2100-character message
- [ ] Character counter shows: "2100 / 2000" in RED
- [ ] Validation error displayed: "⚠️ Message exceeds 2000 characters"
- [ ] Input field border turns RED
- [ ] Send button is disabled
- [ ] Cannot send message
- [ ] **Result:** PASS / FAIL

---

### XSS Protection Tests

#### Test 6: Script Tag Injection
- [ ] Type: `<script>alert('XSS')</script>Hello`
- [ ] Send the message
- [ ] No alert box appears
- [ ] Message stored without script tag
- [ ] Check browser console - no errors
- [ ] **Result:** PASS / FAIL

#### Test 7: Event Handler Injection
- [ ] Type: `<img src=x onerror="alert('XSS')">`
- [ ] Send the message
- [ ] No alert box appears
- [ ] Message sanitized
- [ ] Check browser console - no errors
- [ ] **Result:** PASS / FAIL

#### Test 8: JavaScript Protocol
- [ ] Type: `<a href="javascript:alert('XSS')">Click</a>`
- [ ] Send the message
- [ ] No alert box appears
- [ ] Message sanitized
- [ ] **Result:** PASS / FAIL

#### Test 9: iframe Injection
- [ ] Type: `<iframe src="javascript:alert('XSS')"></iframe>Test`
- [ ] Send the message
- [ ] No iframe rendered
- [ ] No alert box appears
- [ ] Message sanitized to "Test"
- [ ] **Result:** PASS / FAIL

#### Test 10: Data URI Attack
- [ ] Type: `<object data="data:text/html,<script>alert('XSS')</script>">Test</object>`
- [ ] Send the message
- [ ] No script execution
- [ ] Message sanitized
- [ ] **Result:** PASS / FAIL

---

### Content Preservation Tests

#### Test 11: HTML-like Legitimate Text
- [ ] Type: `My rent is <5000 and income >20000`
- [ ] Send the message
- [ ] Message sent successfully
- [ ] Content escaped: `&lt;5000` and `&gt;20000`
- [ ] Displayed correctly in chat
- [ ] **Result:** PASS / FAIL

#### Test 12: Hindi Language
- [ ] Type: `मुझे कानूनी मदद चाहिए`
- [ ] Character counter accurate
- [ ] Send the message
- [ ] Hindi text preserved completely
- [ ] AI responds appropriately
- [ ] **Result:** PASS / FAIL

#### Test 13: Marathi Language
- [ ] Type: `मला कायदेशीर मदत हवी`
- [ ] Send the message
- [ ] Marathi text preserved
- [ ] **Result:** PASS / FAIL

#### Test 14: Tamil Language
- [ ] Type: `எனக்கு சட்ட உதவி வேண்டும்`
- [ ] Send the message
- [ ] Tamil text preserved
- [ ] **Result:** PASS / FAIL

#### Test 15: Emojis and Special Characters
- [ ] Type: `🙏 Namaste! I need help 👨‍⚖️ with ₹50,000`
- [ ] Emojis display in input field
- [ ] Character counter accurate
- [ ] Send the message
- [ ] All emojis and ₹ symbol preserved
- [ ] **Result:** PASS / FAIL

#### Test 16: Mixed Content
- [ ] Type: `Case filed on 15/08/2023. Respondent: Mr. X. Evidence: Photos, documents. Urgency: URGENT!`
- [ ] Send the message
- [ ] All punctuation preserved
- [ ] Dates preserved
- [ ] AI understands context
- [ ] **Result:** PASS / FAIL

---

### UI/UX Tests

#### Test 17: Character Counter Real-time Update
- [ ] Start with empty input
- [ ] Type slowly: "Hello"
- [ ] Counter updates with each keystroke: 1, 2, 3, 4, 5
- [ ] Counter is gray color
- [ ] Type more until reaching 1800 characters
- [ ] Counter turns orange at 1800
- [ ] Type more until exceeding 2000
- [ ] Counter turns red at 2001
- [ ] **Result:** PASS / FAIL

#### Test 18: Validation Error Message Display
- [ ] Paste a 2100-character message
- [ ] Error message appears below input: "⚠️ Message exceeds 2000 characters"
- [ ] Error message is red color
- [ ] Start deleting characters
- [ ] When reaching 2000 or less, error disappears
- [ ] **Result:** PASS / FAIL

#### Test 19: Send Button State Changes
- [ ] Input is empty → Button is disabled (gray)
- [ ] Type "Hello" → Button is enabled (blue)
- [ ] Delete all text → Button is disabled again
- [ ] Type 2001 characters → Button is disabled
- [ ] Delete to 2000 → Button is enabled
- [ ] **Result:** PASS / FAIL

#### Test 20: Input Field Border Color
- [ ] Default state → Border is gray
- [ ] Click into input (focus) → Border turns blue
- [ ] Type 2001 characters → Border turns red
- [ ] Delete to 2000 → Border returns to blue (if focused) or gray
- [ ] **Result:** PASS / FAIL

---

### Integration Tests

#### Test 21: Voice Input Integration
- [ ] Click microphone button
- [ ] Speak: "I need legal help"
- [ ] Stop recording
- [ ] Message transcribed
- [ ] If transcription > 2000 chars, validation applies
- [ ] Sanitization applied to transcribed text
- [ ] Message sent successfully
- [ ] **Result:** PASS / FAIL

#### Test 22: OCR Integration
- [ ] Click "Scan Historical Document" button
- [ ] Upload a document image
- [ ] OCR extracts text
- [ ] Type a question about the document
- [ ] Validation applies to question, not OCR context
- [ ] Message sent with OCR context
- [ ] AI responds with document context
- [ ] **Result:** PASS / FAIL

#### Test 23: Session Management
- [ ] Start a new chat session
- [ ] Send a validated message
- [ ] Reload the page
- [ ] Load session history
- [ ] Previous messages displayed correctly
- [ ] Sanitized content preserved
- [ ] **Result:** PASS / FAIL

#### Test 24: Rate Limiting
- [ ] Send 20 messages rapidly
- [ ] 21st message triggers rate limit
- [ ] Error message: "⏳ You've sent too many messages..."
- [ ] Send button shows countdown timer
- [ ] Wait for cooldown to expire
- [ ] Can send messages again
- [ ] Validation still works after rate limit
- [ ] **Result:** PASS / FAIL

#### Test 25: Multi-language Translation
- [ ] Select Hindi language
- [ ] Type Hindi message
- [ ] Validation works with Hindi text
- [ ] Send message
- [ ] AI responds in Hindi
- [ ] Switch back to English
- [ ] Validation still works
- [ ] **Result:** PASS / FAIL

---

### Backend API Tests

#### Test 26: Direct API - Valid Message
- [ ] Use Postman/curl
- [ ] POST `/api/v1/vakil-friend/chat/{sessionId}`
- [ ] Body: `{"message": "I need help", "language": "en"}`
- [ ] Response: 200 OK
- [ ] Response contains AI message
- [ ] **Result:** PASS / FAIL

#### Test 27: Direct API - Empty Message
- [ ] POST with body: `{"message": "", "language": "en"}`
- [ ] Response: 400 Bad Request
- [ ] Error message: "Message cannot be empty or contain only whitespace"
- [ ] **Result:** PASS / FAIL

#### Test 28: Direct API - Whitespace Message
- [ ] POST with body: `{"message": "   ", "language": "en"}`
- [ ] Response: 400 Bad Request
- [ ] Error message: "Message cannot be empty or contain only whitespace"
- [ ] **Result:** PASS / FAIL

#### Test 29: Direct API - Oversized Message
- [ ] POST with 2001-character message
- [ ] Response: 400 Bad Request
- [ ] Error message: "Message must not exceed 2000 characters"
- [ ] **Result:** PASS / FAIL

#### Test 30: Direct API - XSS Attempt
- [ ] POST with: `{"message": "<script>alert('XSS')</script>Hello", "language": "en"}`
- [ ] Response: 200 OK (sanitization happens, doesn't reject)
- [ ] Check database - script tag removed
- [ ] Message stored as "Hello" or with escaped characters
- [ ] **Result:** PASS / FAIL

---

### Security Tests

#### Test 31: Multiple XSS Vectors
- [ ] Test all these inputs (one at a time):
  - `<script>alert(1)</script>`
  - `<img src=x onerror=alert(1)>`
  - `<svg onload=alert(1)>`
  - `<body onload=alert(1)>`
  - `<iframe src="javascript:alert(1)">`
  - `<object data="javascript:alert(1)">`
  - `<embed src="javascript:alert(1)">`
- [ ] None execute JavaScript
- [ ] All are sanitized
- [ ] No console errors
- [ ] **Result:** PASS / FAIL

#### Test 32: Nested XSS Attempts
- [ ] Type: `<script><script>alert(1)</script></script>`
- [ ] Send message
- [ ] All script tags removed
- [ ] No execution
- [ ] **Result:** PASS / FAIL

#### Test 33: HTML Entity Bypass Attempt
- [ ] Type: `&lt;script&gt;alert(1)&lt;/script&gt;`
- [ ] Send message
- [ ] Stored safely
- [ ] No execution when displayed
- [ ] **Result:** PASS / FAIL

---

### Regression Tests

#### Test 34: Existing Features Still Work
- [ ] Session creation works
- [ ] Session history loads
- [ ] Document upload works
- [ ] OCR scanning works
- [ ] Voice input works
- [ ] Multi-language support works
- [ ] AI responses are correct
- [ ] Case filing completion works
- [ ] Deep research feature works
- [ ] 3D Avatar works (if enabled)
- [ ] Case diary logging works
- [ ] **Result:** PASS / FAIL

---

### Performance Tests

#### Test 35: Validation Performance
- [ ] Open browser dev tools
- [ ] Go to Performance tab
- [ ] Start recording
- [ ] Type a long message (1000+ characters)
- [ ] Stop recording
- [ ] Check validation function timing
- [ ] Should be < 1ms per keystroke
- [ ] **Result:** PASS / FAIL

#### Test 36: Message Send Performance
- [ ] Send a 2000-character message
- [ ] Measure time from click to response
- [ ] Should be similar to before (1-3 seconds)
- [ ] No significant slowdown
- [ ] **Result:** PASS / FAIL

---

### Browser Compatibility

#### Test 37: Chrome/Edge
- [ ] All validation tests pass
- [ ] Character counter displays correctly
- [ ] Colors display correctly
- [ ] **Result:** PASS / FAIL

#### Test 38: Firefox
- [ ] All validation tests pass
- [ ] Character counter displays correctly
- [ ] Colors display correctly
- [ ] **Result:** PASS / FAIL

#### Test 39: Safari (if available)
- [ ] All validation tests pass
- [ ] Character counter displays correctly
- [ ] Colors display correctly
- [ ] **Result:** PASS / FAIL

#### Test 40: Mobile Browser
- [ ] Open on mobile device
- [ ] Character counter visible
- [ ] Validation works
- [ ] Touch interactions work
- [ ] **Result:** PASS / FAIL

---

## Final Checklist

### Code Quality
- [ ] No console errors in browser
- [ ] No backend exceptions in logs
- [ ] Code follows project conventions
- [ ] No unused variables or imports
- [ ] Proper error handling

### Security
- [ ] XSS protection verified
- [ ] Input validation enforced
- [ ] Sanitization working
- [ ] No security warnings in audit

### User Experience
- [ ] Clear visual feedback
- [ ] Intuitive error messages
- [ ] Smooth interactions
- [ ] No confusing behavior

### Documentation
- [ ] All documentation files created
- [ ] Code comments added where needed
- [ ] README updated (if needed)
- [ ] Test guide available

### Testing
- [ ] All manual tests completed
- [ ] All API tests completed
- [ ] All security tests completed
- [ ] All regression tests completed

### Deployment Ready
- [ ] Code reviewed
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Security approved
- [ ] Stakeholder approval obtained

---

## Test Results Summary

| Category | Total Tests | Passed | Failed | Pass Rate |
|----------|-------------|--------|--------|-----------|
| Basic Validation | 5 | ___ | ___ | ___% |
| XSS Protection | 5 | ___ | ___ | ___% |
| Content Preservation | 6 | ___ | ___ | ___% |
| UI/UX | 4 | ___ | ___ | ___% |
| Integration | 5 | ___ | ___ | ___% |
| Backend API | 5 | ___ | ___ | ___% |
| Security | 3 | ___ | ___ | ___% |
| Regression | 1 | ___ | ___ | ___% |
| Performance | 2 | ___ | ___ | ___% |
| Browser Compatibility | 4 | ___ | ___ | ___% |
| **TOTAL** | **40** | ___ | ___ | ___% |

---

## Sign-off

### Tested By
- **Name:** ________________
- **Role:** ________________
- **Date:** ________________
- **Signature:** ________________

### Reviewed By
- **Name:** ________________
- **Role:** ________________
- **Date:** ________________
- **Signature:** ________________

### Approved By
- **Name:** ________________
- **Role:** ________________
- **Date:** ________________
- **Signature:** ________________

---

## Notes
_Use this space for any observations, issues, or recommendations:_

---

**Status:** ☐ READY FOR PRODUCTION | ☐ NEEDS REVISION  
**Issue:** #1650  
**Project:** Nyay Setu
