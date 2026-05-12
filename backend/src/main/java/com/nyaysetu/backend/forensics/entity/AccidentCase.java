package com.nyaysetu.backend.forensics.entity;

import com.nyaysetu.backend.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "accident_cases")
@Data
@EntityListeners(AuditingEntityListener.class)
public class AccidentCase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ElementCollection
    @CollectionTable(name = "accident_case_videos", joinColumns = @JoinColumn(name = "accident_case_id"))
    @Column(name = "video_path")
    private List<String> videoStoragePaths;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(columnDefinition = "TEXT")
    private String timelineJson;

    @Column(columnDefinition = "TEXT")
    private String liabilityReport;

    @ElementCollection
    @CollectionTable(name = "accident_case_sections", joinColumns = @JoinColumn(name = "accident_case_id"))
    @Column(name = "applicable_section")
    private List<String> applicableSections;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Status {
        UPLOADED,
        PROCESSING,
        COMPLETE,
        FAILED
    }
}
