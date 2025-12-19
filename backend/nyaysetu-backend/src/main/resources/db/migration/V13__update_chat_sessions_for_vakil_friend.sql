-- V13: Update chat_sessions table for Vakil-Friend
-- Adds conversation_data column and user/case relations

-- Add conversation_data column if not exists
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS conversation_data TEXT;

-- Rename user_id to maintain compatibility (if needed)
-- The column should already exist from previous migrations

-- Add case_id if not exists
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES case_entity(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
