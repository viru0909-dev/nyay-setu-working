package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "face_data")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaceData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String faceDescriptor;  // JSON array of face embeddings (128D vector)
    
    @Column(nullable = false)
    private LocalDateTime enrolledAt;
    
    @Column(nullable = false)
    private boolean enabled = true;
    
    @Column
    private LocalDateTime lastUsed;
}
