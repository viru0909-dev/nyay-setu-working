-- Add stage column to case_entity table
ALTER TABLE case_entity ADD COLUMN stage VARCHAR(50);

-- Add outcome_type column to hearings table
ALTER TABLE hearings ADD COLUMN outcome_type VARCHAR(50);
