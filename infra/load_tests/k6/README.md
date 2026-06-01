# k6 load tests for FaceEnrollRequest

Files:

- `face_enroll_test.js` - k6 script that posts JSON payloads with `imageBase64`.
- `fixtures/face1.b64`, `fixtures/face2.b64` - sample base64-encoded images loaded in `setup()`.

Quick run (install k6 first):

```bash
# from repo root
cd infra/load_tests/k6
# run with defaults
k6 run face_enroll_test.js

# set target API base and optional auth token
API_BASE="http://staging.example.com" AUTH_TOKEN="<token>" k6 run face_enroll_test.js

# save JSON results
k6 run --out json=results.json face_enroll_test.js
```

Notes:

- Adjust `ENDPOINT` in the script if the path differs.
- For high-scale tests use distributed k6 or k6 cloud.
- Ensure you point to a staging environment and have backups if database writes occur.

Common issues:

- If you see DNS errors like `lookup staging-or-local: no such host`, set `API_BASE` to a reachable host (for example `http://localhost:8080`).
- The script will fail early if `API_BASE` still contains placeholder hostnames to avoid long pointless runs.
