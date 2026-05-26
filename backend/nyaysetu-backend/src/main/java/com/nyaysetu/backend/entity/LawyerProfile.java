package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "lawyer_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawyerProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Integer yearsOfExperience;

    private Double hourlyRate;

    @ElementCollection
    @CollectionTable(name = "lawyer_specializations", joinColumns = @JoinColumn(name = "lawyer_id"))
    @Column(name = "specialization")
    private List<String> specializations;

    private Double averageRating;

    private Integer totalRatings;

    @Column(nullable = false)
    private Boolean verified;

    private String zoomUserId;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active;

    private String profileImageUrl;
}
