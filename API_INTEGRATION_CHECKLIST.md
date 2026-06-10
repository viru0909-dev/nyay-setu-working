# API Integration Checklist for Contributors

## Pre-Integration

- [ ] **Review API Documentation**
  - [ ] Read `openapi.yaml` for complete API specification
  - [ ] Check `API_ENDPOINTS_COMPREHENSIVE.md` for detailed endpoint descriptions
  - [ ] Review `API_QUICK_REFERENCE.md` for quick lookups
  - [ ] Read `API_TESTING_GUIDE.md` for testing instructions

- [ ] **Setup Development Environment**
  - [ ] Clone repository: `git clone [repo-url]`
  - [ ] Install dependencies: `npm install`, `pip install -r requirements.txt`, `mvn install`
  - [ ] Start services: `docker-compose up -d` or individual service starts
  - [ ] Verify all services are running on correct ports
  - [ ] Check health endpoints are accessible

- [ ] **Authentication Setup**
  - [ ] Create test user account via `/auth/register`
  - [ ] Login and save JWT token: `/auth/login`
  - [ ] Store token in environment variable or `.env` file
  - [ ] Test token with a simple API call

## During Development

### API Integration Workflow

- [ ] **Understand the Data Flow**
  - [ ] Map frontend components to API endpoints
  - [ ] Identify request/response data structures
  - [ ] Check authentication requirements
  - [ ] Plan error handling strategy

- [ ] **Test Individual Endpoints**
  - [ ] Use Postman collection for quick testing
  - [ ] Verify request format (body, headers, query params)
  - [ ] Check response status codes
  - [ ] Validate response payload structure

- [ ] **Integration Testing**
  - [ ] Test complete user workflows
  - [ ] Verify data persistence
  - [ ] Check authorization/permissions
  - [ ] Test error scenarios and edge cases

- [ ] **Performance Testing**
  - [ ] Measure API response times
  - [ ] Test with realistic data volumes
  - [ ] Check for N+1 query problems
  - [ ] Validate pagination implementation

## Common Integration Patterns

### Pattern 1: List and Detail View

```
GET /cases                    → List all cases with pagination
GET /cases/{caseId}          → Get specific case
PUT /cases/{caseId}          → Update case
DELETE /cases/{caseId}       → Archive case
```

**Implementation Checklist:**
- [ ] Implement pagination (page, size, sort)
- [ ] Add filters (status, court, date range)
- [ ] Handle empty results gracefully
- [ ] Show loading states during fetch
- [ ] Implement error messages

### Pattern 2: File Upload and Processing

```
POST /documents/upload       → Upload file
GET /documents/{documentId}  → Fetch document metadata
POST /documents/{documentId}/analyze → AI analysis
GET /documents/{documentId}/download  → Download file
```

**Implementation Checklist:**
- [ ] Validate file type and size before upload
- [ ] Show upload progress
- [ ] Handle upload failures with retry
- [ ] Stream file download for large files
- [ ] Display analysis results
- [ ] Cache analysis results

### Pattern 3: Streaming Responses

```
POST /nlp/analyze           → Start analysis with SSE streaming
```

**Implementation Checklist:**
- [ ] Implement EventSource for SSE
- [ ] Handle stream events (progress, result, error)
- [ ] Show real-time progress updates
- [ ] Allow stopping/canceling stream
- [ ] Graceful error handling

### Pattern 4: Blockchain Verification

```
POST /evidence              → Add evidence with blockchain hash
POST /evidence/{id}/verify  → Verify blockchain hash
```

**Implementation Checklist:**
- [ ] Display blockchain hash for verification
- [ ] Provide verification status
- [ ] Show immutability guarantee
- [ ] Handle verification failures

## Testing Scenarios

### Scenario 1: Complete Case Workflow
```
1. Create case
2. Upload documents
3. Add evidence
4. Generate legal documents
5. Schedule hearings
6. Analyze with legal reasoning
```

- [ ] Test with valid data
- [ ] Test with invalid data
- [ ] Test with missing fields
- [ ] Test with edge cases
- [ ] Test with concurrent requests

### Scenario 2: Authorization & Permissions
```
- Lawyer creates case
- Judge reviews and assigns
- Police uploads FIR
- Admin monitors
```

- [ ] Test each role can access allowed endpoints
- [ ] Test each role is denied restricted endpoints
- [ ] Test data isolation (users only see own data)
- [ ] Test admin override capabilities

