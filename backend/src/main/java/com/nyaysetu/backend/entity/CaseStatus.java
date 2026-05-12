package com.nyaysetu.backend.entity;

/**
 * Case Status Enum - Represents the lifecycle states of a judicial case.
 * 
 * Workflow: FIR_FILED → PENDING_COGNIZANCE → IN_ADMISSION → DRAFT_REVIEW 
 *           → TRIAL_READY → JUDGMENT_PENDING → COMPLETED/CLOSED
 */
public enum CaseStatus {
    // Legacy statuses (for backward compatibility)
    PENDING,
    OPEN,
    IN_PROGRESS,
    UNDER_REVIEW,
    AWAITING_DOCUMENTS,
    COMPLETED,
    CLOSED,
    ON_HOLD,
    APPROVED,
    
    // Judicial Workflow Statuses
    FIR_FILED,              // Initial FIR submission by police/litigant
    PENDING_COGNIZANCE,     // Awaiting judge to take cognizance
    COGNIZANCE_PERIOD,      // Judge reviewing for cognizance
    IN_ADMISSION,           // Case admitted, proceedings begin
    DRAFT_REVIEW,           // Draft petition awaiting client approval
    SUMMONS_SERVED,         // Summons delivered to parties
    DRAFT_PENDING_CLIENT,   // Lawyer's draft awaiting litigant approval
    TRIAL_READY,            // Summons served AND BSA 63(4) certified
    JUDGMENT_PENDING,       // Trial complete, judgment awaited
    READY_FOR_COURT         // All pre-trial requirements met
}
