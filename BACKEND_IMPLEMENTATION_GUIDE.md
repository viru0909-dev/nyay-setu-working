# Virtual Lawyer Consultation - Backend Implementation Quick Start

## Overview
This guide provides step-by-step instructions for implementing the backend services for the Virtual Lawyer Consultation System using Spring Boot.

---

## Step 1: Add Dependencies

### Update `backend/nyaysetu-backend/pom.xml`

Add these dependencies to your `<dependencies>` section:

```xml
<!-- Stripe Java SDK -->
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>26.0.0</version>
</dependency>

<!-- JWT for secure endpoints -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>javax.validation</groupId>
    <artifactId>validation-api</artifactId>
    <version>2.0.1.Final</version>
</dependency>

<!-- PDF Generation for invoices -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itextpdf</artifactId>
    <version>5.5.13.3</version>
</dependency>

<!-- Email sending -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- Scheduling -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

---

## Step 2: Environment Configuration

### Update `.env`

```properties
# Stripe Configuration
STRIPE_API_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application Settings
CONSULTATION_MIN_ADVANCE_HOURS=1
CONSULTATION_MAX_ADVANCE_DAYS=90
CONSULTATION_DURATION_MINUTES=60
CONSULTATION_FEE_PERCENTAGE=20

# Email Configuration
MAIL_FROM=noreply@nyaysetu.com
MAIL_SMTP_HOST=smtp.gmail.com
MAIL_SMTP_PORT=587
MAIL_SMTP_USERNAME=your_email@gmail.com
MAIL_SMTP_PASSWORD=your_app_password
```

### Update `application-dev.properties`

```properties
# Stripe
stripe.api.key=${STRIPE_API_KEY}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}

# Consultation settings
consultation.min-advance-hours=1
consultation.max-advance-days=90
consultation.duration-minutes=60
consultation.platform-fee-percentage=20

