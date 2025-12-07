package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.UploadEvidenceResponse;
import com.nyaysetu.backend.entity.CaseEvidence;
import com.nyaysetu.backend.entity.LegalCase;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.CaseEvidenceRepository;
import com.nyaysetu.backend.repository.LegalCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EvidenceService {

    private final CaseEvidenceRepository evidenceRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final CaseTimelineService timelineService;

    private final String uploadDir = "uploads/evidence/";

    @Transactional
    public UploadEvidenceResponse upload(UUID caseId, MultipartFile file, UUID uploaderId) {

        LegalCase lc = legalCaseRepository.findById(caseId)
                .orElseThrow(() -> new NotFoundException("Case not found " + caseId));

        File folder = new File(uploadDir);
        if (!folder.exists()) folder.mkdirs();

        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File savedFile = new File(folder, filename);

        try (FileOutputStream fos = new FileOutputStream(savedFile)) {
            fos.write(file.getBytes());
        } catch (Exception e) {
            throw new RuntimeException("File upload failed");
        }

        CaseEvidence evidence = CaseEvidence.builder()
                .legalCaseId(caseId)
                .fileName(filename)
                .fileUrl("/files/evidence/" + filename)
                .uploadedBy(uploaderId)
                .build();

        evidenceRepository.save(evidence);

        timelineService.addEvent(caseId, "Evidence uploaded: " + filename);

        return new UploadEvidenceResponse(filename, evidence.getFileUrl());
    }

    public List<CaseEvidence> getEvidence(UUID caseId) {
        return evidenceRepository.findByLegalCaseId(caseId);
    }
}