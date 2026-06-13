-- V51: Optimize slow analytical queries on CourtAnalyticsPage
-- Fix for Issue #758

CREATE INDEX IF NOT EXISTS idx_cases_status
    ON cases(status);

CREATE INDEX IF NOT EXISTS idx_cases_court_id_status
    ON cases(court_id, status);

CREATE INDEX IF NOT EXISTS idx_cases_assigned_judge_id
    ON cases(assigned_judge_id);

CREATE INDEX IF NOT EXISTS idx_cases_filed_date
    ON cases(filed_date);

CREATE INDEX IF NOT EXISTS idx_hearings_scheduled_date
    ON hearings(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_hearings_case_id
    ON hearings(case_id);