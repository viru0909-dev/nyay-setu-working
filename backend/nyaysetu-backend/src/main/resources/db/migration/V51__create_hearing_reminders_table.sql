-- Drop old unintegrated table if it exists
DROP TABLE IF EXISTS hearing_reminders CASCADE;

-- Create hearing reminders table linking to hearings and ny_user
CREATE TABLE hearing_reminders (
    id BIGSERIAL PRIMARY KEY,
    hearing_id UUID NOT NULL,
    user_id BIGINT NOT NULL,
    reminder_time TIMESTAMP NOT NULL,
    reminder_message VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hearing_reminders_hearing FOREIGN KEY (hearing_id) REFERENCES hearings(id) ON DELETE CASCADE,
    CONSTRAINT fk_hearing_reminders_user FOREIGN KEY (user_id) REFERENCES ny_user(id) ON DELETE CASCADE
);

-- Index for fast user/hearing lookup
CREATE INDEX idx_hearing_reminders_user_id ON hearing_reminders(user_id);
CREATE INDEX idx_hearing_reminders_hearing_id ON hearing_reminders(hearing_id);
