-- Create court_orders table for judge draft orders
CREATE TABLE IF NOT EXISTS court_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL,
    order_type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    issued_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issued_at TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_court_orders_case_id ON court_orders(case_id);
CREATE INDEX IF NOT EXISTS idx_court_orders_issued_by ON court_orders(issued_by);
CREATE INDEX IF NOT EXISTS idx_court_orders_status ON court_orders(status);
