package com.nyaysetu.backend.service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.nyaysetu.backend.entity.Consultation;
import com.nyaysetu.backend.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ZoomMeetingService {
    private final ConsultationRepository consultationRepository;
    private final WebClient webClient;
    private final Gson gson;

    @Value("${zoom.account.id}")
    private String zoomAccountId;

    @Value("${zoom.client.id}")
    private String zoomClientId;

    @Value("${zoom.client.secret}")
    private String zoomClientSecret;

    @Value("${zoom.jwt.secret}")
    private String zoomJwtSecret;

    public String createZoomMeeting(Long consultationId, String topic, 
                                    LocalDateTime startTime, Integer durationMinutes) {
        try {
            String zoomUserId = "me";
            String accessToken = generateZoomAccessToken();

            JsonObject meetingPayload = createMeetingPayload(topic, startTime, durationMinutes);

            String response = webClient.post()
                    .uri("https://api.zoom.us/v2/users/{userId}/meetings", zoomUserId)
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .bodyValue(meetingPayload.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonObject meetingResponse = gson.fromJson(response, JsonObject.class);
            String meetingId = meetingResponse.get("id").getAsString();
            String meetingUrl = meetingResponse.get("join_url").getAsString();

            // Update consultation with Zoom meeting details
            Consultation consultation = consultationRepository.findById(consultationId)
                    .orElseThrow(() -> new IllegalArgumentException("Consultation not found"));

            consultation.setZoomMeetingId(meetingId);
            consultation.setZoomMeetingUrl(meetingUrl);
            consultation.setUpdatedAt(System.currentTimeMillis());
            consultationRepository.save(consultation);

            log.info("Zoom meeting created - Consultation ID: {}, Meeting ID: {}, URL: {}", 
                    consultationId, meetingId, meetingUrl);

            return meetingUrl;
        } catch (Exception e) {
            log.error("Error creating Zoom meeting for consultation {}", consultationId, e);
            throw new RuntimeException("Failed to create Zoom meeting: " + e.getMessage());
        }
    }

    public void endZoomMeeting(String meetingId) {
        try {
            String accessToken = generateZoomAccessToken();

            webClient.put()
                    .uri("https://api.zoom.us/v2/meetings/{meetingId}/status", meetingId)
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .bodyValue("{\"action\":\"end\"}")
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            log.info("Zoom meeting ended - Meeting ID: {}", meetingId);
        } catch (Exception e) {
            log.warn("Error ending Zoom meeting {}", meetingId, e);
        }
    }

    private String generateZoomAccessToken() {
        try {
            long issuedAt = System.currentTimeMillis() / 1000;
            long expiresAt = issuedAt + 3600; // 1 hour validity

            String headerPayload = Base64.getEncoder().encodeToString(
                    String.format("{\"alg\":\"HS256\",\"typ\":\"JWT\"}").getBytes()
            );

            String claimsPayload = Base64.getEncoder().encodeToString(
                    String.format(
                            "{\"iss\":\"%s\",\"sub\":\"%s\",\"iat\":%d,\"exp\":%d}",
                            zoomClientId, zoomAccountId, issuedAt, expiresAt
                    ).getBytes()
            );

            String signature = generateHmacSha256(
                    headerPayload + "." + claimsPayload,
                    zoomClientSecret
            );

            String jwt = headerPayload + "." + claimsPayload + "." + signature;

            // Exchange JWT for access token
            String tokenResponse = webClient.post()
                    .uri("https://zoom.us/oauth/token")
                    .header("Authorization", "Basic " + Base64.getEncoder()
                            .encodeToString((zoomClientId + ":" + zoomClientSecret).getBytes()))
                    .bodyValue("grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + jwt)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonObject tokenObj = gson.fromJson(tokenResponse, JsonObject.class);
            return tokenObj.get("access_token").getAsString();
        } catch (Exception e) {
            log.error("Error generating Zoom access token", e);
            throw new RuntimeException("Failed to generate Zoom token");
        }
    }

    private JsonObject createMeetingPayload(String topic, LocalDateTime startTime, Integer durationMinutes) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
                .withZone(ZoneId.of("Asia/Kolkata"));

        JsonObject meeting = new JsonObject();
        meeting.addProperty("topic", topic);
        meeting.addProperty("type", 2); // Scheduled meeting
        meeting.addProperty("start_time", startTime.format(formatter));
        meeting.addProperty("duration", durationMinutes);
        meeting.addProperty("timezone", "Asia/Kolkata");
        meeting.addProperty("password", generateRandomPassword(8));

        JsonObject settings = new JsonObject();
        settings.addProperty("host_video", true);
        settings.addProperty("participant_video", true);
        settings.addProperty("cn_meeting", false);
        settings.addProperty("in_meeting", false);
        settings.addProperty("join_before_host", false);
        settings.addProperty("mute_upon_entry", true);
        settings.addProperty("watermark", false);
        settings.addProperty("use_pmi", false);
        settings.addProperty("approval_type", 0); // Automatically approve
        settings.addProperty("audio", "both");
        settings.addProperty("auto_recording", "cloud");
        settings.addProperty("waiting_room", false);

        meeting.add("settings", settings);

        return meeting;
    }

    private String generateHmacSha256(String data, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = 
                    new javax.crypto.spec.SecretKeySpec(secret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC signature", e);
        }
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < length; i++) {
            password.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return password.toString();
    }
}
