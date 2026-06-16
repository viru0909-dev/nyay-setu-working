package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.entity.HearingStatus;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.notification.service.NotificationService;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.CaseAccessService;
import com.nyaysetu.backend.service.HearingService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.TestingAuthenticationToken;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HearingControllerTest {

    @Test
    void joinHearingResolvesEmailPrincipalToUserId() {
        UUID hearingId = UUID.randomUUID();
        FakeHearingService hearingService = new FakeHearingService(hearingId);
        HearingController controller = new HearingController(
                hearingService,
                new FakeNotificationService(),
                new FakeAuthService(),
                new FakeCaseAccessService()
        );

        ResponseEntity<Map<String, Object>> response = controller.joinHearing(
                hearingId,
                new TestingAuthenticationToken("litigant@example.com", null)
        );

        assertEquals(200, response.getStatusCode().value());
        assertEquals(42L, hearingService.authorizedUserId);
        assertEquals(42L, hearingService.joinedUserId);
    }

    @Test
    void leaveHearingResolvesEmailPrincipalToUserId() {
        UUID hearingId = UUID.randomUUID();
        FakeHearingService hearingService = new FakeHearingService(hearingId);
        HearingController controller = new HearingController(
                hearingService,
                new FakeNotificationService(),
                new FakeAuthService(),
                new FakeCaseAccessService()
        );

        ResponseEntity<Void> response = controller.leaveHearing(
                hearingId,
                new TestingAuthenticationToken("litigant@example.com", null)
        );

        assertEquals(200, response.getStatusCode().value());
        assertEquals(42L, hearingService.leftUserId);
    }

    private static class FakeHearingService extends HearingService {
        private final UUID hearingId;
        Long authorizedUserId;
        Long joinedUserId;
        Long leftUserId;

        FakeHearingService(UUID hearingId) {
            super(null, null, null, null, null);
            this.hearingId = hearingId;
        }

        @Override
        public boolean canUserJoinHearing(UUID hearingId, Long userId) {
            this.authorizedUserId = userId;
            return true;
        }

        @Override
        public void joinHearing(UUID hearingId, Long userId) {
            this.joinedUserId = userId;
        }

        @Override
        public void leaveHearing(UUID hearingId, Long userId) {
            this.leftUserId = userId;
        }

        @Override
        public Hearing getHearing(UUID hearingId) {
            return Hearing.builder()
                    .id(this.hearingId)
                    .videoRoomId("room-42")
                    .status(HearingStatus.IN_PROGRESS)
                    .build();
        }
    }

    private static class FakeNotificationService extends NotificationService {
        FakeNotificationService() {
            super(null, null);
        }
    }

    private static class FakeAuthService extends AuthService {
        FakeAuthService() {
            super(null, null);
        }

        @Override
        public User findByEmail(String email) {
            return User.builder()
                    .id(42L)
                    .email(email)
                    .name("Litigant User")
                    .role(Role.LITIGANT)
                    .build();
        }
    }

    // CaseAccessService has exactly ONE constructor arg: CaseRepository
    private static class FakeCaseAccessService extends CaseAccessService {
        FakeCaseAccessService() {
            super(null);
        }
    }
}
