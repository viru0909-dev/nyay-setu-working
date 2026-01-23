-- Migration: Rename CLIENT role to LITIGANT
-- This updates all existing users with CLIENT role to LITIGANT

UPDATE ny_user SET role = 'LITIGANT' WHERE role = 'CLIENT';

-- Note: The Java enum Role.java has been updated to use LITIGANT instead of CLIENT
