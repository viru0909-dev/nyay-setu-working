package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.ProfileRequest;
import com.nyaysetu.backend.entity.UserProfile;
import com.nyaysetu.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/create-or-update")
    public ResponseEntity<?> createOrUpdate(@RequestBody ProfileRequest request) {
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
}