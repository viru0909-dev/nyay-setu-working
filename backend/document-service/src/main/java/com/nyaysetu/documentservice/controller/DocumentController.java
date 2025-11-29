package com.nyaysetu.documentservice.controller;

import com.nyaysetu.documentservice.dto.UploadDocumentResponse;
import com.nyaysetu.documentservice.entity.DocumentEntity;
import com.nyaysetu.documentservice.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadDocumentResponse> uploadDocument(
            @RequestParam("caseId") UUID caseId,
            @RequestParam("uploadedBy") UUID uploadedBy,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(documentService.save(file, caseId, uploadedBy));
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<DocumentEntity>> getDocumentsByCase(@PathVariable UUID caseId) {
        return ResponseEntity.ok(documentService.getDocumentsByCase(caseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentEntity> getDocument(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getDocument(id));
    }
}
