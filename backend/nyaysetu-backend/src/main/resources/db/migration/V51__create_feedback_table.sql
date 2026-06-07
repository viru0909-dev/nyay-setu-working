-- Migration V51: Create feedback table
-- This table stores user feedback with rate limiting and sanitization support

CREATE TABLE IF NOT EXISTS feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES ny_user(id),
    lawyer_id BIGINT REFERENCES ny_user(id),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comment for documentation
COMMENT ON TABLE feedback IS 'Stores user feedback for the platform and individual lawyers';
COMMENT ON COLUMN feedback.content IS 'Sanitized feedback content';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_lawyer_id ON feedback(lawyer_id);
