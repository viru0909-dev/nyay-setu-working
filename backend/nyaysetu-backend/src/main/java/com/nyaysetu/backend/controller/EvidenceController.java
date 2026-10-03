package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.UploadEvidenceResponse;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;

import com.nyaysetu.backend.service.CaseAccessService;

import com.nyaysetu.backend.service.EvidenceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**

 * REST Controller for uploading and retrieving evidence linked to a legal case.
 *
 * <p><b>Security note (CVE-class: IDOR / Broken Object-Level Authorization):</b>
 * The uploader identity is derived <em>server-side</em> from the authenticated
 * JWT principal via {@code @AuthenticationPrincipal}, NOT from a client-supplied
 * request parameter. This prevents evidence impersonation — where an attacker
 * could attribute an upload to any user (e.g. a judge or police officer) by
 * simply changing an {@code uploaderId} form field. See the
 * {@code uploaderId} fix commit for full context.</p>

 * Controller for evidence upload and management operations.
 * Protected with centralized Role-Based Access Control method-level security interceptors.

 */
@Tag(name = "Evidence", description = "Upload evidence files linked to a case")
@RestController
@RequestMapping("/cases/{caseId}/evidence")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('POLICE', 'JUDGE', 'SUPER_JUDGE', 'LAWYER', 'ADMIN')")
public class EvidenceController {

    private final EvidenceService evidenceService;
    private final AuthService authService;


    /**
     * Upload an evidence file and associate it with the given case.
     *
     * <p>The authenticated user's ID is resolved from the JWT token held in the
     * {@code SecurityContextHolder} — never from client input. This ensures the
     * {@code uploadedBy} field on {@link com.nyaysetu.backend.entity.CaseEvidence}
     * always reflects the real uploader, preserving chain-of-custody integrity.</p>
     *
     * @param caseId      the case to attach evidence to
     * @param file        the evidence file
     * @param userDetails injected by Spring Security from the validated JWT
     * @return the filename and URL of the uploaded evidence

    private final CaseAccessService caseAccessService;

    /**
     * Securely upload an evidence multi-part file linked to a valid case caseId token.

     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadEvidenceResponse uploadEvidence(
            @PathVariable UUID caseId,
            @RequestParam("file") MultipartFile file,

            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Resolve the authenticated user's database ID from the JWT principal.
        // The JWT subject stores the user's email; AuthService maps that to the
        // full User entity which carries the numeric primary key.
        User user = authService.findByEmail(userDetails.getUsername());

        // Pass the server-verified user ID — never accept it from the client.

            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(caseId, user);

        return evidenceService.upload(caseId, file, user.getId());
    }
}
