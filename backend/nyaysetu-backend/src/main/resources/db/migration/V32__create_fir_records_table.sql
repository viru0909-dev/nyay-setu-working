-- Create fir_records table for Police FIR uploads with SHA-256 hashing
CREATE TABLE IF NOT EXISTS fir_records (
    id BIGSERIAL PRIMARY KEY,
    fir_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_hash VARCHAR(64) NOT NULL, -- SHA-256 hash (64 hex characters)
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size BIGINT,
    uploaded_by BIGINT REFERENCES ny_user(id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    case_id UUID, -- Optional link to case_entity
    status VARCHAR(50) NOT NULL DEFAULT 'SEALED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fir_records_uploaded_by ON fir_records(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_fir_records_case_id ON fir_records(case_id);
CREATE INDEX IF NOT EXISTS idx_fir_records_fir_number ON fir_records(fir_number);
CREATE INDEX IF NOT EXISTS idx_fir_records_file_hash ON fir_records(file_hash);
CREATE INDEX IF NOT EXISTS idx_fir_records_status ON fir_records(status);

-- Add comments for documentation
COMMENT ON TABLE fir_records IS 'Stores FIR documents with SHA-256 digital fingerprints for tamper detection';
COMMENT ON COLUMN fir_records.file_hash IS 'SHA-256 hash of the uploaded document for integrity verification';
COMMENT ON COLUMN fir_records.status IS 'FIR status: SEALED (uploaded), LINKED_TO_CASE (linked to active case), VERIFIED';
