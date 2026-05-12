-- Migration: Create evidence_records table for blockchain-secured evidence

CREATE TABLE IF NOT EXISTS evidence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES case_entity(id),
    document_id UUID REFERENCES document(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(50) NOT NULL DEFAULT 'DOCUMENT',
    
    -- Blockchain security fields
    file_hash VARCHAR(64),
    block_hash VARCHAR(64) NOT NULL,
    previous_block_hash VARCHAR(64),
    block_index INTEGER,
    is_verified BOOLEAN DEFAULT true,
    verification_status VARCHAR(20) DEFAULT 'VERIFIED',
    
    -- Metadata
    uploaded_by BIGINT REFERENCES ny_user(id),
    uploaded_by_role VARCHAR(50),
    file_name VARCHAR(255),
    file_size BIGINT,
    content_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_evidence_records_case_id ON evidence_records(case_id);
CREATE INDEX idx_evidence_records_block_hash ON evidence_records(block_hash);
CREATE INDEX idx_evidence_records_verification ON evidence_records(verification_status);
