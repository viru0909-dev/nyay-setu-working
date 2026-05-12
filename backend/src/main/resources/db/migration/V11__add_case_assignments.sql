-- Add case assignment fields to case_entity table
ALTER TABLE case_entity ADD COLUMN assigned_judge_id BIGINT REFERENCES ny_user(id);
ALTER TABLE case_entity ADD COLUMN defendant_id BIGINT REFERENCES ny_user(id);
ALTER TABLE case_entity ADD COLUMN client_lawyer_id BIGINT REFERENCES ny_user(id);
ALTER TABLE case_entity ADD COLUMN defendant_lawyer_id BIGINT REFERENCES ny_user(id);

-- Create indexes for faster lookups
CREATE INDEX idx_case_entity_assigned_judge ON case_entity(assigned_judge_id);
CREATE INDEX idx_case_entity_defendant ON case_entity(defendant_id);
