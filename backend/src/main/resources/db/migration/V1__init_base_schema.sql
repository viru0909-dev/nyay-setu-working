-- Skeleton schema for "from zero" deployment on Render
-- This creates the base tables required by subsequent migrations (V5, V9, V12, etc.)

-- 1. Create Users Table (Skeleton)
CREATE TABLE IF NOT EXISTS ny_user (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- 2. Create Base Case Entity Table (Skeleton)
CREATE TABLE IF NOT EXISTS case_entity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    description TEXT,
    case_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING',
    urgency VARCHAR(50) DEFAULT 'NORMAL',
    petitioner VARCHAR(255),
    respondent VARCHAR(255),
    client_id BIGINT REFERENCES ny_user(id),
    lawyer_id BIGINT REFERENCES ny_user(id),
    judge_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Document Table (Skeleton)
-- This is required by V5__create_document_analysis.sql
CREATE TABLE IF NOT EXISTS document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES case_entity(id),
    file_name VARCHAR(255),
    file_url TEXT,
    content_type VARCHAR(100),
    size BIGINT,
    uploaded_by BIGINT REFERENCES ny_user(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    storage_type VARCHAR(50),
    category VARCHAR(50),
    description VARCHAR(500)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ny_user_email ON ny_user(email);
CREATE INDEX IF NOT EXISTS idx_case_entity_client_id ON case_entity(client_id);
CREATE INDEX IF NOT EXISTS idx_case_entity_lawyer_id ON case_entity(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_document_case_id ON document(case_id);
