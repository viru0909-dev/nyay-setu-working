package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.*;
import com.nyaysetu.backend.entity.ConsultationSlot;
import com.nyaysetu.backend.service.ConsultationService;
import com.nyaysetu.backend.service.StripePaymentService;
import com.nyaysetu.backend.service.InvoiceGenerationService;
import com.nyaysetu.backend.service.AuthService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@Slf4j
public class ConsultationController {
    private final ConsultationService consultationService;
    private final StripePaymentService stripePaymentService;
    private final InvoiceGenerationService invoiceGenerationService;
    private final AuthService authService;
    private final com.nyaysetu.backend.repository.LawyerProfileRepository lawyerProfileRepository;

    @PostMapping("/book")
    public ResponseEntity<?> bookConsultation(@Valid @RequestBody BookConsultationRequest request,
                                             Authentication auth) {
        try {
            Long clientId = authService.findByEmail(auth.getName()).getId();
            ConsultationDTO consultation = consultationService.bookConsultation(clientId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(consultation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-consultations")
    public ResponseEntity<?> getUserConsultations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        try {
            Long clientId = authService.findByEmail(auth.getName()).getId();
            Pageable pageable = PageRequest.of(page, size);
            Page<ConsultationDTO> consultations = consultationService.getUserConsultations(clientId, pageable);
            return ResponseEntity.ok(consultations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch consultations"));
        }
    }

    @GetMapping("/{consultationId}")
    public ResponseEntity<?> getConsultationDetails(@PathVariable Long consultationId) {
        try {
            ConsultationDTO consultation = consultationService.getConsultationById(consultationId);
            return ResponseEntity.ok(consultation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{consultationId}/cancel")
    public ResponseEntity<?> cancelConsultation(
            @PathVariable Long consultationId,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            String reason = request.getOrDefault("reason", "Client requested cancellation");
            ConsultationDTO consultation = consultationService.cancelConsultation(consultationId, reason);
            return ResponseEntity.ok(consultation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{consultationId}/complete")
    public ResponseEntity<?> completeConsultation(
            @PathVariable Long consultationId,
            @RequestBody Map<String, Object> request) {
        try {
            Double rating = request.containsKey("rating") ? 
                    Double.parseDouble(request.get("rating").toString()) : null;
            String feedback = (String) request.getOrDefault("feedback", "");
            consultationService.completeConsultation(consultationId, rating, feedback);
            return ResponseEntity.ok(Map.of("message", "Consultation marked as completed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/lawyer/{lawyerId}/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @PathVariable Long lawyerId,
            @RequestParam String from,
            @RequestParam String to) {
        try {
            LocalDateTime fromDate = LocalDateTime.parse(from);
            LocalDateTime toDate = LocalDateTime.parse(to);
            List<ConsultationSlotDTO> slots = consultationService.getAvailableSlots(lawyerId, fromDate, toDate);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format"));
        }
    }

    @PostMapping("/payment/create-intent")
    public ResponseEntity<?> createPaymentIntent(
            @Valid @RequestBody CreatePaymentIntentRequest request,
            Authentication auth) {
        try {
            Long clientId = authService.findByEmail(auth.getName()).getId();
            PaymentIntentResponse response = stripePaymentService.createPaymentIntent(clientId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (StripeException e) {
            log.error("Stripe error creating payment intent", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment processing failed"));
        }
    }

    @PostMapping("/payment/webhook")
    public ResponseEntity<?> handleStripeWebhook(@RequestBody Map<String, Object> payload) {
        try {
            String eventType = (String) payload.get("type");
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            Map<String, Object> paymentIntent = (Map<String, Object>) data.get("object");
            String paymentIntentId = (String) paymentIntent.get("id");

            stripePaymentService.handleWebhookEvent(eventType, paymentIntentId);
            return ResponseEntity.ok(Map.of("received", true));
        } catch (Exception e) {
            log.error("Error handling webhook", e);
            return ResponseEntity.ok(Map.of("received", true));
        }
    }

    @PostMapping("/payment/{paymentId}/refund")
    public ResponseEntity<?> refundPayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.getOrDefault("reason", "Customer requested refund");
            String refundId = stripePaymentService.refundPayment(paymentId, reason);
            return ResponseEntity.ok(Map.of("refund_id", refundId, "status", "refunded"));
        } catch (StripeException e) {
            log.error("Stripe error processing refund", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Refund processing failed"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/payment/{paymentId}/invoice")
    public ResponseEntity<?> downloadInvoice(@PathVariable Long paymentId) {
        try {
            byte[] invoicePdf = invoiceGenerationService.generateInvoicePDF(paymentId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + paymentId + ".pdf")
                    .body(invoicePdf);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error downloading invoice for payment {}", paymentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate invoice"));
        }
    }

    @GetMapping("/lawyer-consultations")
    public ResponseEntity<?> getLawyerConsultations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        try {
            Long userId = authService.findByEmail(auth.getName()).getId();
            com.nyaysetu.backend.entity.LawyerProfile lawyer = lawyerProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Lawyer profile not found"));
            Pageable pageable = PageRequest.of(page, size);
            Page<ConsultationDTO> consultations = consultationService.getLawyerConsultations(lawyer.getId(), pageable);
            return ResponseEntity.ok(consultations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching lawyer consultations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch lawyer consultations"));
        }
    }

    @PostMapping("/lawyer/add-slots")
    public ResponseEntity<?> addSlots(
            @RequestBody List<Map<String, String>> requestSlots,
            Authentication auth) {
        try {
            Long userId = authService.findByEmail(auth.getName()).getId();
            com.nyaysetu.backend.entity.LawyerProfile lawyer = lawyerProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Lawyer profile not found"));
            
            List<ConsultationSlot> slots = new ArrayList<>();
            for (Map<String, String> slotMap : requestSlots) {
                LocalDateTime start = LocalDateTime.parse(slotMap.get("startTime"));
                LocalDateTime end = LocalDateTime.parse(slotMap.get("endTime"));
                slots.add(ConsultationSlot.builder()
                        .startTime(start)
                        .endTime(end)
                        .build());
            }
            consultationService.addConsultationSlots(lawyer.getId(), slots);
            return ResponseEntity.ok(Map.of("message", "Slots added successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error adding slots", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
