package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courtrooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Courtroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "room_number", nullable = false, unique = true, length = 50)
    private String roomNumber;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, MAINTENANCE, INACTIVE
}
