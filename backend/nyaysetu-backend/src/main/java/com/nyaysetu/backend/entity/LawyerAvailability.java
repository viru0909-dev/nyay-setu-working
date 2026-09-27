package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "lawyer_availabilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawyerAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private User lawyer;

    @Column(nullable = false)
    private LocalDate date;

    private String reason; // e.g. "Vacation", "Supreme Court Hearing", "Personal Leave"

    @Builder.Default
    @Column(nullable = false)
    private Boolean isAvailable = false; // false = unavailable, true = available
}
