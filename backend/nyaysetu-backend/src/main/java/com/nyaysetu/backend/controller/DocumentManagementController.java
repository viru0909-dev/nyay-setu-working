package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.DocumentDto;
import com.nyaysetu.backend.dto.CaseSummaryDto;
import com.nyaysetu.backend.dto.UploadDocumentRequest;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.CaseManagementService;
import com.nyaysetu.backend.service.DocumentManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentManagementController {

    private final DocumentManagementService documentManagementService;
    private final CaseManagementService caseManagementService;
    private final AuthService authService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "OTHER") String category,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            Authentication authentication
    ) {
        try {
            User user = authService.findByEmail(authentication.getName());
            
            UploadDocumentRequest request = UploadDocumentRequest.builder()
                    .category(category)
                    .description(description)
                    .caseId(null)  // Always null for now
                    .build();

            DocumentDto document = documentManagementService.uploadDocument(file, request, user);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getUserDocuments(Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        List<DocumentDto> documents = documentManagementService.getUserDocuments(user.getId());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/user/cases")
    public ResponseEntity<List<CaseSummaryDto>> getUserCases(Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        List<CaseSummaryDto> cases = caseManagementService.getUserCaseSummaries(user);
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<DocumentDto>> getCaseDocuments(@PathVariable UUID caseId) {
        List<DocumentDto> documents = documentManagementService.getCaseDocuments(caseId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocument(@PathVariable UUID id) {
        DocumentDto document = documentManagementService.getDocumentById(id);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID id) {
        DocumentDto metadata = documentManagementService.getDocumentById(id);
        Resource resource = documentManagementService.downloadDocument(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        documentManagementService.deleteDocument(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
    }
}
