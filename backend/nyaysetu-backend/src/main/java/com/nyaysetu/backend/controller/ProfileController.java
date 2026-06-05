package com.nyaysetu.backend.controller;

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
}