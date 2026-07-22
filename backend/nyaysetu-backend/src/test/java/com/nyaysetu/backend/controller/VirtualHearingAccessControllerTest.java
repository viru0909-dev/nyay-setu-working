package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.HearingStatus;
import com.nyaysetu.backend.entity.ParticipantAdmissionStatus;
import com.nyaysetu.backend.service.VirtualHearingAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VirtualHearingAccessControllerTest {

    @Mock
    private VirtualHearingAccessService accessService;

    private VirtualHearingAccessController controller;

    @BeforeEach
    void setUp() {
        controller = new VirtualHearingAccessController(
                accessService
        );
    }

    @Test
    void waitingResponseDoesNotExposeRoomId() {
        UUID hearingId = UUID.randomUUID();

        when(accessService.requestJoin(
                hearingId,
                "party@example.com"
        )).thenReturn(
                new VirtualHearingAccessService.JoinRequestResult(
                        "participant-token",
                        ParticipantAdmissionStatus.WAITING,
                        LocalDateTime.now().plusHours(1)
                )
        );

        var response = controller.requestJoin(
                hearingId,
                new TestingAuthenticationToken(
                        "party@example.com",
                        null
                )
        );

        assertEquals(202, response.getStatusCode().value());
        assertEquals(
                ParticipantAdmissionStatus.WAITING,
                response.getBody().get("status")
        );
        assertFalse(
                response.getBody().containsKey("videoRoomId")
        );
    }

    @Test
    void joinAccessExposesRoomOnlyAfterAdmission() {
        UUID hearingId = UUID.randomUUID();

        when(accessService.getJoinAccess(
                hearingId,
                "party@example.com",
                "participant-token"
        )).thenReturn(
                new VirtualHearingAccessService.JoinAccessResult(
                        ParticipantAdmissionStatus.ADMITTED,
                        "secure-room-id"
                )
        );

        var response = controller.joinAccess(
                hearingId,
                "participant-token",
                new TestingAuthenticationToken(
                        "party@example.com",
                        null
                )
        );

        Map<String, Object> body = response.getBody();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(body);
        assertEquals(
                ParticipantAdmissionStatus.ADMITTED,
                body.get("status")
        );
        assertEquals(
                "secure-room-id",
                body.get("videoRoomId")
        );
    }

    @Test
    void startReturnsRoomToJudge() {
        UUID hearingId = UUID.randomUUID();

        when(accessService.startHearing(
                hearingId,
                "judge@example.com"
        )).thenReturn(
                new VirtualHearingAccessService.JudgeAccessResult(
                        hearingId,
                        "judge-room-id",
                        HearingStatus.IN_PROGRESS
                )
        );

        var response = controller.start(
                hearingId,
                new TestingAuthenticationToken(
                        "judge@example.com",
                        null
                )
        );

        assertEquals(200, response.getStatusCode().value());
        assertEquals(
                "judge-room-id",
                response.getBody().get("videoRoomId")
        );
        assertEquals(
                HearingStatus.IN_PROGRESS,
                response.getBody().get("status")
        );
    }
}