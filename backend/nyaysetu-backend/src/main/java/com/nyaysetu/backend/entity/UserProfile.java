package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_profile")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to user entity (assumes User entity has id field Long)
    private Long userId;

    private String address;
    private String phone;
    private String city;
    private String state;
    private String country;

    // store face embedding id or a flag that face is registered
    @Builder.Default
    private Boolean faceRegistered = false;

    @Lob
    private byte[] profilePicture; // optional raw bytes - can be big; prefer storing path in prod
}