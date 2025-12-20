-- Add lawyer_id to case_entity table
ALTER TABLE case_entity ADD COLUMN lawyer_id BIGINT REFERENCES ny_user(id);

-- Create index for lawyer lookup
CREATE INDEX idx_case_entity_lawyer ON case_entity(lawyer_id);
