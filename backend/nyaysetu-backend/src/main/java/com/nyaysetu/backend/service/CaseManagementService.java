package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.CaseDTO;
import com.nyaysetu.backend.dto.CaseSummaryDto;
import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseManagementService {

    private final CaseRepository caseRepository;

    @Transactional
    public CaseDTO createCase(CreateCaseRequest request, User client) {
        CaseEntity caseEntity = CaseEntity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .caseType(request.getCaseType())
                .petitioner(request.getPetitioner())
                .respondent(request.getRespondent())
                .urgency(request.getUrgency())
                .client(client)
                .build();

        CaseEntity saved = caseRepository.save(caseEntity);
        return convertToDTO(saved);
    }

    public List<CaseDTO> getCasesByUser(User user) {
        List<CaseEntity> cases = caseRepository.findByClient(user);
        return cases.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CaseDTO> getCasesByLawyer(User lawyer) {
        List<CaseEntity> cases = caseRepository.findByLawyer(lawyer);
        return cases.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CaseSummaryDto> getUserCaseSummaries(User user) {
        List<CaseEntity> cases = caseRepository.findByClient(user);
        return cases.stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }

    public CaseDTO getCaseById(UUID id) {
        CaseEntity caseEntity = caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));
        return convertToDTO(caseEntity);
    }

    @Transactional
    public CaseDTO updateCase(UUID id, CaseDTO caseDTO) {
        CaseEntity caseEntity = caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        if (caseDTO.getTitle() != null) caseEntity.setTitle(caseDTO.getTitle());
        if (caseDTO.getDescription() != null) caseEntity.setDescription(caseDTO.getDescription());
        if (caseDTO.getStatus() != null) caseEntity.setStatus(caseDTO.getStatus());
        if (caseDTO.getNextHearing() != null) caseEntity.setNextHearing(caseDTO.getNextHearing());
        if (caseDTO.getAssignedJudge() != null) caseEntity.setAssignedJudge(caseDTO.getAssignedJudge());

        CaseEntity updated = caseRepository.save(caseEntity);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteCase(UUID id) {
        if (!caseRepository.existsById(id)) {
            throw new RuntimeException("Case not found");
        }
        caseRepository.deleteById(id);
    }

    private CaseDTO convertToDTO(CaseEntity entity) {
        return CaseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .caseType(entity.getCaseType())
                .status(entity.getStatus())
                .urgency(entity.getUrgency())
                .petitioner(entity.getPetitioner())
                .respondent(entity.getRespondent())
                .filedDate(entity.getFiledDate())
                .nextHearing(entity.getNextHearing())
                .assignedJudge(entity.getAssignedJudge())
                .clientId(entity.getClient() != null ? entity.getClient().getId() : null)
                .clientName(entity.getClient() != null ? entity.getClient().getName() : null)
                .documentsCount(0) // TODO: Count from documents table
                .lawyerProposalStatus(entity.getLawyerProposalStatus())
                .build();
    }

    private CaseSummaryDto convertToSummaryDto(CaseEntity entity) {
        return CaseSummaryDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .caseType(entity.getCaseType())
                .status(entity.getStatus())
                .build();
    }
}
