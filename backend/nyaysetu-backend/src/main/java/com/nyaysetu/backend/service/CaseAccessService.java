package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.exception.AccessDeniedException;
import com.nyaysetu.backend.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CaseAccessService {

    private final CaseRepository caseRepository;

    public CaseEntity requireCaseAccess(UUID caseId, User user) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found: " + caseId));

        if (!canAccessCase(caseEntity, user)) {
            log.warn("Access denied: user {} (role={}) tried to access case {}", user.getId(), user.getRole(), caseId);
            throw new AccessDeniedException("You do not have access to this case");
        }
        return caseEntity;
    }

    public boolean canAccessCase(CaseEntity caseEntity, User user) {
        // Global administrative high-privilege access clearances
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_JUDGE) {
            return true;
        }
        
        // Litigant (Client) Ownership Validation Boundary Case Check
        if (caseEntity.getClient() != null && caseEntity.getClient().getId().equals(user.getId())) {
            return true;
        }
        
        // Assigned Legal Counsel (Lawyer) Relational Validation Check
        if (caseEntity.getLawyer() != null && caseEntity.getLawyer().getId().equals(user.getId())) {
            return true;
        }
        
        // Assigned Judiciary Officer (Judge) Relational Verification Gate
        if (caseEntity.getJudgeId() != null && caseEntity.getJudgeId().equals(user.getId())) {
            return true;
        }
        
        // Named Case Respondent Email Parameter Identity Correlation Check
        if (user.getEmail() != null && user.getEmail().equals(caseEntity.getRespondentEmail())) {
            return true;
        }
        
        // Police Enforcement Relational Verification Gate Mapping
        if (user.getRole() == Role.POLICE) {
            // Security Fix: Verify the police user matches the localized station tracking coordinates of the case's active FIR record
            if (caseEntity.getFir() != null && caseEntity.getFir().getPoliceStation() != null) {
                String officerStation = user.getPoliceStationCode(); // Derived safely from authenticated user profile records
                String caseStation = caseEntity.getFir().getPoliceStation().getCode();
                if (officerStation != null && officerStation.equalsIgnoreCase(caseStation)) {
                    return true;
                }
            }
        }
        
        // Security Fix: Completely removed the unconditional JUDGE/POLICE wide-open role fallthrough return true bypass block.
        // Unassigned judges and unrelated police enforcement profiles now correctly fall through to access denial state logs.
        return false;
    }
}

