-- Contest App Database Initialization
-- This file is used to initialize the PostgreSQL database for development

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a user for the application (if needed)
-- This is optional as the app uses connection pooling with Neon
-- DO
-- $$
-- BEGIN
--    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'contest_app') THEN
--       CREATE USER contest_app WITH PASSWORD 'password';
--       GRANT ALL PRIVILEGES ON DATABASE contest_db TO contest_app;
--    END IF;
-- END
-- $$;

-- Set timezone
SET timezone = 'UTC';

-- Log the initialization
SELECT 'Contest App database initialized successfully' as message; 