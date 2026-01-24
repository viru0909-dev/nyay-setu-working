-- Create case_timeline table for tracking case events
CREATE TABLE IF NOT EXISTS case_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_case_id UUID NOT NULL,
    event VARCHAR(1000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by case
CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id ON case_timeline(legal_case_id);
