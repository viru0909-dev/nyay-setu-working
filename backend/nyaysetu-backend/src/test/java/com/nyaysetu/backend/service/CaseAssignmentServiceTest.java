package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.LawyerDTO;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CaseAssignmentServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CaseRepository caseRepository;

    @Mock
    private CaseTimelineService timelineService;

    @InjectMocks
    private CaseAssignmentService caseAssignmentService;

    @Test
    public void getAvailableLawyers_returnsCasesHandledFromRepository() {
        User lawyer = User.builder()
                .id(42L)
                .name("Rohit Sharma")
                .email("rohit@example.com")
                .role(Role.LAWYER)
                .build();

        when(userRepository.findByRole(Role.LAWYER)).thenReturn(List.of(lawyer));
        when(caseRepository.countByLawyer(lawyer)).thenReturn(5L);

        List<LawyerDTO> availableLawyers = caseAssignmentService.getAvailableLawyers();

        assertEquals(1, availableLawyers.size());
        assertEquals(5, availableLawyers.get(0).getCasesHandled());
    }
}
