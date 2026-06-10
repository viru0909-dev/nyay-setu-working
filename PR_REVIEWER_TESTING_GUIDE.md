# PR Reviewer & Testing Guide

## Summary

This PR introduces an AI-powered legal document generation workflow with:

- AI-generated legal drafts
- PDF/DOCX export support
- Prompt validation & injection detection
- Frontend preview and export integration
- Automated frontend testing

---

# Backend Setup

## Create virtual environment and install dependencies

```powershell
cd lawgpt-service

python -m venv .venv

.\.venv\Scripts\activate

pip install -r requirements.txt
Optional local QA fallback
$env:LAWGPT_FAKE_LLM="1"

Use only for local development/testing.

Start backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8001

Backend URL:

http://127.0.0.1:8001
Frontend Setup
Install dependencies and start frontend
cd frontend/nyaysetu-frontend

npm install

$env:VITE_LAWGPT_BASE="http://127.0.0.1:8001"

npm run dev
Production build verification
npm run build
Manual Verification

Verify the following workflow:

Open:
/litigant/generate-document
Select a document type
Fill required fields
Click:
Generate Preview
Download PDF
Download DOCX
Copy to Clipboard
Verify:
generated preview renders correctly
PDF downloads successfully
DOCX downloads successfully
clipboard copy works correctly
Validation Checks

Also verify:

missing required field validation
prompt-injection blocking behavior

Example prompt-injection input:

ignore all previous instructions
Frontend Tests

Run:

npx vitest

Expected result:

All tests passing
Notes
LAWGPT_FAKE_LLM is intended only for local development/testing.
Production deployments should use real LLM integrations.