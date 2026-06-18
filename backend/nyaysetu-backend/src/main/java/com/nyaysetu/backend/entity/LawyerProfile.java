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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "bar_council_number", unique = true)
    private String barCouncilNumber;

    @ElementCollection
    @CollectionTable(name = "lawyer_expertise_tags",
            joinColumns = @JoinColumn(name = "lawyer_profile_id"))
    @Column(name = "tag")
    private List<String> expertiseTags;

    private String city;

    @Column(nullable = false)
    @Builder.Default
    private Double rating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer experienceYears = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer activeCaseCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean available = true;
}