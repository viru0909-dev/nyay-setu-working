CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    user_id BIGINT,
    case_id UUID,
    role VARCHAR(255),
    action VARCHAR(255),
    description TEXT,
    timestamp TIMESTAMP
);
