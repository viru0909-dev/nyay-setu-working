package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "meeting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID caseId;

    private String meetingCode;

    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    private MeetingStatus status;

    @ElementCollection
    private List<UUID> participants;
}
