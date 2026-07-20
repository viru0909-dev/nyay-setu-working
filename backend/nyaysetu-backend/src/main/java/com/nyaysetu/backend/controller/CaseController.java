package com.nyaysetu.backend.controller;

import java.util.UUID;
import java.util.List;
import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.service.CaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Case Management", description = "Endpoints for creating, fetching, updating cases and managing appeals")
@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @Operation(summary = "Create a new legal case", description = "Allows LITIGANT, LAWYER, or ADMIN to file a new case")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Case created successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('LAWYER', 'LITIGANT', 'ADMIN')")
    @PostMapping
    public ResponseEntity<CaseEntity> createCase(@RequestBody CreateCaseRequest dto) {
        return new ResponseEntity<>(caseService.createCase(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Get case details by ID", description = "Retrieve a specific case by its unique UUID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Case retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Case not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CaseEntity> getCase(@PathVariable UUID id) {
        return ResponseEntity.ok(caseService.getCase(id));
    }

    @Operation(summary = "Get all cases (paginated)", description = "Fetch a paginated list of cases")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Page of cases retrieved successfully")
    })
    @GetMapping
    public ResponseEntity<Page<CaseEntity>> getAllCases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CaseEntity> casesPage = caseService.getAllCases(page, size);
        return ResponseEntity.ok(casesPage);
    }

    @Operation(summary = "Update case status", description = "Allows JUDGE, SUPER_JUDGE, or ADMIN to update the status of a case")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status updated successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden for current user role")
    })
    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<CaseEntity> updateStatus(
            @PathVariable UUID id,
            @RequestParam CaseStatus status
    ) {
        return ResponseEntity.ok(caseService.updateStatus(id, status));
    }

    @Operation(summary = "File an appeal for a case", description = "Allows LITIGANT or ADMIN to submit an appeal for a case")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Appeal created successfully")
    })
    @PreAuthorize("hasAnyRole('LITIGANT', 'ADMIN')")
    @PostMapping("/{caseId}/appeal")
    public ResponseEntity<CaseEntity> createAppeal(
            @PathVariable UUID caseId,
            @RequestParam String reason
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(caseService.createAppeal(caseId, reason));
    }

    @Operation(summary = "Get appeals for a case", description = "Retrieve list of appeals associated with a case")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Appeals list retrieved successfully")
    })
    @GetMapping("/{caseId}/appeals")
    public ResponseEntity<List<CaseEntity>> getAppeals(
            @PathVariable UUID caseId
    ) {
        return ResponseEntity.ok(caseService.getAppeals(caseId));
    }

    @Operation(summary = "Update appeal status", description = "Allows JUDGE, SUPER_JUDGE, or ADMIN to approve/reject an appeal")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Appeal status updated successfully")
    })
    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PutMapping("/appeals/{appealId}/status")
    public ResponseEntity<CaseEntity> updateAppealStatus(
            @PathVariable UUID appealId,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(
                caseService.updateAppealStatus(appealId, status)
        );
    }
}