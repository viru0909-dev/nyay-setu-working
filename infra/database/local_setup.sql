-- NYAY-SETU Local Database Setup Script
-- Run this in your psql console or SQL client

-- 1. Create the database if it doesn't exist
-- Note: Run this part separately if your client doesn't support multi-statement DB creation
CREATE DATABASE nyaysetu;

-- 2. Create a dedicated user (optional, can use postgres)
-- CREATE USER nyaysetu WITH PASSWORD 'postgres';
-- GRANT ALL PRIVILEGES ON DATABASE nyaysetu TO nyaysetu;

-- 3. Connect to the database and ensure the public schema is ready for Flyway
\c nyaysetu
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- The application will automatically run Flyway migrations on startup.
