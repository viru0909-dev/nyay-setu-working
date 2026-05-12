-- Add AI-related fields to case_entity table for Vakil-Friend chat system
-- Migration: V12__add_ai_fields_to_case.sql

-- Add AI-generated summary and chat-related fields
ALTER TABLE case_entity 
ADD COLUMN ai_generated_summary TEXT,
ADD COLUMN judge_summary_json TEXT,
ADD COLUMN chat_transcript TEXT,
ADD COLUMN evidence_verification_status VARCHAR(50) DEFAULT 'PENDING',
ADD COLUMN ai_confidence_score DECIMAL(3,2),
ADD COLUMN filing_method VARCHAR(50) DEFAULT 'TRADITIONAL';

-- Create chat_sessions table for tracking Vakil-Friend conversations
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    conversation_history TEXT,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    case_id UUID REFERENCES case_entity(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX idx_chat_sessions_case_id ON chat_sessions(case_id);
CREATE INDEX idx_case_entity_filing_method ON case_entity(filing_method);
CREATE INDEX idx_case_entity_evidence_verification ON case_entity(evidence_verification_status);

-- Add comments for documentation
COMMENT ON COLUMN case_entity.ai_generated_summary IS 'AI-generated summary of the case for quick review';
COMMENT ON COLUMN case_entity.judge_summary_json IS 'Structured JSON summary for judges containing key case details';
COMMENT ON COLUMN case_entity.chat_transcript IS 'Full conversation transcript from Vakil-Friend chat';
COMMENT ON COLUMN case_entity.evidence_verification_status IS 'Status of evidence verification: PENDING, VERIFIED, FAILED, NEEDS_REVIEW';
COMMENT ON COLUMN case_entity.ai_confidence_score IS 'AI confidence score for case analysis (0.00 to 1.00)';
COMMENT ON COLUMN case_entity.filing_method IS 'How the case was filed: TRADITIONAL or CHAT_AI';

COMMENT ON TABLE chat_sessions IS 'Tracks ongoing and completed Vakil-Friend chat sessions';
COMMENT ON COLUMN chat_sessions.status IS 'Session status: ACTIVE, COMPLETED, ABANDONED';
