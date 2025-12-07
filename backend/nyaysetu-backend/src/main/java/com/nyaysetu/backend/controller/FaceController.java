package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.face.FaceRecognitionService;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/face")
@RequiredArgsConstructor
public class FaceController {

    private final FaceRecognitionService faceRecognitionService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerFace(@RequestParam("userId") Long userId,
                                          @RequestParam("image") MultipartFile image) throws Exception {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.badRequest().body("User not found");
        }
        byte[] bytes = image.getBytes();
        faceRecognitionService.registerFaceForUser(userId, bytes);
        return ResponseEntity.ok("Face registered");
    }

    @PostMapping("/match")
    public ResponseEntity<?> matchFace(@RequestParam("image") MultipartFile image) throws Exception {
        byte[] bytes = image.getBytes();
        Long matchedUserId = faceRecognitionService.findMatchingUser(bytes, 0.78); // threshold
        if (matchedUserId != null) {
            return ResponseEntity.ok().body(matchedUserId);
        }
        return ResponseEntity.status(404).body("No match");
    }
}