-- Add client FIR filing fields to fir_records table
ALTER TABLE fir_records ADD COLUMN IF NOT EXISTS filed_by BIGINT REFERENCES ny_user(id);
ALTER TABLE fir_records ADD COLUMN IF NOT EXISTS incident_date DATE;
ALTER TABLE fir_records ADD COLUMN IF NOT EXISTS incident_location VARCHAR(500);
ALTER TABLE fir_records ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE fir_records ADD COLUMN IF NOT EXISTS ai_session_id VARCHAR(100);
ALTER TABLE fir_records ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE fir_records ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE fir_records ADD COLUMN IF NOT EXISTS reviewed_by BIGINT REFERENCES ny_user(id);

-- Make file_hash nullable for client FIRs (they may not upload files)
ALTER TABLE fir_records ALTER COLUMN file_hash DROP NOT NULL;

-- Create index for client FIRs
CREATE INDEX IF NOT EXISTS idx_fir_records_filed_by ON fir_records(filed_by);
CREATE INDEX IF NOT EXISTS idx_fir_records_ai_generated ON fir_records(ai_generated);

-- Add comments
COMMENT ON COLUMN fir_records.filed_by IS 'Client who filed the FIR (for citizen FIRs)';
COMMENT ON COLUMN fir_records.ai_generated IS 'True if FIR was generated via Vakil Friend AI';
COMMENT ON COLUMN fir_records.ai_session_id IS 'Vakil Friend session ID for AI-generated FIRs';
