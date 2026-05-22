-- Create lawyer_profile table
CREATE TABLE IF NOT EXISTS lawyer_profile (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES ny_user(id) ON DELETE CASCADE,
    bio TEXT,
    years_of_experience INTEGER,
    hourly_rate DOUBLE PRECISION,
    average_rating DOUBLE PRECISION DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    zoom_user_id VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    profile_image_url VARCHAR(500),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
);

-- Create lawyer_specializations table (for multi-valued specializations)
CREATE TABLE IF NOT EXISTS lawyer_specializations (
    lawyer_id BIGINT NOT NULL REFERENCES lawyer_profile(id) ON DELETE CASCADE,
    specialization VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lawyer_specializations ON lawyer_specializations(lawyer_id);

-- Create consultation_slot table
CREATE TABLE IF NOT EXISTS consultation_slot (
    id BIGSERIAL PRIMARY KEY,
    lawyer_id BIGINT NOT NULL REFERENCES lawyer_profile(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED', 'BLOCKED')),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
);

CREATE INDEX IF NOT EXISTS idx_consultation_slot_lawyer ON consultation_slot(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultation_slot_status ON consultation_slot(status);
CREATE INDEX IF NOT EXISTS idx_consultation_slot_time ON consultation_slot(start_time, end_time);

-- Create payment table first (no foreign key to consultation yet)
CREATE TABLE IF NOT EXISTS payment (
    id BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT UNIQUE,
    client_id BIGINT NOT NULL REFERENCES ny_user(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND', 'CANCELLED')),
    stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_payment_method_id VARCHAR(255),
    invoice_url VARCHAR(500),
    invoice_html TEXT,
    refund_id VARCHAR(255),
    refund_reason TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
);

CREATE INDEX IF NOT EXISTS idx_payment_client ON payment(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);
CREATE INDEX IF NOT EXISTS idx_payment_stripe_id ON payment(stripe_payment_intent_id);

-- Create consultation table
CREATE TABLE IF NOT EXISTS consultation (
    id BIGSERIAL PRIMARY KEY,
    lawyer_id BIGINT NOT NULL REFERENCES lawyer_profile(id) ON DELETE CASCADE,
    client_id BIGINT NOT NULL REFERENCES ny_user(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED')),
    payment_id BIGINT UNIQUE REFERENCES payment(id),
    zoom_meeting_id VARCHAR(255),
    zoom_meeting_url VARCHAR(500),
    notes TEXT,
    lawyer_rating DOUBLE PRECISION,
    client_feedback TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
);

CREATE INDEX IF NOT EXISTS idx_consultation_lawyer ON consultation(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultation_client ON consultation(client_id);
CREATE INDEX IF NOT EXISTS idx_consultation_status ON consultation(status);
CREATE INDEX IF NOT EXISTS idx_consultation_scheduled_time ON consultation(scheduled_time);

-- Add foreign key constraint to payment.consultation_id after consultation table is created
ALTER TABLE payment ADD CONSTRAINT fk_payment_consultation FOREIGN KEY (consultation_id) REFERENCES consultation(id) ON DELETE CASCADE;
