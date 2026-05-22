-- Virtual Lawyer Consultation System - Database Migration
-- Created: May 22, 2026
-- Purpose: Initialize tables for lawyer management, bookings, and payments

-- ============================================
-- PHASE 1: LAWYER MANAGEMENT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS lawyers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    experience_years INT CHECK (experience_years >= 0),
    bio TEXT,
    qualification TEXT,
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate > 0),
    rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_consultations INT DEFAULT 0 CHECK (total_consultations >= 0),
    is_active BOOLEAN DEFAULT true,
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lawyer_expertise (
    id BIGSERIAL PRIMARY KEY,
    lawyer_id BIGINT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    expertise_area VARCHAR(100) NOT NULL,
    years_in_area INT CHECK (years_in_area >= 0),
    UNIQUE(lawyer_id, expertise_area),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lawyer_availability (
    id BIGSERIAL PRIMARY KEY,
    lawyer_id BIGINT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lawyer_reviews (
    id BIGSERIAL PRIMARY KEY,
    lawyer_id BIGINT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    consultation_id BIGINT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_consultation BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lawyer_id, user_id, consultation_id)
);

-- ============================================
-- PHASE 2: CONSULTATION/BOOKING TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS consultations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lawyer_id BIGINT NOT NULL REFERENCES lawyers(id) ON DELETE RESTRICT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60 CHECK (duration_minutes > 0),
    consultation_type VARCHAR(50) NOT NULL, -- VIDEO, AUDIO, CHAT
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    case_description TEXT,
    meeting_link VARCHAR(500),
    case_file_url VARCHAR(500),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PHASE 3: PAYMENT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT NOT NULL UNIQUE REFERENCES consultations(id) ON DELETE RESTRICT,
    user_id BIGINT NOT NULL,
    lawyer_id BIGINT NOT NULL REFERENCES lawyers(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, REFUNDED, FAILED, CANCELLED
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_charge_id VARCHAR(255) UNIQUE,
    payment_method VARCHAR(50), -- CARD, BANK_TRANSFER, etc.
    refund_reason VARCHAR(500),
    refund_amount DECIMAL(10, 2),
    refund_status VARCHAR(50), -- NONE, PARTIAL, FULL, PENDING
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
    consultation_id BIGINT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    pdf_url VARCHAR(500),
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ISSUED', -- ISSUED, PAID, CANCELLED, OVERDUE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PHASE 4: INDEXES FOR PERFORMANCE
-- ============================================

-- Lawyer lookups
CREATE INDEX IF NOT EXISTS idx_lawyers_specialization ON lawyers(specialization);
CREATE INDEX IF NOT EXISTS idx_lawyers_verification_status ON lawyers(verification_status);
CREATE INDEX IF NOT EXISTS idx_lawyers_is_active ON lawyers(is_active);

-- Consultation lookups
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_lawyer_id ON consultations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_lawyer ON consultations(user_id, lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled_date ON consultations(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_datetime ON consultations(scheduled_date, scheduled_time);

-- Payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_lawyer_status ON payments(lawyer_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_consultation_id ON payments(consultation_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Review lookups
CREATE INDEX IF NOT EXISTS idx_lawyer_reviews_lawyer_id ON lawyer_reviews(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_reviews_user_id ON lawyer_reviews(user_id);

-- Availability lookups
CREATE INDEX IF NOT EXISTS idx_lawyer_availability_lawyer_id ON lawyer_availability(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_availability_day ON lawyer_availability(day_of_week);

-- ============================================
-- PHASE 5: VIEWS FOR COMMON QUERIES
-- ============================================

-- View for lawyer with recent stats
CREATE OR REPLACE VIEW lawyer_stats AS
SELECT
    l.id,
    l.user_id,
    l.specialization,
    l.hourly_rate,
    l.rating,
    COUNT(DISTINCT c.id) as total_consultations,
    AVG(lr.rating) as avg_rating,
    COUNT(DISTINCT lr.id) as total_reviews,
    (SELECT COUNT(*) FROM consultations WHERE lawyer_id = l.id AND status = 'COMPLETED') as completed_consultations
FROM lawyers l
LEFT JOIN consultations c ON l.id = c.lawyer_id AND c.status = 'COMPLETED'
LEFT JOIN lawyer_reviews lr ON l.id = lr.lawyer_id
GROUP BY l.id, l.user_id, l.specialization, l.hourly_rate, l.rating;

-- View for consultation status overview
CREATE OR REPLACE VIEW consultation_overview AS
SELECT
    c.id,
    c.user_id,
    c.lawyer_id,
    c.scheduled_date,
    c.scheduled_time,
    c.status,
    p.status as payment_status,
    p.amount,
    l.specialization
FROM consultations c
LEFT JOIN payments p ON c.id = p.consultation_id
LEFT JOIN lawyers l ON c.lawyer_id = l.id;

-- ============================================
-- PHASE 6: CONSTRAINTS & TRIGGERS
-- ============================================

-- Trigger to update lawyer updated_at
CREATE OR REPLACE FUNCTION update_lawyer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lawyer_updated_at ON lawyers;
CREATE TRIGGER trigger_update_lawyer_updated_at
BEFORE UPDATE ON lawyers
FOR EACH ROW
EXECUTE FUNCTION update_lawyer_updated_at();

-- Trigger to update consultation updated_at
CREATE OR REPLACE FUNCTION update_consultation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_consultation_updated_at ON consultations;
CREATE TRIGGER trigger_update_consultation_updated_at
BEFORE UPDATE ON consultations
FOR EACH ROW
EXECUTE FUNCTION update_consultation_updated_at();

-- Trigger to update payment updated_at
CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_payment_updated_at ON payments;
CREATE TRIGGER trigger_update_payment_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_payment_updated_at();

-- ============================================
-- PHASE 7: SAMPLE DATA (FOR TESTING)
-- ============================================

-- Note: Uncomment to insert sample data for testing

/*
-- Insert sample lawyers (assuming users 101-105 exist)
INSERT INTO lawyers (user_id, specialization, experience_years, bio, hourly_rate, verification_status, is_active)
VALUES
    (101, 'Criminal Law', 15, 'Experienced criminal defense attorney', 150.00, 'VERIFIED', true),
    (102, 'Family Law', 12, 'Compassionate family law specialist', 120.00, 'VERIFIED', true),
    (103, 'Corporate Law', 20, 'Senior corporate attorney', 200.00, 'VERIFIED', true);

-- Insert expertise areas
INSERT INTO lawyer_expertise (lawyer_id, expertise_area, years_in_area)
VALUES
    (1, 'White Collar Crime', 10),
    (1, 'DUI Defense', 8),
    (2, 'Divorce', 12),
    (2, 'Child Custody', 11),
    (3, 'Mergers & Acquisitions', 15),
    (3, 'Contract Law', 18);

-- Insert availability
INSERT INTO lawyer_availability (lawyer_id, day_of_week, start_time, end_time, is_available)
VALUES
    (1, 1, '09:00:00', '17:00:00', true),
    (1, 2, '09:00:00', '17:00:00', true),
    (1, 3, '09:00:00', '17:00:00', true),
    (2, 1, '10:00:00', '18:00:00', true),
    (2, 2, '10:00:00', '18:00:00', true),
    (3, 1, '08:00:00', '16:00:00', true);
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify table creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'lawyer%' OR table_name LIKE 'consultation%' OR table_name LIKE 'payment%' OR table_name LIKE 'invoice%';

-- End of migration script
