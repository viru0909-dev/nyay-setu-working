package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.LanguagePreferenceRequest;
import com.nyaysetu.backend.dto.ProfileRequest;
import com.nyaysetu.backend.entity.UserProfile;
import com.nyaysetu.backend.service.ProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

@Tag(name = "User Profile", description = "Create and update user profile information and photo")
@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/create-or-update")
    public ResponseEntity<?> createOrUpdate(@Valid  @RequestBody ProfileRequest request) {
        UserProfile p = profileService.createOrUpdate(request);
        return ResponseEntity.ok(p);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getByUserId(@PathVariable Long userId) {
        return profileService.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{userId}/upload-picture")
    public ResponseEntity<?> uploadPicture(@PathVariable Long userId, @RequestParam("file") MultipartFile file) throws Exception {
        profileService.saveProfilePicture(userId, file.getBytes());
        return ResponseEntity.ok("OK");
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAccount(Authentication auth) {
        profileService.deleteUserAccount(auth.getName());
        return ResponseEntity.ok(java.util.Map.of("message", "User account deleted successfully"));
    }

    /**
     * Interface language stored against the signed-in account.
     *
     * <p>{@code language} is null when the user has never chosen one, which tells
     * the frontend to fall back to browser detection.
     */
    @GetMapping("/language")
    public ResponseEntity<?> getLanguage(Authentication auth) {
        String language = profileService.getPreferredLanguage(auth.getName()).orElse(null);
        return ResponseEntity.ok(java.util.Collections.singletonMap("language", language));
    }

    /**
     * Save the interface language for the signed-in account so the choice
     * survives a new device or cleared browser storage.
     */
    @PutMapping("/language")
    public ResponseEntity<?> updateLanguage(@Valid @RequestBody LanguagePreferenceRequest request,
                                            Authentication auth) {
        String saved = profileService.updatePreferredLanguage(auth.getName(), request.getLanguage());
        return ResponseEntity.ok(java.util.Collections.singletonMap("language", saved));
    }
}