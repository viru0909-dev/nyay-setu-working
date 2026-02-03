-- V45: Create case_events table for audit trail
-- This is the Single Source of Truth for all case actions

CREATE TABLE IF NOT EXISTS case_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    actor_id VARCHAR(255),
    actor_role VARCHAR(50),
    actor_name VARCHAR(255),
    event_data_json TEXT,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    previous_stage INTEGER,
    new_stage INTEGER,
    summary TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to case_entity
    CONSTRAINT fk_case_events_case FOREIGN KEY (case_id) REFERENCES case_entity(id) ON DELETE CASCADE
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_timestamp ON case_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_case_events_actor_role ON case_events(actor_role);
CREATE INDEX IF NOT EXISTS idx_case_events_event_type ON case_events(event_type);