# Mail
spring.mail.host=${MAIL_SMTP_HOST}
spring.mail.port=${MAIL_SMTP_PORT}
spring.mail.username=${MAIL_SMTP_USERNAME}
spring.mail.password=${MAIL_SMTP_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

---

## Step 3: Create JPA Entities

### Path: `backend/nyaysetu-backend/src/main/java/com/nyaysetu/model/`

#### 1. LawyerProfile.java

```java
package com.nyaysetu.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "lawyers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawyerProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private String specialization;
    
    private Integer experienceYears;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(columnDefinition = "TEXT")
    private String qualification;
    
    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    
    @Column(nullable = false)
    private BigDecimal hourlyRate;
    
    private BigDecimal rating = BigDecimal.ZERO;
    
    private Integer totalConsultations = 0;
    
    private Boolean isActive = true;
    
    private String profileImageUrl;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @OneToMany(mappedBy = "lawyer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<LawyerExpertise> expertiseAreas;
    
    @OneToMany(mappedBy = "lawyer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<LawyerAvailability> availability;
    
    @OneToMany(mappedBy = "lawyer", cascade = CascadeType.ALL)
    private Set<LawyerReview> reviews;
    
    @OneToMany(mappedBy = "lawyer")
    private Set<Consultation> consultations;
    
    @Transient
    public BigDecimal getAverageRating() {
        if (reviews == null || reviews.isEmpty()) return BigDecimal.ZERO;
        return reviews.stream()
            .map(r -> BigDecimal.valueOf(r.getRating()))
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(reviews.size()), 2, java.math.RoundingMode.HALF_UP);
    }
    
    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED, SUSPENDED
    }
}
```

#### 2. LawyerExpertise.java

```java
package com.nyaysetu.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lawyer_expertise")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawyerExpertise {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerProfile lawyer;
    
    @Column(nullable = false)
    private String expertiseArea;
    
    private Integer yearsInArea;
}
```

#### 3. LawyerAvailability.java

```java
package com.nyaysetu.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "lawyer_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawyerAvailability {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerProfile lawyer;
    
    // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    @Column(nullable = false)
    private Integer dayOfWeek;
    
    @Column(nullable = false)
    private LocalTime startTime;
    
    @Column(nullable = false)
    private LocalTime endTime;
    
    private Boolean isAvailable = true;
}
```

#### 4. Consultation.java

```java
package com.nyaysetu.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "consultations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerProfile lawyer;
    
    @Column(nullable = false)
    private LocalDate scheduledDate;
    
    @Column(nullable = false)
    private LocalTime scheduledTime;
    
    private Integer durationMinutes = 60;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationType consultationType;
    
    @Enumerated(EnumType.STRING)
    private ConsultationStatus status = ConsultationStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String caseDescription;
    
    private String meetingLink;
    
    private String caseFileUrl;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private Boolean reminderSent = false;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @OneToOne(mappedBy = "consultation", cascade = CascadeType.ALL)
    private Payment payment;
    
    public enum ConsultationType {
        VIDEO, AUDIO, CHAT
    }
    
    public enum ConsultationStatus {
        PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    }
}
```

#### 5. Payment.java

```java
package com.nyaysetu.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false, unique = true)
    private Consultation consultation;
    
    @Column(nullable = false)
    private Long userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerProfile lawyer;
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    private String currency = "USD";
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;
    
    private String stripePaymentIntentId;
    
    private String stripeChargeId;
    
    private String paymentMethod;
    
    private String refundReason;
    
    private BigDecimal refundAmount;
    
    @Enumerated(EnumType.STRING)
    private RefundStatus refundStatus = RefundStatus.NONE;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @OneToOne(mappedBy = "payment", cascade = CascadeType.ALL)
    private Invoice invoice;
    
    public enum PaymentStatus {
        PENDING, COMPLETED, REFUNDED, FAILED, CANCELLED
    }
    
    public enum RefundStatus {
        NONE, PARTIAL, FULL, PENDING
    }
}
```

#### 6. Invoice.java

```java
package com.nyaysetu.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false, unique = true)
    private Payment payment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;
    
    @Column(unique = true, nullable = false)
    private String invoiceNumber;
    
    private String pdfUrl;
    
    private LocalDateTime issuedDate = LocalDateTime.now();
    
    private LocalDateTime dueDate;
    
    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.ISSUED;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum InvoiceStatus {
        ISSUED, PAID, CANCELLED, OVERDUE
    }
}
```

#### 7. LawyerReview.java

```java
package com.nyaysetu.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lawyer_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawyerReview {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerProfile lawyer;
    
    @Column(nullable = false)
    private Long userId;
    
    private Long consultationId;
    
    @Column(nullable = false)
    private Integer rating;
    
    @Column(columnDefinition = "TEXT")
    private String reviewText;
    
    private Boolean isVerifiedConsultation = false;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

---

## Step 4: Create Repository Interfaces

### Path: `backend/nyaysetu-backend/src/main/java/com/nyaysetu/repository/`

#### LawyerRepository.java

```java
package com.nyaysetu.repository;

import com.nyaysetu.model.LawyerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface LawyerRepository extends JpaRepository<LawyerProfile, Long> {
    Optional<LawyerProfile> findByUserId(Long userId);
    List<LawyerProfile> findBySpecialization(String specialization);
    List<LawyerProfile> findByVerificationStatusAndIsActiveTrue(
        LawyerProfile.VerificationStatus status);
    
    @Query("SELECT l FROM LawyerProfile l WHERE l.isActive = true " +
           "AND l.verificationStatus = 'VERIFIED' " +
           "AND l.specialization LIKE %:specialization%")
    List<LawyerProfile> searchLawyers(@Param("specialization") String specialization);
}
```

#### ConsultationRepository.java

```java
package com.nyaysetu.repository;

import com.nyaysetu.model.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByUserId(Long userId);
    List<Consultation> findByLawyerId(Long lawyerId);
    
    @Query("SELECT c FROM Consultation c WHERE c.lawyerId = :lawyerId " +
           "AND c.scheduledDate = :date AND c.status != 'CANCELLED'")
    List<Consultation> findByLawyerAndDate(
        @Param("lawyerId") Long lawyerId, 
        @Param("date") LocalDate date);
}
```

#### PaymentRepository.java

```java
package com.nyaysetu.repository;

