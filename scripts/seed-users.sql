-- USE: 
-- wrangler d1 execute progy-dev --env dev --remote --file=./scripts/seed-users.sql --config ./apps/backend/wrangler.jsonc

-- Seed Test Users
-- 1. Student User
INSERT INTO users (id, name, email, email_verified, created_at, updated_at, role, subscription)
VALUES (
    'user_' || lower(hex(randomblob(4))), 
    'Test Student', 
    'student@progy.dev', 
    1, 
    unixepoch() * 1000, 
    unixepoch() * 1000, 
    'user', 
    'free'
);

-- 2. Instructor User
INSERT INTO users (id, name, email, email_verified, created_at, updated_at, role, subscription)
VALUES (
    'inst_' || lower(hex(randomblob(4))), 
    'Test Instructor', 
    'instructor@progy.dev', 
    1, 
    unixepoch() * 1000, 
    unixepoch() * 1000, 
    'user,instructor', 
    'free'
);
