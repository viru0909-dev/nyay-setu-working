-- Add title column to chat_sessions table for descriptive history
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS title VARCHAR(255);
