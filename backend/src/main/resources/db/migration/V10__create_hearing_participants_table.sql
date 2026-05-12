-- Create hearing_participants table
CREATE TABLE hearing_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hearing_id UUID NOT NULL REFERENCES hearings(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES ny_user(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    can_speak BOOLEAN DEFAULT true,
    is_video_on BOOLEAN DEFAULT true,
    is_audio_on BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_participant_role CHECK (role IN ('JUDGE', 'CLIENT', 'LAWYER', 'DEFENDANT'))
);

-- Create indexes
CREATE INDEX idx_hearing_participants_hearing_id ON hearing_participants(hearing_id);
CREATE INDEX idx_hearing_participants_user_id ON hearing_participants(user_id);

-- Ensure one role per user per hearing
CREATE UNIQUE INDEX idx_hearing_participants_unique ON hearing_participants(hearing_id, user_id);
