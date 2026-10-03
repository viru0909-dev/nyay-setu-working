package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.repository.HearingParticipantRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VirtualHearingAccessService {

    private static final SecureRandom SECURE_RANDOM =
            new SecureRandom();

    private final HearingRepository hearingRepository;
    private final HearingParticipantRepository participantRepository;
    private final UserRepository userRepository;

    @Transactional
    public JudgeAccessResult startHearing(
            UUID hearingId,
            String judgeEmail
    ) {
        Hearing hearing = requireHearing(hearingId);
        User judge = requireUser(judgeEmail);

        requireJudgeAccess(hearing, judge);

        if (hearing.getStatus() == HearingStatus.COMPLETED ||
                hearing.getStatus() == HearingStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The hearing has already ended"
            );
        }

        hearing.setStatus(HearingStatus.IN_PROGRESS);
        hearingRepository.save(hearing);

        return new JudgeAccessResult(
                hearing.getId(),
                hearing.getVideoRoomId(),
                hearing.getStatus()
        );
    }

    @Transactional
    public JoinRequestResult requestJoin(
            UUID hearingId,
            String userEmail
    ) {
        Hearing hearing = requireHearing(hearingId);
        User user = requireUser(userEmail);

        if (hearing.getStatus() == HearingStatus.COMPLETED ||
                hearing.getStatus() == HearingStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "The hearing is no longer available"
            );
        }

        LocalDateTime now = LocalDateTime.now();
        int durationMinutes =
                hearing.getDurationMinutes() == null
                        ? 60
                        : hearing.getDurationMinutes();

        LocalDateTime earliestRequestTime =
                hearing.getScheduledDate().minusMinutes(15);

        LocalDateTime latestAccessTime =
                hearing.getScheduledDate()
                        .plusMinutes(durationMinutes + 30L);

        if (hearing.getStatus() == HearingStatus.SCHEDULED &&
                now.isBefore(earliestRequestTime)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The waiting room opens 15 minutes before the hearing"
            );
        }

        if (!latestAccessTime.isAfter(now)) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "The hearing access window has expired"
            );
        }

        HearingParticipant participant = participantRepository
                .findByHearingIdAndUserId(hearingId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not an invited participant"
                ));

        ParticipantAdmissionStatus currentStatus =
                participant.getAdmissionStatus();

        if (currentStatus == ParticipantAdmissionStatus.REJECTED) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your request to join was rejected"
            );
        }

        if (currentStatus == ParticipantAdmissionStatus.EXPIRED) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "Your hearing access has expired"
            );
        }

        String rawToken = generateAccessToken();

        participant.setAccessTokenHash(hashToken(rawToken));
        participant.setAccessTokenExpiresAt(
                calculateTokenExpiry(hearing)
        );
        participant.setRequestedAt(now);
        participant.setRejectedAt(null);

        if (currentStatus != ParticipantAdmissionStatus.ADMITTED) {
            participant.setAdmissionStatus(
                    ParticipantAdmissionStatus.WAITING
            );
            participant.setAdmittedAt(null);
        }

        participantRepository.save(participant);

        return new JoinRequestResult(
                rawToken,
                participant.getAdmissionStatus(),
                participant.getAccessTokenExpiresAt()
        );
    }

    @Transactional
    public JoinAccessResult getJoinAccess(
            UUID hearingId,
            String userEmail,
            String accessToken
    ) {
        Hearing hearing = requireHearing(hearingId);
        User user = requireUser(userEmail);

        HearingParticipant participant = participantRepository
                .findByHearingIdAndUserId(hearingId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not an invited participant"
                ));

        verifyAccessToken(participant, accessToken);

        if (hearing.getStatus() == HearingStatus.COMPLETED ||
                hearing.getStatus() == HearingStatus.CANCELLED) {
            expireParticipant(participant);

            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "The hearing has ended"
            );
        }

        if (participant.getAdmissionStatus() ==
                ParticipantAdmissionStatus.REJECTED) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your request to join was rejected"
            );
        }

        if (participant.getAdmissionStatus() !=
                ParticipantAdmissionStatus.ADMITTED ||
                hearing.getStatus() != HearingStatus.IN_PROGRESS) {
            return new JoinAccessResult(
                    participant.getAdmissionStatus(),
                    null
            );
        }

        if (participant.getJoinedAt() == null) {
            participant.setJoinedAt(LocalDateTime.now());
            participantRepository.save(participant);
        }

        return new JoinAccessResult(
                participant.getAdmissionStatus(),
                hearing.getVideoRoomId()
        );
    }

    public List<HearingParticipant> getWaitingParticipants(
            UUID hearingId,
            String judgeEmail
    ) {
        Hearing hearing = requireHearing(hearingId);
        User judge = requireUser(judgeEmail);

        requireJudgeAccess(hearing, judge);

        return participantRepository
                .findByHearingIdAndAdmissionStatus(
                        hearingId,
                        ParticipantAdmissionStatus.WAITING
                );
    }

    @Transactional
    public HearingParticipant admitParticipant(
            UUID hearingId,
            UUID participantId,
            String judgeEmail
    ) {
        Hearing hearing = requireHearing(hearingId);
        User judge = requireUser(judgeEmail);

        requireJudgeAccess(hearing, judge);

        if (hearing.getStatus() != HearingStatus.IN_PROGRESS) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Start the hearing before admitting participants"
            );
        }

        HearingParticipant participant =
                requireParticipant(hearingId, participantId);

        if (participant.getAdmissionStatus() !=
                ParticipantAdmissionStatus.WAITING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The participant is not waiting"
            );
        }

        participant.setAdmissionStatus(
                ParticipantAdmissionStatus.ADMITTED
        );
        participant.setAdmittedAt(LocalDateTime.now());
        participant.setRejectedAt(null);

        return participantRepository.save(participant);
    }

    @Transactional
    public HearingParticipant rejectParticipant(
            UUID hearingId,
            UUID participantId,
            String judgeEmail
    ) {
        Hearing hearing = requireHearing(hearingId);
        User judge = requireUser(judgeEmail);

        requireJudgeAccess(hearing, judge);

        HearingParticipant participant =
                requireParticipant(hearingId, participantId);

        if (participant.getAdmissionStatus() !=
                ParticipantAdmissionStatus.WAITING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The participant is not waiting"
            );
        }

        participant.setAdmissionStatus(
                ParticipantAdmissionStatus.REJECTED
        );
        participant.setRejectedAt(LocalDateTime.now());

        // Keep the participant token valid until its normal expiry so the
        // client can securely poll and receive the rejected status.
        return participantRepository.save(participant);
    }

    @Transactional
    public Hearing endHearing(
            UUID hearingId,
            String judgeEmail
    ) {
        Hearing hearing = requireHearing(hearingId);
        User judge = requireUser(judgeEmail);

        requireJudgeAccess(hearing, judge);

        hearing.setStatus(HearingStatus.COMPLETED);
        hearingRepository.save(hearing);

        List<HearingParticipant> participants =
                participantRepository.findByHearingId(hearingId);

        for (HearingParticipant participant : participants) {
            expireParticipant(participant);
        }

        participantRepository.saveAll(participants);

        return hearing;
    }

    private HearingParticipant requireParticipant(
            UUID hearingId,
            UUID participantId
    ) {
        HearingParticipant participant = participantRepository
                .findById(participantId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Participant not found"
                ));

        if (participant.getHearing() == null ||
                !hearingId.equals(
                        participant.getHearing().getId()
                )) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Participant not found for this hearing"
            );
        }

        return participant;
    }

    private Hearing requireHearing(UUID hearingId) {
        return hearingRepository.findById(hearingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Hearing not found"
                ));
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user was not found"
                ));
    }

    private void requireJudgeAccess(
            Hearing hearing,
            User user
    ) {
        String role = user.getRole().name();

        if ("ADMIN".equals(role) ||
                "SUPER_JUDGE".equals(role)) {
            return;
        }

        if (!"JUDGE".equals(role)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Judge access is required"
            );
        }

        Long assignedJudgeId =
                hearing.getCaseEntity() == null
                        ? null
                        : hearing.getCaseEntity().getJudgeId();

        if (assignedJudgeId == null ||
                !assignedJudgeId.equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the assigned judge can manage this hearing"
            );
        }
    }

    private void verifyAccessToken(
            HearingParticipant participant,
            String rawToken
    ) {
        if (rawToken == null || rawToken.isBlank() ||
                participant.getAccessTokenHash() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid participant access token"
            );
        }

        String suppliedHash = hashToken(rawToken);

        boolean matches = MessageDigest.isEqual(
                participant.getAccessTokenHash().getBytes(
                        StandardCharsets.UTF_8
                ),
                suppliedHash.getBytes(StandardCharsets.UTF_8)
        );

        if (!matches) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid participant access token"
            );
        }

        LocalDateTime expiresAt =
                participant.getAccessTokenExpiresAt();

        if (expiresAt == null ||
                !expiresAt.isAfter(LocalDateTime.now())) {
            expireParticipant(participant);
            participantRepository.save(participant);

            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "Participant access token has expired"
            );
        }
    }

    private LocalDateTime calculateTokenExpiry(
            Hearing hearing
    ) {
        int duration = hearing.getDurationMinutes() == null
                ? 60
                : hearing.getDurationMinutes();

        return hearing.getScheduledDate()
                .plusMinutes(duration + 30L);
    }
    private void expireParticipant(
            HearingParticipant participant
    ) {
        participant.setAdmissionStatus(
                ParticipantAdmissionStatus.EXPIRED
        );
        participant.setAccessTokenHash(null);
        participant.setAccessTokenExpiresAt(LocalDateTime.now());
    }

    private String generateAccessToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            return java.util.HexFormat.of().formatHex(
                    digest.digest(
                            rawToken.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    )
            );
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable",
                    ex
            );
        }
    }

    public record JudgeAccessResult(
            UUID hearingId,
            String videoRoomId,
            HearingStatus status
    ) {
    }

    public record JoinRequestResult(
            String accessToken,
            ParticipantAdmissionStatus status,
            LocalDateTime expiresAt
    ) {
    }

    public record JoinAccessResult(
            ParticipantAdmissionStatus status,
            String videoRoomId
    ) {
    }
}