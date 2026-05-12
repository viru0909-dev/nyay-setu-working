-- Migration V46: Create tables for Vakil Friend AI Diary and Evidence Vault
-- Includes SHA-256 for integrity and AI analysis fields

CREATE TABLE IF NOT EXISTS case_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_case_id UUID REFERENCES case_entity(id),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500),
    uploaded_by BIGINT REFERENCES ny_user(id),
    
    -- Integrity Protection
    sha256_hash VARCHAR(64),
    original_hash VARCHAR(128),
    hash_verified BOOLEAN DEFAULT FALSE,
    hash_verified_at TIMESTAMP,
    
    -- AI Analysis
    ai_analysis_summary TEXT,
    document_type VARCHAR(50),
    validity_status VARCHAR(30),
    validity_notes TEXT,
    importance VARCHAR(20),
    category VARCHAR(50),
    ai_analyzed BOOLEAN DEFAULT FALSE,
    analyzed_at TIMESTAMP,
    
    -- Vault Storage
    stored_in_vault BOOLEAN DEFAULT FALSE,
    vault_stored_at TIMESTAMP,
    vault_storage_reason VARCHAR(100),
    
    -- Metadata
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size BIGINT,
    mime_type VARCHAR(50),
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS vakil_ai_diary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES case_entity(id), -- Nullable for initial chat
    session_id UUID NOT NULL,
    user_id BIGINT NOT NULL REFERENCES ny_user(id),
    user_query TEXT,
    ai_response TEXT,
    content_hash VARCHAR(64),
    entry_type VARCHAR(50),
    attached_document_name TEXT,
    attached_document_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT TRUE,
    metadata TEXT
);

-- Indexes for performance
CREATE INDEX idx_case_evidence_case_id ON case_evidence(legal_case_id);
CREATE INDEX idx_case_evidence_hash ON case_evidence(sha256_hash);
CREATE INDEX idx_diary_case_id ON vakil_ai_diary_entries(case_id);
CREATE INDEX idx_diary_session_id ON vakil_ai_diary_entries(session_id);
