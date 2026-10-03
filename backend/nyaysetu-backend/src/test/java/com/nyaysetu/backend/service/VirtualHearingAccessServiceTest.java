package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.entity.HearingParticipant;
import com.nyaysetu.backend.entity.HearingStatus;
import com.nyaysetu.backend.entity.ParticipantAdmissionStatus;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.HearingParticipantRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import com.nyaysetu.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VirtualHearingAccessServiceTest {

    @Mock
    private HearingRepository hearingRepository;

    @Mock
    private HearingParticipantRepository participantRepository;

    @Mock
    private UserRepository userRepository;

    private VirtualHearingAccessService service;

    @BeforeEach
    void setUp() {
        service = new VirtualHearingAccessService(
                hearingRepository,
                participantRepository,
                userRepository
        );

        lenient().when(hearingRepository.save(any(Hearing.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        lenient().when(participantRepository.save(any(HearingParticipant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void joinRequestPlacesInvitedParticipantInWaitingRoom() {
        UUID hearingId = UUID.randomUUID();
        User participantUser = user(
                20L,
                "party@example.com",
                Role.LITIGANT
        );

        Hearing hearing = hearing(
                hearingId,
                HearingStatus.SCHEDULED,
                10L
        );

        HearingParticipant participant = HearingParticipant.builder()
                .id(UUID.randomUUID())
                .hearing(hearing)
                .user(participantUser)
                .admissionStatus(
                        ParticipantAdmissionStatus.INVITED
                )
                .build();

        lenient().when(hearingRepository.findById(hearingId))
                .thenReturn(Optional.of(hearing));

        lenient().when(userRepository.findByEmail("party@example.com"))
                .thenReturn(Optional.of(participantUser));

        lenient().when(participantRepository.findByHearingIdAndUserId(
                hearingId,
                20L
        )).thenReturn(Optional.of(participant));

        var result = service.requestJoin(
                hearingId,
                "party@example.com"
        );

        assertEquals(
                ParticipantAdmissionStatus.WAITING,
                result.status()
        );
        assertNotNull(result.accessToken());
        assertFalse(result.accessToken().isBlank());
        assertNotNull(participant.getAccessTokenHash());
        assertEquals(64, participant.getAccessTokenHash().length());
        assertNotEquals(
                result.accessToken(),
                participant.getAccessTokenHash()
        );
        assertNotNull(participant.getRequestedAt());
        assertNotNull(participant.getAccessTokenExpiresAt());
    }

    @Test
    void participantReceivesRoomOnlyAfterJudgeAdmitsThem() {
        UUID hearingId = UUID.randomUUID();
        UUID participantId = UUID.randomUUID();

        User judge = user(
                10L,
                "judge@example.com",
                Role.JUDGE
        );

        User participantUser = user(
                20L,
                "party@example.com",
                Role.LITIGANT
        );

        Hearing hearing = hearing(
                hearingId,
                HearingStatus.SCHEDULED,
                10L
        );

        HearingParticipant participant = HearingParticipant.builder()
                .id(participantId)
                .hearing(hearing)
                .user(participantUser)
                .admissionStatus(
                        ParticipantAdmissionStatus.INVITED
                )
                .build();

        lenient().when(hearingRepository.findById(hearingId))
                .thenReturn(Optional.of(hearing));

        lenient().when(userRepository.findByEmail("party@example.com"))
                .thenReturn(Optional.of(participantUser));

        lenient().when(userRepository.findByEmail("judge@example.com"))
                .thenReturn(Optional.of(judge));

        lenient().when(participantRepository.findByHearingIdAndUserId(
                hearingId,
                20L
        )).thenReturn(Optional.of(participant));

        lenient().when(participantRepository.findById(participantId))
                .thenReturn(Optional.of(participant));

        var requestResult = service.requestJoin(
                hearingId,
                "party@example.com"
        );

        var waitingResult = service.getJoinAccess(
                hearingId,
                "party@example.com",
                requestResult.accessToken()
        );

        assertEquals(
                ParticipantAdmissionStatus.WAITING,
                waitingResult.status()
        );
        assertNull(waitingResult.videoRoomId());

        service.startHearing(
                hearingId,
                "judge@example.com"
        );

        service.admitParticipant(
                hearingId,
                participantId,
                "judge@example.com"
        );

        var admittedResult = service.getJoinAccess(
                hearingId,
                "party@example.com",
                requestResult.accessToken()
        );

        assertEquals(
                ParticipantAdmissionStatus.ADMITTED,
                admittedResult.status()
        );
        assertEquals(
                hearing.getVideoRoomId(),
                admittedResult.videoRoomId()
        );
    }

    @Test
    void nonJudgeCannotStartHearing() {
        UUID hearingId = UUID.randomUUID();

        User litigant = user(
                20L,
                "party@example.com",
                Role.LITIGANT
        );

        Hearing hearing = hearing(
                hearingId,
                HearingStatus.SCHEDULED,
                10L
        );

        lenient().when(hearingRepository.findById(hearingId))
                .thenReturn(Optional.of(hearing));

        lenient().when(userRepository.findByEmail("party@example.com"))
                .thenReturn(Optional.of(litigant));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.startHearing(
                        hearingId,
                        "party@example.com"
                )
        );

        assertEquals(
                HttpStatus.FORBIDDEN,
                exception.getStatusCode()
        );

        assertEquals(
                HearingStatus.SCHEDULED,
                hearing.getStatus()
        );
    }

    @Test
    void endingHearingExpiresAllParticipantTokens() {
        UUID hearingId = UUID.randomUUID();

        User judge = user(
                10L,
                "judge@example.com",
                Role.JUDGE
        );

        Hearing hearing = hearing(
                hearingId,
                HearingStatus.IN_PROGRESS,
                10L
        );

        HearingParticipant participant = HearingParticipant.builder()
                .id(UUID.randomUUID())
                .hearing(hearing)
                .admissionStatus(
                        ParticipantAdmissionStatus.ADMITTED
                )
                .accessTokenHash("temporary-token-hash")
                .accessTokenExpiresAt(
                        LocalDateTime.now().plusHours(1)
                )
                .build();

        lenient().when(hearingRepository.findById(hearingId))
                .thenReturn(Optional.of(hearing));

        lenient().when(userRepository.findByEmail("judge@example.com"))
                .thenReturn(Optional.of(judge));

        lenient().when(participantRepository.findByHearingId(hearingId))
                .thenReturn(List.of(participant));

        service.endHearing(
                hearingId,
                "judge@example.com"
        );

        assertEquals(
                HearingStatus.COMPLETED,
                hearing.getStatus()
        );

        assertEquals(
                ParticipantAdmissionStatus.EXPIRED,
                participant.getAdmissionStatus()
        );

        assertNull(participant.getAccessTokenHash());
        assertNotNull(participant.getAccessTokenExpiresAt());

        verify(participantRepository).saveAll(
                List.of(participant)
        );
    }

    @Test
    void separateParticipantsReceiveDifferentAccessTokens() {
        UUID hearingId = UUID.randomUUID();

        Hearing hearing = hearing(
                hearingId,
                HearingStatus.SCHEDULED,
                10L
        );

        User firstUser = user(
                20L,
                "first@example.com",
                Role.LITIGANT
        );

        User secondUser = user(
                21L,
                "second@example.com",
                Role.LITIGANT
        );

        HearingParticipant firstParticipant =
                HearingParticipant.builder()
                        .hearing(hearing)
                        .user(firstUser)
                        .admissionStatus(
                                ParticipantAdmissionStatus.INVITED
                        )
                        .build();

        HearingParticipant secondParticipant =
                HearingParticipant.builder()
                        .hearing(hearing)
                        .user(secondUser)
                        .admissionStatus(
                                ParticipantAdmissionStatus.INVITED
                        )
                        .build();

        lenient().when(hearingRepository.findById(hearingId))
                .thenReturn(Optional.of(hearing));

        lenient().when(userRepository.findByEmail("first@example.com"))
                .thenReturn(Optional.of(firstUser));

        lenient().when(userRepository.findByEmail("second@example.com"))
                .thenReturn(Optional.of(secondUser));

        lenient().when(participantRepository.findByHearingIdAndUserId(
                hearingId,
                20L
        )).thenReturn(Optional.of(firstParticipant));

        lenient().when(participantRepository.findByHearingIdAndUserId(
                hearingId,
                21L
        )).thenReturn(Optional.of(secondParticipant));

        String firstToken = service.requestJoin(
                hearingId,
                "first@example.com"
        ).accessToken();

        String secondToken = service.requestJoin(
                hearingId,
                "second@example.com"
        ).accessToken();

        assertNotEquals(firstToken, secondToken);
        assertNotEquals(
                firstParticipant.getAccessTokenHash(),
                secondParticipant.getAccessTokenHash()
        );
    }

    private Hearing hearing(
            UUID hearingId,
            HearingStatus status,
            Long judgeId
    ) {
        CaseEntity caseEntity = mock(CaseEntity.class);

        lenient().when(caseEntity.getJudgeId())
                .thenReturn(judgeId);

        return Hearing.builder()
                .id(hearingId)
                .caseEntity(caseEntity)
                .scheduledDate(
                        LocalDateTime.now().minusMinutes(1)
                )
                .durationMinutes(60)
                .status(status)
                .videoRoomId(
                        "nyaysetu-hearing-" + hearingId
                )
                .build();
    }

    private User user(
            Long id,
            String email,
            Role role
    ) {
        User user = mock(User.class);

        lenient().when(user.getId()).thenReturn(id);
        lenient().when(user.getEmail()).thenReturn(email);
        lenient().when(user.getRole()).thenReturn(role);

        return user;
    }
}