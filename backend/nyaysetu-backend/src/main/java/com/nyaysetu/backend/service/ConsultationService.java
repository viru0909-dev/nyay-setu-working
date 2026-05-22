package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.*;
import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
@EnableScheduling
public class ConsultationService {
    private final ConsultationRepository consultationRepository;
    private final ConsultationSlotRepository slotRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final ZoomMeetingService zoomMeetingService;
    private final ConsultationEmailService emailService;
    private final InvoiceGenerationService invoiceGenerationService;

    public ConsultationDTO bookConsultation(Long clientId, BookConsultationRequest request) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));

        LawyerProfile lawyer = lawyerProfileRepository.findById(request.getLawyerId())
                .orElseThrow(() -> new IllegalArgumentException("Lawyer not found"));

        // Check for slot conflicts
        List<Consultation> conflicts = consultationRepository.findConflictingConsultations(
                lawyer.getId(),
                request.getScheduledTime(),
                request.getScheduledTime().plusMinutes(request.getDurationMinutes())
        );

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Lawyer has conflicting consultation at this time");
        }

        // Mark slot as booked
        markSlotAsBooked(lawyer.getId(), request.getScheduledTime(),
                request.getScheduledTime().plusMinutes(request.getDurationMinutes()));

        Consultation consultation = Consultation.builder()
                .lawyer(lawyer)
                .client(client)
                .scheduledTime(request.getScheduledTime())
                .durationMinutes(request.getDurationMinutes())
                .status(Consultation.ConsultationStatus.SCHEDULED)
                .notes(request.getNotes())
                .createdAt(System.currentTimeMillis())
                .updatedAt(System.currentTimeMillis())
                .build();

        Consultation saved = consultationRepository.save(consultation);

        // Send booking confirmation emails asynchronously
        emailService.sendBookingConfirmation(saved);

        log.info("Consultation booked - ID: {}, Client: {}, Lawyer: {}", saved.getId(), clientId, lawyer.getId());

        return toDTO(saved);
    }

    public Page<ConsultationDTO> getUserConsultations(Long userId, Pageable pageable) {
        return consultationRepository.findByClientId(userId, pageable)
                .map(this::toDTO);
    }

    public Page<ConsultationDTO> getLawyerConsultations(Long lawyerId, Pageable pageable) {
        return consultationRepository.findByLawyerId(lawyerId, pageable)
                .map(this::toDTO);
    }

    public ConsultationDTO getConsultationById(Long consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new IllegalArgumentException("Consultation not found"));
        return toDTO(consultation);
    }

    public ConsultationDTO cancelConsultation(Long consultationId, String reason) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new IllegalArgumentException("Consultation not found"));

        if (consultation.getStatus() == Consultation.ConsultationStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot cancel completed consultation");
        }

        consultation.setStatus(Consultation.ConsultationStatus.CANCELLED);
        consultation.setUpdatedAt(System.currentTimeMillis());
        Consultation saved = consultationRepository.save(consultation);

        // Mark slot as available again
        unmarkSlot(consultation.getLawyer().getId(),
                consultation.getScheduledTime(),
                consultation.getScheduledTime().plusMinutes(consultation.getDurationMinutes()));

        // Handle refund if payment exists
        if (consultation.getPayment() != null) {
            handleCancellationRefund(consultation.getPayment(), reason);
        }

        // Send cancellation emails
        emailService.sendCancellationEmail(saved, reason);

        log.info("Consultation cancelled - ID: {}, Reason: {}", consultationId, reason);
        return toDTO(saved);
    }

    public List<ConsultationSlotDTO> getAvailableSlots(Long lawyerId, LocalDateTime from, LocalDateTime to) {
        List<ConsultationSlot> slots = slotRepository.findAvailableSlots(lawyerId, from, to);
        return slots.stream()
                .map(this::slotToDTO)
                .collect(Collectors.toList());
    }

    public void addConsultationSlots(Long lawyerId, List<ConsultationSlot> slots) {
        LawyerProfile lawyer = lawyerProfileRepository.findById(lawyerId)
                .orElseThrow(() -> new IllegalArgumentException("Lawyer not found"));

        for (ConsultationSlot slot : slots) {
            slot.setLawyer(lawyer);
            slot.setStatus(ConsultationSlot.SlotStatus.AVAILABLE);
            slot.setCreatedAt(System.currentTimeMillis());
            slot.setUpdatedAt(System.currentTimeMillis());
        }

        slotRepository.saveAll(slots);
        log.info("Added {} consultation slots for lawyer {}", slots.size(), lawyerId);
    }

    public void completeConsultation(Long consultationId, Double lawyerRating, String feedback) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new IllegalArgumentException("Consultation not found"));

        consultation.setStatus(Consultation.ConsultationStatus.COMPLETED);
        consultation.setLawyerRating(lawyerRating);
        consultation.setClientFeedback(feedback);
        consultation.setUpdatedAt(System.currentTimeMillis());

        consultationRepository.save(consultation);

        // Update lawyer rating
        if (lawyerRating != null) {
            LawyerProfile lawyer = consultation.getLawyer();
            int totalRatings = lawyer.getTotalRatings();
            double currentAverage = lawyer.getAverageRating();
            double updatedAverage = (currentAverage * totalRatings + lawyerRating) / (totalRatings + 1);

            lawyer.setAverageRating(updatedAverage);
            lawyer.setTotalRatings(totalRatings + 1);
            lawyerProfileRepository.save(lawyer);
        }

        // Send feedback request email
        emailService.sendFeedbackRequest(consultation);

        log.info("Consultation completed - ID: {}, Rating: {}", consultationId, lawyerRating);
    }

    // Scheduled task to send reminders 24 hours before consultation
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void sendConsultationReminders() {
        LocalDateTime reminderTime = LocalDateTime.now().plusHours(24);
        LocalDateTime reminderTimeStart = reminderTime.minusMinutes(5);
        LocalDateTime reminderTimeEnd = reminderTime.plusMinutes(5);

        List<Consultation> upcomingConsultations = consultationRepository.findAll().stream()
                .filter(c -> c.getStatus() == Consultation.ConsultationStatus.SCHEDULED)
                .filter(c -> c.getScheduledTime().isAfter(reminderTimeStart) &&
                            c.getScheduledTime().isBefore(reminderTimeEnd))
                .collect(Collectors.toList());

        for (Consultation consultation : upcomingConsultations) {
            emailService.sendReminderEmail(consultation);
        }

        if (!upcomingConsultations.isEmpty()) {
            log.info("Sent {} reminder emails", upcomingConsultations.size());
        }
    }

    private void markSlotAsBooked(Long lawyerId, LocalDateTime startTime, LocalDateTime endTime) {
        List<ConsultationSlot> slots = slotRepository.findAvailableSlotsInRange(lawyerId, startTime, endTime);
        for (ConsultationSlot slot : slots) {
            slot.setStatus(ConsultationSlot.SlotStatus.BOOKED);
            slot.setUpdatedAt(System.currentTimeMillis());
        }
        slotRepository.saveAll(slots);
    }

    private void unmarkSlot(Long lawyerId, LocalDateTime startTime, LocalDateTime endTime) {
        List<ConsultationSlot> slots = slotRepository.findAvailableSlotsInRange(lawyerId, startTime, endTime);
        for (ConsultationSlot slot : slots) {
            if (slot.getStatus() != ConsultationSlot.SlotStatus.BLOCKED) {
                slot.setStatus(ConsultationSlot.SlotStatus.AVAILABLE);
                slot.setUpdatedAt(System.currentTimeMillis());
            }
        }
        slotRepository.saveAll(slots);
    }

    private void handleCancellationRefund(Payment payment, String reason) {
        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            payment.setRefundReason(reason);
            payment.setUpdatedAt(System.currentTimeMillis());
            paymentRepository.save(payment);
            log.info("Refund marked for payment ID: {}", payment.getId());
        }
    }

    private ConsultationDTO toDTO(Consultation consultation) {
        return ConsultationDTO.builder()
                .id(consultation.getId())
                .lawyer(toLawyerDTO(consultation.getLawyer()))
                .clientName(consultation.getClient().getName())
                .clientEmail(consultation.getClient().getEmail())
                .scheduledTime(consultation.getScheduledTime())
                .durationMinutes(consultation.getDurationMinutes())
                .status(consultation.getStatus().toString())
                .zoomMeetingUrl(consultation.getZoomMeetingUrl())
                .notes(consultation.getNotes())
                .lawyerRating(consultation.getLawyerRating())
                .clientFeedback(consultation.getClientFeedback())
                .payment(consultation.getPayment() != null ? paymentToDTO(consultation.getPayment()) : null)
                .build();
    }

    private ConsultationSlotDTO slotToDTO(ConsultationSlot slot) {
        return ConsultationSlotDTO.builder()
                .id(slot.getId())
                .lawyerId(slot.getLawyer().getId())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(slot.getStatus().toString())
                .build();
    }

    private LawyerProfileDTO toLawyerDTO(LawyerProfile lawyer) {
        return LawyerProfileDTO.builder()
                .id(lawyer.getId())
                .userId(lawyer.getUser().getId())
                .name(lawyer.getUser().getName())
                .email(lawyer.getUser().getEmail())
                .hourlyRate(lawyer.getHourlyRate())
                .averageRating(lawyer.getAverageRating())
                .build();
    }

    private PaymentDTO paymentToDTO(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .consultationId(payment.getConsultation().getId())
                .amount(payment.getAmount())
                .status(payment.getStatus().toString())
                .invoiceUrl(payment.getInvoiceUrl())
                .refundReason(payment.getRefundReason())
                .build();
    }
}