import com.nyaysetu.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByStripePaymentIntentId(String intentId);
    Optional<Payment> findByConsultationId(Long consultationId);
}
```

---

## Step 5: Create Service Classes

### Path: `backend/nyaysetu-backend/src/main/java/com/nyaysetu/service/`

#### LawyerService.java

```java
package com.nyaysetu.service;

import com.nyaysetu.model.LawyerProfile;
import com.nyaysetu.repository.LawyerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class LawyerService {
    
    private final LawyerRepository lawyerRepository;
    
    public LawyerProfile registerLawyer(LawyerProfile lawyer) {
        // Validation logic
        if (lawyer.getHourlyRate() == null || lawyer.getHourlyRate().signum() <= 0) {
            throw new IllegalArgumentException("Invalid hourly rate");
        }
        return lawyerRepository.save(lawyer);
    }
    
    public Optional<LawyerProfile> getLawyerById(Long id) {
        return lawyerRepository.findById(id);
    }
    
    public Optional<LawyerProfile> getLawyerByUserId(Long userId) {
        return lawyerRepository.findByUserId(userId);
    }
    
    public List<LawyerProfile> getLawyersBySpecialization(String specialization) {
        return lawyerRepository.findBySpecialization(specialization);
    }
    
    public List<LawyerProfile> searchLawyers(String query) {
        return lawyerRepository.searchLawyers(query);
    }
    
    public LawyerProfile updateLawyer(Long id, LawyerProfile updates) {
        LawyerProfile lawyer = lawyerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Lawyer not found"));
        
        if (updates.getBio() != null) lawyer.setBio(updates.getBio());
        if (updates.getHourlyRate() != null) lawyer.setHourlyRate(updates.getHourlyRate());
        
        return lawyerRepository.save(lawyer);
    }
    
    public void deactivateLawyer(Long id) {
        LawyerProfile lawyer = lawyerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Lawyer not found"));
        lawyer.setIsActive(false);
        lawyerRepository.save(lawyer);
    }
}
```

#### ConsultationService.java

```java
package com.nyaysetu.service;

import com.nyaysetu.model.Consultation;
import com.nyaysetu.model.LawyerAvailability;
import com.nyaysetu.model.LawyerProfile;
import com.nyaysetu.repository.ConsultationRepository;
import com.nyaysetu.repository.LawyerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ConsultationService {
    
    private final ConsultationRepository consultationRepository;
    private final LawyerRepository lawyerRepository;
    
    public List<LocalTime> getAvailableSlots(Long lawyerId, LocalDate date) {
        LawyerProfile lawyer = lawyerRepository.findById(lawyerId)
            .orElseThrow(() -> new RuntimeException("Lawyer not found"));
        
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        
        LawyerAvailability availability = lawyer.getAvailability().stream()
            .filter(a -> a.getDayOfWeek() == dayOfWeek.getValue() - 1)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No availability for this day"));
        
        // Get booked consultations for the day
        List<Consultation> booked = consultationRepository
            .findByLawyerAndDate(lawyerId, date);
        
        // Generate available slots (1-hour slots)
        List<LocalTime> availableSlots = new java.util.ArrayList<>();
        LocalTime current = availability.getStartTime();
        
        while (current.plusHours(1).isBefore(availability.getEndTime()) || 
               current.plusHours(1).equals(availability.getEndTime())) {
            
            final LocalTime slotTime = current;
            boolean isBooked = booked.stream()
                .anyMatch(c -> c.getScheduledTime().equals(slotTime));
            
            if (!isBooked) {
                availableSlots.add(current);
            }
            current = current.plusHours(1);
        }
        
        return availableSlots;
    }
    
    public Consultation createBooking(
        Long userId,
        Long lawyerId,
        LocalDate date,
        LocalTime time,
        String caseDescription) {
        
        Consultation consultation = Consultation.builder()
            .userId(userId)
            .lawyerId(lawyerId)
            .scheduledDate(date)
            .scheduledTime(time)
            .caseDescription(caseDescription)
            .status(Consultation.ConsultationStatus.PENDING)
            .build();
        
        return consultationRepository.save(consultation);
    }
    
    public List<Consultation> getUserConsultations(Long userId) {
        return consultationRepository.findByUserId(userId);
    }
    
    public List<Consultation> getLawyerConsultations(Long lawyerId) {
        return consultationRepository.findByLawyerId(lawyerId);
    }
}
```

#### PaymentService.java (Stripe Integration)

```java
package com.nyaysetu.service;

