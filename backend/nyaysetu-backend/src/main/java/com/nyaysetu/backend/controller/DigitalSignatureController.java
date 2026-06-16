package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.service.DigitalSignatureService;
import com.nyaysetu.backend.service.DigitalSignatureService.SignatureMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/signatures")
@RequiredArgsConstructor
public class DigitalSignatureController {

    private final DigitalSignatureService digitalSignatureService;

    @PostMapping("/sign")
    @PreAuthorize("hasAnyRole('LAWYER', 'LITIGANT')")
    public ResponseEntity<SignatureMetadata> signDocument(
            @RequestParam String documentId) {
        SignatureMetadata metadata = digitalSignatureService.signDocument(documentId);
        return ResponseEntity.ok(metadata);
    }

    @GetMapping("/verify/{signatureHash}")
    @PreAuthorize("hasAnyRole('LAWYER', 'JUDGE', 'LITIGANT')")
    public ResponseEntity<Boolean> verifySignature(@PathVariable String signatureHash) {
        boolean isValid = digitalSignatureService.verifySignature(signatureHash);
        return ResponseEntity.ok(isValid);
    }
}
