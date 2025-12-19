-- V14: Fix chat_sessions user_id column type
-- The User entity uses Long (BIGINT) for id, but chat_sessions has UUID
-- This migration fixes the type mismatch

-- Step 1: Drop indexes on user_id
DROP INDEX IF EXISTS idx_chat_sessions_user;
DROP INDEX IF EXISTS idx_chat_sessions_user_id;

-- Step 2: Drop the existing user_id column (if it has data, this will lose it)
-- Since this is a development database and chat sessions are temporary, this is acceptable
ALTER TABLE chat_sessions DROP COLUMN IF EXISTS user_id;

-- Step 3: Re-add user_id as BIGINT to match User entity
ALTER TABLE chat_sessions ADD COLUMN user_id BIGINT REFERENCES ny_user(id);

-- Step 4: Recreate the index
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

-- Add comment for documentation
COMMENT ON COLUMN chat_sessions.user_id IS 'References ny_user.id (BIGINT) - the user who owns this chat session';