import com.nyaysetu.model.Consultation;
import com.nyaysetu.model.Payment;
import com.nyaysetu.repository.ConsultationRepository;
import com.nyaysetu.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final ConsultationRepository consultationRepository;
    private final InvoiceService invoiceService;
    
    @Value("${stripe.api.key}")
    private String stripeApiKey;
    
    @Value("${stripe.webhook.secret}")
    private String webhookSecret;
    
    public PaymentIntent createPaymentIntent(
        Long consultationId,
        BigDecimal amount,
        String userId) throws StripeException {
        
        Stripe.apiKey = stripeApiKey;
        
        Consultation consultation = consultationRepository.findById(consultationId)
            .orElseThrow(() -> new RuntimeException("Consultation not found"));
        
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amount.multiply(new BigDecimal(100)).longValue()) // Convert to cents
            .setCurrency("usd")
            .setMetadata("consultationId", consultationId.toString())
            .setMetadata("userId", userId)
            .build();
        
        PaymentIntent intent = PaymentIntent.create(params);
        
        // Save payment record
        Payment payment = Payment.builder()
            .consultation(consultation)
            .userId(Long.valueOf(userId))
            .lawyer(consultation.getLawyer())
            .amount(amount)
            .stripePaymentIntentId(intent.getId())
            .status(Payment.PaymentStatus.PENDING)
            .build();
        
        paymentRepository.save(payment);
        
        return intent;
    }
    
    public PaymentIntent confirmPayment(String intentId) throws StripeException {
        Stripe.apiKey = stripeApiKey;
        PaymentIntent intent = PaymentIntent.retrieve(intentId);
        
        if (intent.getStatus().equals("succeeded")) {
            Optional<Payment> payment = paymentRepository.findByStripePaymentIntentId(intentId);
            payment.ifPresent(p -> {
                p.setStatus(Payment.PaymentStatus.COMPLETED);
                p.setStripeChargeId(intent.getCharges().getData().get(0).getId());
                paymentRepository.save(p);
                
                // Update consultation status
                Consultation consultation = p.getConsultation();
                consultation.setStatus(Consultation.ConsultationStatus.CONFIRMED);
                consultationRepository.save(consultation);
                
                // Generate invoice
                invoiceService.generateInvoice(p);
            });
        }
        
        return intent;
    }
    
    public Refund refundPayment(Long paymentId, String reason) throws StripeException {
        Stripe.apiKey = stripeApiKey;
        
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        RefundCreateParams params = RefundCreateParams.builder()
            .setCharge(payment.getStripeChargeId())
            .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER)
            .build();
        
        Refund refund = Refund.create(params);
        
        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        payment.setRefundReason(reason);
        payment.setRefundStatus(Payment.RefundStatus.FULL);
        paymentRepository.save(payment);
        
        return refund;
    }
    
    public boolean verifyWebhookSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(
                webhookSecret.getBytes(), 0, webhookSecret.getBytes().length, "HmacSHA256");
            mac.init(key);
            String computedSignature = Base64.getEncoder()
                .encodeToString(mac.doFinal(payload.getBytes()));
            return computedSignature.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
```

---

## Step 6: Create Controller Classes

### Path: `backend/nyaysetu-backend/src/main/java/com/nyaysetu/controller/`

#### LawyerController.java

```java
package com.nyaysetu.controller;

import com.nyaysetu.model.LawyerProfile;
import com.nyaysetu.service.LawyerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lawyers")
@RequiredArgsConstructor
public class LawyerController {
    
    private final LawyerService lawyerService;
    
