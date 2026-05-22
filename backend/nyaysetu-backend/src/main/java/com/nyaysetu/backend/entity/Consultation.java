package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerProfile lawyer;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Column(nullable = false)
    private LocalDateTime scheduledTime;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationStatus status;

    @OneToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    private String zoomMeetingId;

    private String zoomMeetingUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Double lawyerRating;

    @Column(columnDefinition = "TEXT")
    private String clientFeedback;

    @Column(nullable = false)
    private Long createdAt;

    @Column(nullable = false)
    private Long updatedAt;

    public enum ConsultationStatus {
        SCHEDULED, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED
    }
}
