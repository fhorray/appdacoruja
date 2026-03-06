-- Para rodar localmente: npx wrangler d1 execute DB --file=./scripts/clean-db.sql --local
-- Para rodar remotamente: npx wrangler d1 execute DB --remote --file=./scripts/clean-db.sql
-- Disable foreign key constraints to avoid order errors
PRAGMA foreign_keys = OFF;

-- Remove Finance tables
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS responsible_persons;
DROP TABLE IF EXISTS category_limits;
DROP TABLE IF EXISTS recurring_bills;
DROP TABLE IF EXISTS savings_goals;
DROP TABLE IF EXISTS credit_card_invoices;
DROP TABLE IF EXISTS credit_cards;

-- Remove Investment tables
DROP TABLE IF EXISTS retirement_configs;
DROP TABLE IF EXISTS financial_projects;

-- Remove Registry tables
DROP TABLE IF EXISTS registries_downloads;
DROP TABLE IF EXISTS registries_versions;
DROP TABLE IF EXISTS registries_packages;

-- Remove Core tables
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS verifications;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS courses_progress;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

-- Remove control table
DROP TABLE IF EXISTS __drizzle_migrations;

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;