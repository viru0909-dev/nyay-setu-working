-- Create courtrooms table
CREATE TABLE IF NOT EXISTS courtrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'
);

-- Create court_schedules table
CREATE TABLE IF NOT EXISTS court_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES case_entity(id) ON DELETE CASCADE,
    hearing_id UUID REFERENCES hearings(id) ON DELETE SET NULL,
    judge_id BIGINT NOT NULL REFERENCES ny_user(id) ON DELETE CASCADE,
    lawyer_id BIGINT REFERENCES ny_user(id) ON DELETE SET NULL,
    courtroom_id INTEGER NOT NULL REFERENCES courtrooms(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_schedule_status CHECK (status IN ('SCHEDULED', 'CANCELLED', 'RESCHEDULED', 'COMPLETED')),
    CONSTRAINT valid_schedule_priority CHECK (priority IN ('NORMAL', 'URGENT', 'CRITICAL'))
);

-- Create scheduling_conflicts table
CREATE TABLE IF NOT EXISTS scheduling_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES court_schedules(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    conflicting_schedule_id UUID REFERENCES court_schedules(id) ON DELETE SET NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_conflict_type CHECK (conflict_type IN ('JUDGE_CONFLICT', 'COURTROOM_CONFLICT', 'LAWYER_CONFLICT', 'DUPLICATE_CASE'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_court_schedules_case_id ON court_schedules(case_id);
CREATE INDEX IF NOT EXISTS idx_court_schedules_judge_id ON court_schedules(judge_id);
CREATE INDEX IF NOT EXISTS idx_court_schedules_lawyer_id ON court_schedules(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_court_schedules_courtroom_id ON court_schedules(courtroom_id);
CREATE INDEX IF NOT EXISTS idx_court_schedules_times ON court_schedules(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_scheduling_conflicts_schedule_id ON scheduling_conflicts(schedule_id);

-- Seed courtrooms
INSERT INTO courtrooms (name, room_number, status) VALUES 
('Courtroom A', '101', 'AVAILABLE'),
('Courtroom B', '102', 'AVAILABLE'),
('Courtroom C', '103', 'AVAILABLE')
ON CONFLICT (room_number) DO NOTHING;
