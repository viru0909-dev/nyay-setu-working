package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.entity.HearingParticipant;
import com.nyaysetu.backend.service.VirtualHearingAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/hearings")
@RequiredArgsConstructor
public class VirtualHearingAccessController {

    private final VirtualHearingAccessService accessService;

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{hearingId}/start")
    public ResponseEntity<Map<String, Object>> start(
            @PathVariable UUID hearingId,
            Authentication authentication
    ) {
        var result = accessService.startHearing(
                hearingId,
                authentication.getName()
        );

        return ResponseEntity.ok(Map.of(
                "hearingId", result.hearingId(),
                "status", result.status(),
                "videoRoomId", result.videoRoomId()
        ));
    }

    @PostMapping("/{hearingId}/join-request")
    public ResponseEntity<Map<String, Object>> requestJoin(
            @PathVariable UUID hearingId,
            Authentication authentication
    ) {
        var result = accessService.requestJoin(
                hearingId,
                authentication.getName()
        );

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("hearingId", hearingId);
        body.put("status", result.status());
        body.put("accessToken", result.accessToken());
        body.put("expiresAt", result.expiresAt());
        body.put(
                "message",
                result.status().name().equals("ADMITTED")
                        ? "Access token refreshed"
                        : "You are waiting for the judge to admit you"
        );

        return ResponseEntity.accepted()
                .location(
                        URI.create(
                                "/hearings/" +
                                        hearingId +
                                        "/join-access"
                        )
                )
                .body(body);
    }

    @GetMapping("/{hearingId}/join-access")
    public ResponseEntity<Map<String, Object>> joinAccess(
            @PathVariable UUID hearingId,
            @RequestHeader("X-Hearing-Access-Token")
            String accessToken,
            Authentication authentication
    ) {
        var result = accessService.getJoinAccess(
                hearingId,
                authentication.getName(),
                accessToken
        );

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("hearingId", hearingId);
        body.put("status", result.status());

        if (result.videoRoomId() == null) {
            body.put(
                    "message",
                    "Waiting for the judge to start the hearing and admit you"
            );

            return ResponseEntity.accepted().body(body);
        }

        body.put("videoRoomId", result.videoRoomId());
        body.put("message", "You have been admitted");

        return ResponseEntity.ok(body);
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @GetMapping("/{hearingId}/waiting-room")
    public ResponseEntity<List<Map<String, Object>>> waitingRoom(
            @PathVariable UUID hearingId,
            Authentication authentication
    ) {
        List<Map<String, Object>> response =
                accessService.getWaitingParticipants(
                                hearingId,
                                authentication.getName()
                        )
                        .stream()
                        .map(this::toParticipantResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping(
            "/{hearingId}/participants/{participantId}/admit"
    )
    public ResponseEntity<Map<String, Object>> admit(
            @PathVariable UUID hearingId,
            @PathVariable UUID participantId,
            Authentication authentication
    ) {
        HearingParticipant participant =
                accessService.admitParticipant(
                        hearingId,
                        participantId,
                        authentication.getName()
                );

        return ResponseEntity.ok(
                toParticipantResponse(participant)
        );
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping(
            "/{hearingId}/participants/{participantId}/reject"
    )
    public ResponseEntity<Map<String, Object>> reject(
            @PathVariable UUID hearingId,
            @PathVariable UUID participantId,
            Authentication authentication
    ) {
        HearingParticipant participant =
                accessService.rejectParticipant(
                        hearingId,
                        participantId,
                        authentication.getName()
                );

        return ResponseEntity.ok(
                toParticipantResponse(participant)
        );
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{hearingId}/end")
    public ResponseEntity<Map<String, Object>> end(
            @PathVariable UUID hearingId,
            Authentication authentication
    ) {
        Hearing hearing = accessService.endHearing(
                hearingId,
                authentication.getName()
        );

        return ResponseEntity.ok(Map.of(
                "hearingId", hearing.getId(),
                "status", hearing.getStatus(),
                "message", "Hearing ended and all access tokens expired"
        ));
    }

    private Map<String, Object> toParticipantResponse(
            HearingParticipant participant
    ) {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("participantId", participant.getId());
        response.put("role", participant.getRole());
        response.put(
                "status",
                participant.getAdmissionStatus()
        );
        response.put("requestedAt", participant.getRequestedAt());
        response.put("admittedAt", participant.getAdmittedAt());
        response.put("rejectedAt", participant.getRejectedAt());

        if (participant.getUser() != null) {
            response.put(
                    "userId",
                    participant.getUser().getId()
            );
            response.put(
                    "name",
                    participant.getUser().getName()
            );
            response.put(
                    "email",
                    participant.getUser().getEmail()
            );
        }

        return response;
    }
}