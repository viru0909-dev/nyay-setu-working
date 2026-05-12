-- Create case_messages table to store chat messages
-- Replaces any auto-generated table and ensures correct types (sender_id as BIGINT)

CREATE TABLE IF NOT EXISTS case_messages (
    id UUID PRIMARY KEY,
    legal_case_id UUID NOT NULL REFERENCES case_entity(id),
    sender_id BIGINT NOT NULL REFERENCES ny_user(id),
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_case_messages_legal_case_id ON case_messages(legal_case_id);
CREATE INDEX IF NOT EXISTS idx_case_messages_timestamp ON case_messages(timestamp);
