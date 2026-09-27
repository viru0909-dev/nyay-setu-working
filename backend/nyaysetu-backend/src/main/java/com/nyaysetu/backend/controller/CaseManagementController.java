package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CaseDTO;
import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.CaseManagementService;
import com.nyaysetu.backend.service.CaseStateTransitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Case Management", description = "Create, update, retrieve and manage legal cases")
@RestController
@RequestMapping("/cases")
@RequiredArgsConstructor
@Slf4j
public class CaseManagementController {

    private final CaseManagementService caseManagementService;
    private final CaseStateTransitionService caseStateTransitionService;
    private final com.nyaysetu.backend.service.AuthService authService;
    private final com.nyaysetu.backend.service.CaseAccessService caseAccessService;

    @PreAuthorize("hasAnyRole('LAWYER', 'LITIGANT', 'ADMIN')")
    @PostMapping
    public ResponseEntity<CaseDTO> createCase(
            @Valid @RequestBody CreateCaseRequest request,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        CaseDTO caseDTO = caseManagementService.createCase(request, user);
        return ResponseEntity.ok(caseDTO);
    }

    @GetMapping
    public ResponseEntity<Page<CaseDTO>> getMyCases(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        try {
            log.info("Getting cases for user: {}", authentication.getName());
            User user = authService.findByEmail(authentication.getName());
            Page<CaseDTO> cases = caseManagementService.getCasesByUser(user, pageable);
            log.info("Found {} cases for user {}", cases.getTotalElements(), authentication.getName());
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            log.error("Error fetching cases for user {}: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.ok(Page.empty()); // Return empty page instead of error
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseDTO> getCaseById(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        CaseDTO caseDTO = caseManagementService.getCaseById(id);
        return ResponseEntity.ok(caseDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaseDTO> updateCase(
            @PathVariable UUID id,
            @Valid @RequestBody CaseDTO caseDTO,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        CaseDTO updated = caseManagementService.updateCase(id, caseDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCase(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        caseManagementService.deleteCase(id);
        return ResponseEntity.ok(Map.of("message", "Case deleted successfully"));
    }

    /**
     * Handover C: Lawyer submits draft
     */
    @PreAuthorize("hasAnyRole('LAWYER', 'ADMIN')")
    @PostMapping("/{id}/submit-draft")
    public ResponseEntity<Map<String, Object>> submitDraft(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        String draftContent = request.get("draftContent");
        caseManagementService.sendDraftForApproval(id, draftContent);
        return ResponseEntity.ok(Map.of("success", true, "message", "Draft submitted for approval"));
    }

    /**
     * Handover C: Client reviews draft
     */
    @PreAuthorize("hasAnyRole('LITIGANT', 'ADMIN')")
    @PostMapping("/{id}/review-draft")
    public ResponseEntity<Map<String, Object>> reviewDraft(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        boolean approved = Boolean.parseBoolean(request.get("approved").toString());
        String comments = request.get("comments") != null ? request.get("comments").toString() : "";
        
        caseManagementService.approveDraft(id, approved, comments);
        
        return ResponseEntity.ok(Map.of(
            "success", true, 
            "message", approved ? "Draft Approved" : "Changes Requested"
        ));
    }

    @PreAuthorize("hasAnyRole('LITIGANT', 'ADMIN')")
    @PutMapping("/{id}/approve-draft")
    public ResponseEntity<Map<String, Object>> approveDraft(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        boolean approved = Boolean.parseBoolean(request.get("approved").toString());
        String comments = request.get("comments") != null ? request.get("comments").toString() : "";
        
        caseManagementService.approveDraft(id, approved, comments);
        
        return ResponseEntity.ok(Map.of(
            "success", true, 
            "message", approved ? "Draft Approved" : "Changes Requested"
        ));
    }

    /**
     * Handover D: Lawyer files the approved petition in court
     * Routes through CaseStateTransitionService for audit trail and validation.
     */
    @PreAuthorize("hasAnyRole('LAWYER', 'ADMIN')")
    @PostMapping("/{id}/file-in-court")
    public ResponseEntity<Map<String, Object>> fileInCourt(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        CaseEntity result = caseStateTransitionService.lawyerFileInCourt(
            id, user.getId().toString(), user.getName()
        );
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Case filed in court successfully",
            "newStatus", result.getStatus().name()
        ));
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{id}/order-notice")
    public ResponseEntity<Map<String, Object>> orderNotice(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        caseManagementService.orderRespondentNotice(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notice ordered successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{id}/start-hearings")
    public ResponseEntity<Map<String, Object>> startHearings(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        caseManagementService.startHearings(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Hearings started successfully",
            "newStatus", "IN_PROGRESS"
        ));
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{id}/start-evidence")
    public ResponseEntity<Map<String, Object>> startEvidence(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        caseManagementService.startEvidence(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Evidence phase started successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{id}/start-arguments")
    public ResponseEntity<Map<String, Object>> startArguments(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        caseManagementService.startArguments(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Arguments phase started successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{id}/start-judgment")
    public ResponseEntity<Map<String, Object>> startJudgment(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        caseManagementService.startJudgment(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Judgment phase started successfully"
        ));
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{id}/deliver-verdict")
    public ResponseEntity<Map<String, Object>> deliverVerdict(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        String verdictDetails = payload.getOrDefault("verdictDetails", "Final judgment passed.");
        caseManagementService.deliverVerdict(id, verdictDetails);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Verdict delivered successfully",
            "newStatus", "COMPLETED"
        ));
    }

    @PostMapping("/{id}/parties")
    public ResponseEntity<Map<String, Object>> addParty(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        String partyName = request.get("partyName");
        String partyType = request.get("partyType");
        String partyEmail = request.get("partyEmail");
        
        caseManagementService.addPartyToCase(id, partyName, partyType, partyEmail);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Party added successfully"
        ));
    }

    @PutMapping("/{id}/respondent-details")
    public ResponseEntity<Map<String, Object>> updateRespondentDetails(
            @PathVariable UUID id,
            @Valid @RequestBody com.nyaysetu.backend.dto.RespondentDetailsDTO details,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        caseAccessService.requireCaseAccess(id, user);
        caseManagementService.updateRespondentDetails(id, details);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Respondent details updated successfully"
        ));
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.nyaysetu.backend.service.DocumentManagementService documentManagementService;

    @Operation(summary = "Upload supporting document for case", description = "Upload supporting documents (PDF, JPG, PNG up to 10MB) attached to a specific case")
    @PostMapping("/{id}/documents")
    public ResponseEntity<?> uploadCaseDocument(
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "category", defaultValue = "CASE_DOCUMENT") String category,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        try {
            User user = authService.findByEmail(authentication.getName());
            caseAccessService.requireCaseAccess(id, user);

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file cannot be empty"));
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds maximum limit of 10MB"));
            }

            String contentType = file.getContentType();
            String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            if (contentType != null && !contentType.equals("application/pdf") &&
                !contentType.startsWith("image/") && !fileName.endsWith(".pdf") &&
                !fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg") && !fileName.endsWith(".png")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only PDF, JPG, and PNG file formats are supported"));
            }

            String uploadIp = request.getHeader("X-Forwarded-For");
            if (uploadIp == null || uploadIp.isEmpty()) uploadIp = request.getRemoteAddr();

            com.nyaysetu.backend.dto.UploadDocumentRequest uploadRequest = com.nyaysetu.backend.dto.UploadDocumentRequest.builder()
                    .category(category)
                    .description(description)
                    .caseId(id)
                    .build();

            com.nyaysetu.backend.dto.DocumentDto document = documentManagementService.uploadDocument(file, uploadRequest, user, uploadIp);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            log.error("Failed to upload document for case {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
