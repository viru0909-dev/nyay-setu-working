package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.DocumentDto;
import com.nyaysetu.backend.dto.UploadDocumentRequest;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
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
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentManagementController {

    private final DocumentManagementService documentManagementService;
    private final AuthService authService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentDto> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "caseId", required = false) UUID caseId,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());

        UploadDocumentRequest request = UploadDocumentRequest.builder()
                .category(category)
                .description(description)
                .caseId(caseId)
                .build();

        DocumentDto document = documentManagementService.uploadDocument(file, request, user);
        return ResponseEntity.ok(document);
    }

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getUserDocuments(Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        List<DocumentDto> documents = documentManagementService.getUserDocuments(user.getId());
        return ResponseEntity.ok(documents);
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
