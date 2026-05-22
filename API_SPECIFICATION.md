# Virtual Lawyer Consultation - API Specification & Stripe Webhook Handling

## Overview
Complete REST API specification for the Virtual Lawyer Consultation System including endpoint definitions, request/response schemas, and Stripe webhook integration.

---

## API Base URL

```
Development: http://localhost:8080/api
Production: https://api.nyaysetu.com/api
```

---

## Authentication

All endpoints (except login/register) require Bearer token authentication.

```
Authorization: Bearer {JWT_TOKEN}
```

---

## SECTION 1: LAWYER MANAGEMENT ENDPOINTS

### 1.1 Get All Lawyers

**Endpoint**: `GET /lawyers`

**Query Parameters**:
```
- specialization (optional): string - Filter by specialization
- minRating (optional): number - Minimum rating (0-5)
- maxFee (optional): number - Maximum hourly fee
- page (optional): number - Page number (default: 1)
- pageSize (optional): number - Items per page (default: 10)
```

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "userId": 101,
      "specialization": "Criminal Law",
      "experienceYears": 15,
      "bio": "Experienced criminal defense attorney",
      "qualification": "LLM from Harvard Law",
      "verificationStatus": "VERIFIED",
      "hourlyRate": 150.00,
      "rating": 4.8,
      "totalConsultations": 145,
      "isActive": true,
      "profileImageUrl": "https://...",
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-05-20T15:45:00Z"
    }
  ],
  "totalElements": 45,
  "totalPages": 5,
  "currentPage": 1,
  "pageSize": 10
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Invalid query parameters",
  "details": "maxFee must be greater than 0"
}
```

---

### 1.2 Get Lawyer Details

**Endpoint**: `GET /lawyers/{id}`

**Path Parameters**:
- `id` (required): number - Lawyer ID

**Response** (200 OK):
```json
{
  "id": 1,
  "userId": 101,
  "specialization": "Criminal Law",
  "experienceYears": 15,
  "bio": "Experienced criminal defense attorney",
  "qualification": "LLM from Harvard Law",
  "verificationStatus": "VERIFIED",
  "hourlyRate": 150.00,
  "rating": 4.8,
  "totalConsultations": 145,
  "isActive": true,
  "profileImageUrl": "https://...",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-05-20T15:45:00Z",
  "expertiseAreas": [
    {
      "id": 1,
      "expertiseArea": "White Collar Crime",
      "yearsInArea": 10
    },
    {
      "id": 2,
      "expertiseArea": "DUI Defense",
      "yearsInArea": 8
    }
  ],
  "availability": [
    {
      "id": 1,
      "dayOfWeek": 1,
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    }
  ],
  "averageRating": 4.8,
  "reviewCount": 28
}
```

**Error** (404 Not Found):
```json
{
  "error": "Lawyer not found",
  "id": 1
}
```

---

### 1.3 Get Lawyer Availability

**Endpoint**: `GET /lawyers/{id}/availability`

**Path Parameters**:
- `id` (required): number - Lawyer ID

**Query Parameters**:
- `date` (optional): string (YYYY-MM-DD) - Specific date
- `startDate` (optional): string (YYYY-MM-DD)
- `endDate` (optional): string (YYYY-MM-DD)

**Response** (200 OK):
```json
{
  "lawyerId": 1,
  "availability": [
    {
      "date": "2026-05-25",
      "dayOfWeek": 1,
      "slots": [
        {
          "time": "09:00",
          "isAvailable": true
        },
        {
          "time": "10:00",
          "isAvailable": true
        },
        {
          "time": "11:00",
          "isAvailable": false,
          "reason": "Booked"
        }
      ]
    }
  ]
}
```

---

### 1.4 Get Lawyer Reviews

**Endpoint**: `GET /lawyers/{id}/reviews`

**Path Parameters**:
- `id` (required): number - Lawyer ID

**Query Parameters**:
- `sortBy` (optional): string - "recent" | "rating" (default: "recent")
- `page` (optional): number

**Response** (200 OK):
```json
{
  "lawyerId": 1,
  "averageRating": 4.8,
  "totalReviews": 28,
  "reviews": [
    {
      "id": 1,
      "userId": 201,
      "rating": 5,
      "reviewText": "Excellent lawyer! Very professional and knowledgeable.",
      "isVerifiedConsultation": true,
      "createdAt": "2026-05-20T10:30:00Z"
    }
  ]
}
```

---

### 1.5 Register as Lawyer

**Endpoint**: `POST /lawyers`

**Request Headers**:
```
Authorization: Bearer {ADMIN_OR_VERIFIED_USER_TOKEN}
Content-Type: application/json
```

**Request Body**:
```json
{
  "userId": 101,
  "specialization": "Criminal Law",
  "experienceYears": 15,
  "bio": "Experienced criminal defense attorney",
  "qualification": "LLM from Harvard Law",
  "hourlyRate": 150.00,
  "profileImageUrl": "https://..."
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "userId": 101,
  "specialization": "Criminal Law",
  "verificationStatus": "PENDING",
  "hourlyRate": 150.00,
  "createdAt": "2026-05-22T10:30:00Z"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Invalid registration data",
  "fields": {
    "hourlyRate": "Must be greater than 0",
    "specialization": "Required field"
  }
}
```

---

### 1.6 Update Lawyer Profile

**Endpoint**: `PUT /lawyers/{id}`

**Request Body**:
```json
{
  "bio": "Updated bio",
  "hourlyRate": 175.00,
  "profileImageUrl": "https://..."
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "bio": "Updated bio",
  "hourlyRate": 175.00,
  "updatedAt": "2026-05-22T14:30:00Z"
}
```

---

## SECTION 2: CONSULTATION BOOKING ENDPOINTS

### 2.1 Get Available Slots

**Endpoint**: `GET /consultations/available-slots`

**Query Parameters**:
- `lawyerId` (required): number - Lawyer ID
- `date` (required): string (YYYY-MM-DD) - Date to check availability

**Response** (200 OK):
```json
{
  "lawyerId": 1,
  "date": "2026-05-25",
  "availableSlots": [
    {
      "time": "09:00:00",
      "duration": 60
    },
    {
      "time": "10:00:00",
      "duration": 60
    },
    {
      "time": "14:00:00",
      "duration": 60
    }
  ]
}
```

**Error** (400 Bad Request):
```json
{
  "error": "No availability on this date",
  "lawyerId": 1,
  "date": "2026-05-25"
}
```

---

### 2.2 Create Consultation Booking

**Endpoint**: `POST /consultations`

**Request Body**:
```json
{
  "lawyerId": 1,
  "scheduledDate": "2026-05-25",
  "scheduledTime": "14:00",
  "consultationType": "VIDEO",
  "caseDescription": "Need advice on contract review and negotiation strategy"
}
```

**Response** (201 Created):
```json
{
  "id": 42,
  "userId": 201,
  "lawyerId": 1,
  "scheduledDate": "2026-05-25",
  "scheduledTime": "14:00:00",
  "consultationType": "VIDEO",
  "status": "PENDING_PAYMENT",
  "caseDescription": "Need advice on contract review and negotiation strategy",
  "durationMinutes": 60,
  "createdAt": "2026-05-22T10:30:00Z"
}
```

**Error** (409 Conflict):
```json
{
  "error": "Slot is no longer available",
  "suggestion": "Please select another time slot"
}
```

---

### 2.3 Get User's Consultations

**Endpoint**: `GET /consultations`

**Query Parameters**:
- `status` (optional): string - "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
- `sortBy` (optional): string - "date" | "recent"
- `page` (optional): number

**Response** (200 OK):
```json
{
  "consultations": [
    {
      "id": 42,
      "lawyerId": 1,
      "lawyerName": "John Doe",
      "lawyerSpecialization": "Criminal Law",
      "scheduledDate": "2026-05-25",
      "scheduledTime": "14:00:00",
      "consultationType": "VIDEO",
      "status": "CONFIRMED",
      "caseDescription": "Contract review",
      "payment": {
        "id": 100,
        "amount": 150.00,
        "status": "COMPLETED"
      },
      "createdAt": "2026-05-22T10:30:00Z"
    }
  ],
  "totalElements": 5,
  "currentPage": 1
}
```

---

### 2.4 Get Consultation Details

**Endpoint**: `GET /consultations/{id}`

**Path Parameters**:
- `id` (required): number - Consultation ID

**Response** (200 OK):
```json
{
  "id": 42,
  "userId": 201,
  "lawyerId": 1,
  "lawyerDetails": {
    "id": 1,
    "name": "John Doe",
    "specialization": "Criminal Law",
    "profileImageUrl": "https://..."
  },
  "scheduledDate": "2026-05-25",
  "scheduledTime": "14:00:00",
  "consultationType": "VIDEO",
  "durationMinutes": 60,
  "status": "CONFIRMED",
  "caseDescription": "Contract review and negotiation",
  "meetingLink": "https://meeting.nyaysetu.com/consultation/42",
  "payment": {
    "id": 100,
    "amount": 150.00,
    "status": "COMPLETED"
  },
  "notes": "Initial consultation",
  "createdAt": "2026-05-22T10:30:00Z"
}
```

---

### 2.5 Reschedule Consultation

**Endpoint**: `PUT /consultations/{id}/reschedule`

**Request Body**:
```json
{
  "newDate": "2026-05-26",
  "newTime": "15:00"
}
```

**Response** (200 OK):
```json
{
  "id": 42,
  "scheduledDate": "2026-05-26",
  "scheduledTime": "15:00:00",
  "status": "CONFIRMED",
  "updatedAt": "2026-05-22T11:00:00Z"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Cannot reschedule within 24 hours of consultation",
  "scheduledTime": "2026-05-25T14:00:00Z"
}
```

---

### 2.6 Cancel Consultation

**Endpoint**: `POST /consultations/{id}/cancel`

**Request Body**:
```json
{
  "reason": "Schedule conflict"
}
```

**Response** (200 OK):
```json
{
  "id": 42,
  "status": "CANCELLED",
  "cancelReason": "Schedule conflict",
  "refundStatus": "PROCESSING",
  "updatedAt": "2026-05-22T11:30:00Z"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Cannot cancel consultation within 2 hours of scheduled time",
  "scheduledTime": "2026-05-25T14:00:00Z"
}
```

---

### 2.7 Get Meeting Link

**Endpoint**: `GET /consultations/{id}/meeting-link`

**Response** (200 OK):
```json
{
  "consultationId": 42,
  "meetingLink": "https://meeting.nyaysetu.com/consultation/42?token=xyz123",
  "expiresAt": "2026-05-25T15:00:00Z",
  "status": "ACTIVE"
}
```

---

## SECTION 3: PAYMENT ENDPOINTS

### 3.1 Create Payment Intent

**Endpoint**: `POST /payments/create-intent`

**Request Body**:
```json
{
  "consultationId": 42,
  "amount": 150.00,
  "userId": 201
}
```

**Response** (201 Created):
```json
{
  "paymentId": 100,
  "consultationId": 42,
  "clientSecret": "pi_1234567890_secret_abcdefghij",
  "intentId": "pi_1234567890",
  "amount": 150.00,
  "currency": "USD",
  "status": "requires_payment_method"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Consultation already has a payment",
  "consultationId": 42,
  "existingPaymentId": 100
}
```

---

### 3.2 Confirm Payment

**Endpoint**: `POST /payments/confirm`

**Request Body**:
```json
{
  "intentId": "pi_1234567890"
}
```

**Response** (200 OK):
```json
{
  "paymentId": 100,
  "intentId": "pi_1234567890",
  "status": "COMPLETED",
  "amount": 150.00,
  "chargeId": "ch_1234567890",
  "confirmationTime": "2026-05-22T11:45:00Z"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Payment confirmation failed",
  "intentId": "pi_1234567890",
  "reason": "Payment intent not found"
}
```

---

### 3.3 Request Refund

**Endpoint**: `POST /payments/{id}/refund`

**Request Body**:
```json
{
  "reason": "User requested cancellation"
}
```

**Response** (200 OK):
```json
{
  "paymentId": 100,
  "refundId": "re_1234567890",
  "amount": 150.00,
  "reason": "User requested cancellation",
  "status": "PROCESSING",
  "estimatedArrival": "2026-05-29"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Cannot refund payment",
  "reason": "Payment is not in COMPLETED status",
  "currentStatus": "PENDING"
}
```

---

### 3.4 Get Payment Details

**Endpoint**: `GET /payments/{id}`

**Response** (200 OK):
```json
{
  "id": 100,
  "consultationId": 42,
  "amount": 150.00,
  "currency": "USD",
  "status": "COMPLETED",
  "stripePaymentIntentId": "pi_1234567890",
  "stripeChargeId": "ch_1234567890",
  "paymentMethod": "CARD",
  "invoice": {
    "id": 1,
    "invoiceNumber": "INV-2026-00001",
    "pdfUrl": "https://...",
    "status": "PAID"
  },
  "createdAt": "2026-05-22T11:40:00Z"
}
```

---

### 3.5 Download Invoice

**Endpoint**: `GET /invoices/{id}`

**Response** (200 OK):
- Returns PDF file with proper headers
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="invoice.pdf"

**Error** (404 Not Found):
```json
{
  "error": "Invoice not found",
  "id": 1
}
```

---

### 3.6 Get Payment History

**Endpoint**: `GET /payments/history/{userId}`

**Query Parameters**:
- `startDate` (optional): string (YYYY-MM-DD)
- `endDate` (optional): string (YYYY-MM-DD)
- `status` (optional): string - "COMPLETED" | "REFUNDED" | "FAILED"
- `page` (optional): number

**Response** (200 OK):
```json
{
  "userId": 201,
  "payments": [
    {
      "id": 100,
      "consultationId": 42,
      "lawyerName": "John Doe",
      "amount": 150.00,
      "status": "COMPLETED",
      "createdAt": "2026-05-22T11:40:00Z"
    }
  ],
  "totalAmount": 450.00,
  "totalPages": 1
}
```

---

## SECTION 4: STRIPE WEBHOOK ENDPOINTS

### 4.1 Stripe Webhook Handler

**Endpoint**: `POST /webhooks/stripe`

**Headers Required**:
- `Stripe-Signature`: Webhook signature for verification

**Supported Events**:

#### 4.1.1 payment_intent.succeeded

```json
{
  "id": "evt_1234567890",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "status": "succeeded",
      "metadata": {
        "consultationId": "42",
        "userId": "201"
      }
    }
  }
}
```

**Handler Actions**:
1. Update payment status to `COMPLETED`
2. Update consultation status to `CONFIRMED`
3. Generate invoice
4. Send confirmation email
5. Create meeting link
6. Send notification to lawyer

---

#### 4.1.2 payment_intent.payment_failed

```json
{
  "id": "evt_1234567891",
  "type": "payment_intent.payment_failed",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "status": "requires_payment_method",
      "last_payment_error": {
        "message": "Card declined"
      },
      "metadata": {
        "consultationId": "42",
        "userId": "201"
      }
    }
  }
}
```

**Handler Actions**:
1. Update payment status to `FAILED`
2. Update consultation status to `PAYMENT_FAILED`
3. Send error notification to user
4. Allow retry

---

#### 4.1.3 charge.refunded

```json
{
  "id": "evt_1234567892",
  "type": "charge.refunded",
  "data": {
    "object": {
      "id": "ch_1234567890",
      "refunded": true,
      "refunds": {
        "data": [
          {
            "id": "re_1234567890",
            "amount": 15000
          }
        ]
      }
    }
  }
}
```

**Handler Actions**:
1. Update payment refund status to `FULL` or `PARTIAL`
2. Update consultation status to `REFUNDED`
3. Send refund confirmation email
4. Update records

---

#### 4.1.4 charge.dispute.created

```json
{
  "id": "evt_1234567893",
  "type": "charge.dispute.created",
  "data": {
    "object": {
      "id": "dp_1234567890",
      "charge": "ch_1234567890",
      "reason": "fraudulent"
    }
  }
}
```

**Handler Actions**:
1. Flag payment for review
2. Notify admin
3. Log dispute details
4. Send notification to both parties

---

### 4.2 Webhook Response

**Response** (200 OK):
```json
{
  "success": true,
  "eventId": "evt_1234567890"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Invalid webhook signature",
  "message": "Signature verification failed"
}
```

---

## SECTION 5: ERROR HANDLING

### Standard Error Response Format

```json
{
  "error": "Error title",
  "message": "Detailed error message",
  "statusCode": 400,
  "timestamp": "2026-05-22T11:45:00Z",
  "path": "/api/consultations",
  "details": {
    "field": "error_details"
  }
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 500 | Internal Server Error |

---

## SECTION 6: RATE LIMITING

All API endpoints are rate-limited:

```
Rate Limit: 100 requests per minute per user
Rate Limit: 1000 requests per minute per IP
```

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1653214500
```

---

## SECTION 7: PAGINATION

All list endpoints support pagination:

**Query Parameters**:
- `page` (optional): number (default: 1)
- `pageSize` (optional): number (default: 10, max: 100)

**Response Format**:
```json
{
  "content": [...],
  "totalElements": 145,
  "totalPages": 15,
  "currentPage": 1,
  "pageSize": 10,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

## SECTION 8: FILTERING & SORTING

### Filtering Examples

```
GET /lawyers?specialization=Criminal%20Law&minRating=4
GET /consultations?status=COMPLETED&sortBy=date
GET /payments/history/201?startDate=2026-01-01&endDate=2026-05-31
```

### Supported Sort Fields

**Lawyers**: `rating`, `hourlyRate`, `experienceYears`, `createdAt`
**Consultations**: `scheduledDate`, `createdAt`, `status`
**Payments**: `amount`, `createdAt`, `status`

---

## SECTION 9: IMPLEMENTATION CHECKLIST

Backend Implementation:
- [ ] Create all API endpoints
- [ ] Implement Stripe integration
- [ ] Set up webhook handlers
- [ ] Add request validation
- [ ] Implement error handling
- [ ] Add logging
- [ ] Create unit tests
- [ ] Create integration tests
- [ ] Document API
- [ ] Deploy

Frontend Implementation:
- [ ] Create API client
- [ ] Build API service layers
- [ ] Implement components
- [ ] Test payment flow
- [ ] Test video consultation
- [ ] Add error handling
- [ ] Add loading states
- [ ] Deploy

---

## SECTION 10: TESTING ENDPOINTS

### Using cURL

```bash
# Get all lawyers
curl -X GET http://localhost:8080/api/lawyers \
  -H "Authorization: Bearer {TOKEN}"

# Create consultation
curl -X POST http://localhost:8080/api/consultations \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "lawyerId": 1,
    "scheduledDate": "2026-05-25",
    "scheduledTime": "14:00",
    "consultationType": "VIDEO",
    "caseDescription": "Contract review"
  }'

# Create payment intent
curl -X POST http://localhost:8080/api/payments/create-intent \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "consultationId": 42,
    "amount": 150.00,
    "userId": 201
  }'
```

### Using Postman

1. Import the collection from `postman_collection.json`
2. Set environment variables
3. Test each endpoint sequentially
4. Verify response schemas

---

## SECTION 11: WEBHOOK TESTING

### Test Webhook Signature

Use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe account
stripe login

# Forward webhooks to local environment
stripe listen --forward-to localhost:8080/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger charge.refunded
```

---

**Version**: 1.0  
**Last Updated**: May 22, 2026  
**Status**: Complete Specification
