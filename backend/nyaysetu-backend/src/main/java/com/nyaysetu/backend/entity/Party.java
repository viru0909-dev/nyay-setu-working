package com.nyaysetu.backend.entity;

import lombok.*;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Party {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    private UUID legalCaseId;

    private String name;

    private String role;
}
