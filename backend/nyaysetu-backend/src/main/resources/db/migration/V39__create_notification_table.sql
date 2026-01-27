CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(255),
    message VARCHAR(2000),
    read_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
