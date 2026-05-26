# Virtual Lawyer Consultation System with Stripe Integration
## Implementation Plan & Architecture

**Status**: Planning Phase  
**Last Updated**: May 22, 2026  
**Target Completion**: Phased rollout

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Lawyer Marketplace │ Booking Calendar │ Payment Flow  │   │
│  │  User Dashboard    │ Video Console    │ Case Workspace│   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API + WebSocket
┌──────────────────────────┴──────────────────────────────────────┐
│                    Backend (Spring Boot)                        │
│  ┌─────────────────┬──────────────────┬──────────────────────┐ │
│  │ Lawyer Mgmt API │ Booking System   │ Payment Service     │ │
│  │ Auth/Ratings    │ Availability Mgr │ Stripe Integration  │ │
│  │ Scheduling      │ Notifications    │ Webhook Handlers    │ │
│  └─────────────────┴──────────────────┴──────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────┴────────┐  ┌──────┴──────┐  ┌──────┴──────┐
│  PostgreSQL DB │  │  Stripe API │  │ Signaling   │
│  (Bookings,    │  │  (Payments) │  │ Server      │
│   Lawyers,     │  │             │  │ (WebRTC)    │
│   Payments)    │  │             │  │             │
└────────────────┘  └─────────────┘  └─────────────┘
```

---

## 2. Phase-by-Phase Breakdown

### PHASE 1: Database Schema & Backend Foundation
**Effort**: 2-3 days  
**Priority**: CRITICAL

#### 2.1 Database Schema

**New Tables**:

1. **Lawyers**
   ```sql
   CREATE TABLE lawyers (
     id BIGSERIAL PRIMARY KEY,
     user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
     specialization VARCHAR(100),
     experience_years INT,
     bio TEXT,
     qualification TEXT,
     verification_status VARCHAR(50),
     hourly_rate DECIMAL(10,2),
     rating DECIMAL(3,2),
     total_consultations INT DEFAULT 0,
     is_active BOOLEAN DEFAULT true,
     profile_image_url VARCHAR(500),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Lawyer Expertise Areas**
   ```sql
   CREATE TABLE lawyer_expertise (
     id BIGSERIAL PRIMARY KEY,
     lawyer_id BIGINT NOT NULL REFERENCES lawyers(id),
     expertise_area VARCHAR(100),
     years_in_area INT,
     UNIQUE(lawyer_id, expertise_area)
   );
   ```

3. **Lawyer Availability**
   ```sql
   CREATE TABLE lawyer_availability (
     id BIGSERIAL PRIMARY KEY,
     lawyer_id BIGINT NOT NULL REFERENCES lawyers(id),
     day_of_week INT (0-6),
     start_time TIME,
     end_time TIME,
     is_available BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **Consultations (Bookings)**
   ```sql
   CREATE TABLE consultations (
     id BIGSERIAL PRIMARY KEY,
     user_id BIGINT NOT NULL REFERENCES users(id),
     lawyer_id BIGINT NOT NULL REFERENCES lawyers(id),
     scheduled_date DATE NOT NULL,
     scheduled_time TIME NOT NULL,
     duration_minutes INT DEFAULT 60,
     consultation_type VARCHAR(50), -- VIDEO, AUDIO, CHAT
     status VARCHAR(50), -- PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
     case_description TEXT,
     meeting_link VARCHAR(500),
     case_file_url VARCHAR(500),
     notes TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Payments**
   ```sql
   CREATE TABLE payments (
     id BIGSERIAL PRIMARY KEY,
     consultation_id BIGINT NOT NULL REFERENCES consultations(id),
     user_id BIGINT NOT NULL REFERENCES users(id),
     lawyer_id BIGINT NOT NULL REFERENCES lawyers(id),
     amount DECIMAL(10,2) NOT NULL,
     currency VARCHAR(3) DEFAULT 'USD',
     status VARCHAR(50), -- PENDING, COMPLETED, REFUNDED, FAILED
     stripe_payment_intent_id VARCHAR(255) UNIQUE,
     stripe_charge_id VARCHAR(255) UNIQUE,
     payment_method VARCHAR(50),
     refund_reason VARCHAR(255),
     refund_amount DECIMAL(10,2),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (consultation_id) REFERENCES consultations(id)
   );
   ```

6. **Invoices**
   ```sql
   CREATE TABLE invoices (
     id BIGSERIAL PRIMARY KEY,
     payment_id BIGINT NOT NULL REFERENCES payments(id),
     consultation_id BIGINT NOT NULL REFERENCES consultations(id),
     invoice_number VARCHAR(50) UNIQUE,
     pdf_url VARCHAR(500),
     issued_date TIMESTAMP,
     due_date TIMESTAMP,
     status VARCHAR(50), -- PENDING, PAID, CANCELLED
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

7. **Lawyer Reviews & Ratings**
   ```sql
   CREATE TABLE lawyer_reviews (
     id BIGSERIAL PRIMARY KEY,
     lawyer_id BIGINT NOT NULL REFERENCES lawyers(id),
     user_id BIGINT NOT NULL REFERENCES users(id),
     consultation_id BIGINT NOT NULL REFERENCES consultations(id),
     rating INT CHECK (rating >= 1 AND rating <= 5),
     review_text TEXT,
     is_verified_consultation BOOLEAN,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(lawyer_id, consultation_id)
   );
   ```

**Indexes**:
```sql
CREATE INDEX idx_lawyers_specialization ON lawyers(specialization);
CREATE INDEX idx_consultations_user_lawyer ON consultations(user_id, lawyer_id);
CREATE INDEX idx_consultations_scheduled_date ON consultations(scheduled_date);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
```

---

### PHASE 2: Backend API - Lawyer Management
**Effort**: 2 days  
**Priority**: HIGH

#### 2.2 Spring Boot Models & Entities

Create JPA entities in `backend/nyaysetu-backend/src/main/java/com/nyaysetu/model/`:

```
LawyerProfile.java
LawyerExpertise.java
LawyerAvailability.java
Consultation.java
Payment.java
Invoice.java
LawyerReview.java
```

#### 2.3 REST Endpoints

**Lawyer Management APIs** (Create in `controllers/LawyerController.java`):

```
GET    /api/lawyers                        - List all lawyers with filters
GET    /api/lawyers/{id}                   - Get lawyer details
GET    /api/lawyers/{id}/availability      - Get lawyer availability
GET    /api/lawyers/{id}/reviews           - Get lawyer reviews
POST   /api/lawyers                        - Register as lawyer (admin/verified)
PUT    /api/lawyers/{id}                   - Update lawyer profile
DELETE /api/lawyers/{id}                   - Deactivate lawyer
GET    /api/lawyers/specialization/{spec}  - Filter by specialization
GET    /api/lawyers/search                 - Search with multiple filters
```

---

### PHASE 3: Stripe Payment Integration
**Effort**: 2-3 days  
**Priority**: CRITICAL

#### 3.1 Dependencies to Add

Add to `backend/nyaysetu-backend/pom.xml`:

```xml
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>26.0.0</version>
</dependency>
```

#### 3.2 Stripe Configuration

Create `StripeConfig.java`:

```java
@Configuration
public class StripeConfig {
    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }
}
```

#### 3.3 Payment Service

Create `PaymentService.java`:

```java
@Service
public class PaymentService {
    
    // Create payment intent for consultation booking
    public PaymentIntent createPaymentIntent(
        BigDecimal amount, 
        String consultationId,
        String userId) throws StripeException;
    
    // Confirm payment after client confirms
    public PaymentIntent confirmPayment(String intentId) throws StripeException;
    
    // Process refunds for cancellations
    public Refund refundPayment(String chargeId, String reason) throws StripeException;
    
    // Generate invoice after successful payment
    public void generateInvoice(Payment payment);
    
    // Verify webhook signature
    public boolean verifyWebhookSignature(String payload, String signature);
}
```

#### 3.4 Payment Controller

Create `PaymentController.java`:

```
POST   /api/payments/create-intent         - Create Stripe payment intent
POST   /api/payments/confirm                - Confirm payment after client auth
POST   /api/payments/refund                 - Request refund
GET    /api/payments/{id}                  - Get payment details
GET    /api/invoices/{id}                  - Download invoice
POST   /api/webhooks/stripe                - Stripe webhook endpoint
```

#### 3.5 Webhook Handler

Create `StripeWebhookController.java`:

```
Events to handle:
- payment_intent.succeeded     → Update consultation status
- payment_intent.payment_failed → Send notification
- charge.refunded              → Process refund
- charge.dispute.created       → Handle disputes
```

---

### PHASE 4: Booking & Calendar System
**Effort**: 2 days  
**Priority**: HIGH

#### 4.1 Booking Service

Create `ConsultationService.java`:

```java
@Service
public class ConsultationService {
    
    // Get available slots for lawyer
    public List<LocalDateTime> getAvailableSlots(
        Long lawyerId, 
        LocalDate startDate, 
        LocalDate endDate);
    
    // Create consultation booking
    public Consultation createBooking(
        Long userId, 
        Long lawyerId,
        LocalDateTime scheduledTime,
        String consultationType,
        String caseDescription);
    
    // Update consultation status
    public void updateConsultationStatus(Long consultationId, String status);
    
    // Cancel consultation with refund
    public void cancelConsultation(Long consultationId, String reason);
    
    // Get user's consultations
    public List<Consultation> getUserConsultations(Long userId);
    
    // Get lawyer's consultations
    public List<Consultation> getLawyerConsultations(Long lawyerId);
}
```

#### 4.2 Booking Controller

Create `ConsultationController.java`:

```
GET    /api/consultations                  - Get user's consultations
GET    /api/consultations/{id}             - Get consultation details
POST   /api/consultations                  - Create new booking
PUT    /api/consultations/{id}             - Update consultation
DELETE /api/consultations/{id}             - Cancel consultation
GET    /api/consultations/available-slots  - Get available slots for lawyer
POST   /api/consultations/{id}/reschedule  - Reschedule appointment
GET    /api/consultations/{id}/meeting-link - Get meeting link
```

---

### PHASE 5: Frontend Implementation
**Effort**: 3-4 days  
**Priority**: HIGH

#### 5.1 Frontend Components Structure

```
src/components/
├── LawyerMarketplace/
│   ├── LawyerList.jsx              - Display lawyers with filters
│   ├── LawyerCard.jsx              - Individual lawyer card
│   ├── LawyerDetail.jsx            - Lawyer profile & reviews
│   ├── LawyerFilter.jsx            - Search/filter UI
│   └── LawyerReviews.jsx           - Reviews section
├── Booking/
│   ├── BookingFlow.jsx             - Multi-step booking wizard
│   ├── CalendarWidget.jsx          - Availability calendar
│   ├── SlotSelection.jsx           - Choose time slot
│   ├── CaseDescription.jsx         - Case details form
│   └── ConfirmationModal.jsx       - Review before booking
├── Payment/
│   ├── StripeCheckout.jsx          - Payment form (Stripe Elements)
│   ├── PaymentConfirmation.jsx     - Payment success/failure
│   ├── Invoice.jsx                 - Download invoice
│   └── RefundModal.jsx             - Request refund UI
├── VirtualConsultation/
│   ├── ConsultationLobby.jsx       - Before joining
│   ├── VideoConsole.jsx            - Video/audio interface
│   ├── ChatPanel.jsx               - In-consultation chat
│   ├── DocumentSharing.jsx         - Share case files
│   └── CaseWorkspace.jsx           - Collaboration space
└── Dashboard/
    ├── UserDashboard.jsx           - User's bookings & history
    └── LawyerDashboard.jsx         - Lawyer's schedule & earnings
```

#### 5.2 Key Pages

**1. Lawyer Marketplace** (`/lawyer-consultation`)
- Search bar with filters (specialization, rating, availability, price)
- Lawyer cards with profile preview
- Quick book button
- Reviews and ratings display

**2. Lawyer Detail Page** (`/lawyer-consultation/:id`)
- Full lawyer profile
- Expertise areas
- Availability calendar
- Reviews with verified consultation badge
- "Book Consultation" button

**3. Booking Flow** (`/booking/:lawyerId`)
- Step 1: Select consultation type (Video/Audio/Chat)
- Step 2: Choose date/time from availability
- Step 3: Describe case/issue
- Step 4: Review booking + lawyer details
- Step 5: Proceed to payment

**4. Payment Page** (`/booking/:bookingId/payment`)
- Stripe Elements integration
- Amount, lawyer name, date/time summary
- Payment processing
- Error handling with retry option

**5. Virtual Consultation Room** (`/consultation/:consultationId`)
- WebRTC video/audio interface
- Chat sidebar
- Case document workspace
- Timer showing remaining time
- End consultation button

**6. User Dashboard** (`/dashboard/consultations`)
- Upcoming consultations
- Past consultations with review option
- Invoice history
- Payment history

---

### PHASE 6: Video/Audio Integration (WebRTC)
**Effort**: 2-3 days  
**Priority**: MEDIUM (Can use Zoom SDK or WebRTC)

#### 6.1 Option A: Signaling Server Enhancement (WebRTC)

Use existing signaling-server and extend with:
- Peer connection management
- ICE candidate exchange
- Media stream handling
- Recording capability (if needed)

#### 6.2 Option B: Zoom SDK Integration

Add to frontend `package.json`:
```json
"@zoom/websdk": "^2.x.x"
```

Or use Zoom API for server-side meeting creation.

---

## 3. Implementation Checklist

### PHASE 1: Database
- [ ] Create all tables and indexes
- [ ] Set up migration scripts
- [ ] Test schema with sample data

### PHASE 2: Backend - Lawyer Management
- [ ] Create JPA entities
- [ ] Build repository layer
- [ ] Implement LawyerController
- [ ] Add search and filter logic
- [ ] Create LawyerService
- [ ] Unit tests

### PHASE 3: Stripe Integration
- [ ] Add Stripe dependency
- [ ] Create StripeConfig
- [ ] Implement PaymentService
- [ ] Build PaymentController
- [ ] Create webhook handler
- [ ] Test payment flow (test keys)

### PHASE 4: Booking System
- [ ] Create Consultation entity
- [ ] Build ConsultationService
- [ ] Create ConsultationController
- [ ] Implement availability logic
- [ ] Email notifications
- [ ] Unit tests

### PHASE 5: Frontend
- [ ] Create component structure
- [ ] Build LawyerMarketplace page
- [ ] Implement booking wizard
- [ ] Integrate Stripe Checkout
- [ ] Build payment flow UI
- [ ] Create user dashboard

### PHASE 6: Virtual Consultation
- [ ] Set up video/audio integration
- [ ] Create consultation room UI
- [ ] Implement document sharing
- [ ] Add chat functionality
- [ ] Test video quality

### PHASE 7: QA & Deployment
- [ ] End-to-end testing
- [ ] Payment testing with Stripe test keys
- [ ] Security audit
- [ ] Performance testing
- [ ] Documentation
- [ ] Deployment

---

## 4. API Request/Response Examples

### Create Payment Intent
```bash
POST /api/payments/create-intent
Content-Type: application/json

{
  "consultationId": 1,
  "amount": 9999,
  "currency": "USD"
}

Response:
{
  "clientSecret": "pi_xxx_secret_xxx",
  "intentId": "pi_xxx",
  "amount": 9999,
  "status": "requires_payment_method"
}
```

### Book Consultation
```bash
POST /api/consultations
Content-Type: application/json

{
  "lawyerId": 5,
  "scheduledDate": "2026-06-15",
  "scheduledTime": "14:30",
  "consultationType": "VIDEO",
  "caseDescription": "Need advice on contract review"
}

Response:
{
  "id": 42,
  "status": "PENDING_PAYMENT",
  "consultationFee": 100.00,
  "paymentIntentId": "pi_xxx",
  "clientSecret": "pi_xxx_secret_xxx"
}
```

---

## 5. Environment Variables

Add to `.env`:
```
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
CONSULTATION_FEE_PERCENTAGE=20
MAX_CONSULTATION_DURATION_MINUTES=120
MIN_ADVANCE_BOOKING_HOURS=1

# Email Notifications
ENABLE_EMAIL_NOTIFICATIONS=true
```

---

## 6. Security Considerations

✅ **Payment Security**
- PCI DSS compliance via Stripe (never store card data)
- Webhook signature verification
- HTTPS only for payment endpoints
- CSRF protection on payment forms

✅ **Access Control**
- Only users can view their own bookings
- Only lawyers can view their schedule
- Admin verification for lawyer registration

✅ **Data Protection**
- Encrypt case descriptions
- Secure video meeting links
- Audit logs for all payments

---

## 7. Testing Strategy

### Unit Tests
- LawyerService, ConsultationService, PaymentService
- Stripe mock tests
- Availability calculation logic

### Integration Tests
- Database operations
- API endpoint validation
- Payment workflow (using Stripe test keys)

### E2E Tests
- Complete booking flow
- Payment processing
- Video consultation access

---

## 8. Deployment Considerations

1. **Database Migrations**: Use Flyway or Liquibase
2. **Stripe Keys**: Use environment variables, rotate regularly
3. **CDN**: For invoice PDFs and case documents
4. **Monitoring**: Track payment failures, webhook delivery
5. **Backup**: Regular backups of consultation records

---

## 9. Next Steps

1. ✅ Review and approve this architecture
2. ⏳ Start with PHASE 1: Database schema implementation
3. ⏳ Create migration scripts
4. ⏳ Begin PHASE 2: Backend entity and API development
5. ⏳ Parallel: PHASE 3 Stripe integration setup

---

## 10. Estimated Timeline

- **Phase 1**: 2-3 days (Database)
- **Phase 2**: 2 days (Lawyer Management API)
- **Phase 3**: 2-3 days (Stripe Integration)
- **Phase 4**: 2 days (Booking System)
- **Phase 5**: 3-4 days (Frontend)
- **Phase 6**: 2-3 days (Video Integration)
- **Phase 7**: 2-3 days (QA & Refinements)

**Total Estimated Time**: 15-21 days

---

**Document Version**: 1.0  
**Created**: May 22, 2026  
**Last Updated**: May 22, 2026  
**Author**: Implementation Team