    @GetMapping
    public ResponseEntity<List<LawyerProfile>> getAllLawyers() {
        // Implementation
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LawyerProfile> getLawyerById(@PathVariable Long id) {
        return lawyerService.getLawyerById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/specialization/{spec}")
    public ResponseEntity<List<LawyerProfile>> getLawyersBySpecialization(
        @PathVariable String spec) {
        return ResponseEntity.ok(lawyerService.getLawyersBySpecialization(spec));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LawyerProfile> registerLawyer(@RequestBody LawyerProfile lawyer) {
        return ResponseEntity.ok(lawyerService.registerLawyer(lawyer));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<LawyerProfile> updateLawyer(
        @PathVariable Long id,
        @RequestBody LawyerProfile updates) {
        return ResponseEntity.ok(lawyerService.updateLawyer(id, updates));
    }
}
```

#### ConsultationController.java

```java
package com.nyaysetu.controller;

import com.nyaysetu.model.Consultation;
import com.nyaysetu.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {
    
    private final ConsultationService consultationService;
    
    @GetMapping("/available-slots")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
        @RequestParam Long lawyerId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(consultationService.getAvailableSlots(lawyerId, date));
    }
    
    @PostMapping
    public ResponseEntity<Consultation> createBooking(
        @RequestBody BookingRequest request) {
        Consultation consultation = consultationService.createBooking(
            request.getUserId(),
            request.getLawyerId(),
            request.getScheduledDate(),
            request.getScheduledTime(),
            request.getCaseDescription()
        );
        return ResponseEntity.ok(consultation);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Consultation>> getUserConsultations(
        @PathVariable Long userId) {
        return ResponseEntity.ok(consultationService.getUserConsultations(userId));
    }
}
```

#### PaymentController.java

```java
package com.nyaysetu.controller;

import com.nyaysetu.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
        @RequestBody PaymentRequest request) throws StripeException {
        
        PaymentIntent intent = paymentService.createPaymentIntent(
            request.getConsultationId(),
            request.getAmount(),
            request.getUserId()
        );
        
        return ResponseEntity.ok(PaymentIntentResponse.builder()
            .clientSecret(intent.getClientSecret())
            .intentId(intent.getId())
            .amount(request.getAmount())
            .status(intent.getStatus())
            .build());
    }
    
    @PostMapping("/confirm")
    public ResponseEntity<PaymentIntent> confirmPayment(
        @RequestBody ConfirmPaymentRequest request) throws StripeException {
        return ResponseEntity.ok(paymentService.confirmPayment(request.getIntentId()));
    }
    
    @PostMapping("/webhooks/stripe")
    public ResponseEntity<Void> handleStripeWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String signature) {
        
        if (!paymentService.verifyWebhookSignature(payload, signature)) {
            return ResponseEntity.badRequest().build();
        }
        
        // Parse and handle webhook event
        // Implementation details...
        
        return ResponseEntity.ok().build();
    }
}
```

---

## Step 7: Configuration Classes

### StripeConfig.java

```java
package com.nyaysetu.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.annotation.PostConstruct;

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

---

## Step 8: DTOs for Requests/Responses

### Path: `backend/nyaysetu-backend/src/main/java/com/nyaysetu/dto/`

```java
// BookingRequest.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private Long userId;
    private Long lawyerId;
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private String caseDescription;
}

// PaymentRequest.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private Long consultationId;
    private Long userId;
    private BigDecimal amount;
}

// PaymentIntentResponse.java
@Data
@Builder
public class PaymentIntentResponse {
    private String clientSecret;
    private String intentId;
    private BigDecimal amount;
    private String status;
}
```

---

## Next Steps

1. Run the database migration script: `lawyer_consultation_migration.sql`
2. Add all JPA entities to your Spring Boot project
3. Create repositories extending JpaRepository
4. Implement service classes
5. Create REST controllers
6. Test each endpoint using Postman/Insomnia
7. Add unit and integration tests
8. Proceed with frontend implementation

---

## Testing with Stripe Test Keys

Use these test card numbers for development:

- **Successful Payment**: 4242 4242 4242 4242
- **Requires Authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 0002

**Expiry**: Any future date  
**CVC**: Any 3-digit number

---

**Version**: 1.0  
**Last Updated**: May 22, 2026