### Scenario 3: Error Handling
```
- Service unavailable (503)
- Authentication failed (401)
- Not found (404)
- Validation error (400)
- Server error (500)
```

- [ ] Display user-friendly error messages
- [ ] Implement retry logic for transient failures
- [ ] Log errors for debugging
- [ ] Notify support for critical errors

## Code Review Checklist

When reviewing API integration:

- [ ] **Authentication**
  - [ ] Token is properly stored and sent
  - [ ] Token refresh is implemented
  - [ ] Logout clears token
  - [ ] Permission checks are enforced

- [ ] **API Calls**
  - [ ] Using correct HTTP methods
  - [ ] Headers are properly set
  - [ ] Request/response validation
  - [ ] Proper error handling

- [ ] **State Management**
  - [ ] Loading states handled
  - [ ] Error states displayed
  - [ ] Data cached appropriately
  - [ ] No race conditions

- [ ] **Performance**
  - [ ] Pagination implemented
  - [ ] Unnecessary requests eliminated
  - [ ] Response times acceptable
  - [ ] No memory leaks

- [ ] **Security**
  - [ ] No sensitive data in logs
  - [ ] No exposed tokens
  - [ ] Input validation
  - [ ] HTTPS in production

- [ ] **Testing**
  - [ ] Unit tests for API client
  - [ ] Integration tests for workflows
  - [ ] Error scenario tests
  - [ ] Auth tests

## Useful Commands

### Service Management
```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Check service status
docker-compose ps
```

### API Testing
```bash
# Login and save token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' | jq -r '.token')

# Test API with token
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/cases

# Run Postman collection tests
newman run Nyay_Setu_API_Collection.postman_collection.json \
  -e postman_environment.json
```

### Database
```bash
# View logs and initial setup
docker-compose logs db

# Access database shell (if PostgreSQL)
docker-compose exec db psql -U [username] -d [database]
```

## Documentation to Update

When integrating a new endpoint or feature:

- [ ] Add endpoint to `openapi.yaml`
- [ ] Add example to `Nyay_Setu_API_Collection.postman_collection.json`
- [ ] Update `API_ENDPOINTS_COMPREHENSIVE.md` with details
- [ ] Add code example to `API_TESTING_GUIDE.md`
- [ ] Update component/service documentation
- [ ] Add changelog entry to `CHANGELOG.md`

## Testing Tools & Resources

- **Postman:** API testing and documentation
  - Import: `Nyay_Setu_API_Collection.postman_collection.json`
  - Run tests: `newman run [collection] -e [environment]`

- **cURL:** Command-line API testing
  - Simple requests: `curl -X GET [url]`
  - With headers: `curl -H "Authorization: Bearer $TOKEN" [url]`

- **VS Code Extensions:**
  - Thunder Client (REST client)
  - REST Client (markdown-based)
  - OpenAPI (Swagger) Viewer

- **Online Tools:**
  - Swagger Editor: https://editor.swagger.io
  - Postman Cloud: https://www.postman.com/api-platform/
  - RequestBin: https://requestbin.com (webhook testing)

## Helpful Links

- OpenAPI Specification: https://spec.openapis.org/oas/v3.0.0
- REST API Best Practices: https://restfulapi.net/
- HTTP Status Codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- JWT Tokens: https://jwt.io/
- Postman Docs: https://learning.postman.com/docs/

## Support & Escalation

### Getting Help

1. **Check Documentation First**
   - API_TESTING_GUIDE.md
   - API_ENDPOINTS_COMPREHENSIVE.md
   - openapi.yaml

2. **Try Postman Collection**
   - Import and run example requests
   - Check response format

3. **Review Service Logs**
   - `docker-compose logs [service]`
   - Check for error messages

4. **Search Issues**
   - GitHub issues: https://github.com/[repo]/issues
   - Look for similar problems

5. **Ask in Discussions**
   - GitHub Discussions
   - Slack/Chat channel
   - Community forum

6. **Contact Team**
   - Email: dev@nyaysetu.in
   - Create GitHub issue with:
     - Problem description
     - Steps to reproduce
     - Expected vs actual behavior
     - Error logs/screenshots

## Approval Criteria

Before merging API integration:

- [ ] All endpoints tested (happy path + error cases)
- [ ] Authentication/authorization verified
- [ ] Documentation complete and accurate
- [ ] Code reviewed by maintainer
- [ ] Performance acceptable
- [ ] No security vulnerabilities
- [ ] Tests passing (unit + integration)
- [ ] No breaking changes to existing APIs
