-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create additional databases for different environments
CREATE DATABASE thogmi_test;
CREATE DATABASE thogmi_staging;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE thogmi_platform TO thogmi_dev;
GRANT ALL PRIVILEGES ON DATABASE thogmi_test TO thogmi_dev;
GRANT ALL PRIVILEGES ON DATABASE thogmi_staging TO thogmi_dev;
