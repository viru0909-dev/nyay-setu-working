package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.EvidenceHistoryItemDto;
import com.nyaysetu.backend.entity.EvidenceRecord;
import com.nyaysetu.backend.repository.EvidenceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Returns revision/history chain for blockchain evidence records.
 */
@Service
@RequiredArgsConstructor
public class EvidenceHistoryService {

    private final EvidenceRecordRepository evidenceRepository;

    public List<EvidenceHistoryItemDto> getEvidenceHistory(UUID evidenceId) {
        EvidenceRecord record = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found: " + evidenceId));

        UUID caseId = record.getCaseEntity().getId();

        return evidenceRepository
                .findByCaseEntityIdOrderByBlockIndexAsc(caseId)
                .stream()
                .sorted(Comparator.comparing(
                        EvidenceRecord::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private EvidenceHistoryItemDto toDto(EvidenceRecord evidence) {
        String uploaderName = evidence.getUploadedBy() != null
                ? evidence.getUploadedBy().getName()
                : "Unknown";

        return EvidenceHistoryItemDto.builder()
                .id(evidence.getId())
                .title(evidence.getTitle())
                .fileName(evidence.getFileName())
                .fileHash(evidence.getFileHash())
                .isVerified(evidence.getIsVerified())
                .verificationStatus(evidence.getVerificationStatus())
                .uploadedByName(uploaderName)
                .createdAt(evidence.getCreatedAt())
                .blockIndex(evidence.getBlockIndex())
                .build();
    }
}
