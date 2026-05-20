-- ================================================================
-- WholesalePro — Run this in Supabase SQL Editor BEFORE deploying
-- ================================================================

-- 1. Add auth_id column to link users table to Supabase Auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- ================================================================
-- 2. HOW TO CREATE YOUR ADMIN USER (do this after running above)
-- ================================================================
-- Step A: Go to Supabase → Authentication → Users → "Add user"
--         Enter your admin email + password. Copy the UUID shown.
--
-- Step B: Run this SQL (replace the values):
--
-- INSERT INTO users (auth_id, email, name, role)
-- VALUES (
--   'PASTE-UUID-FROM-STEP-A-HERE',
--   'admin@youremail.com',
--   'Admin Owner',
--   'ADMIN'
-- )
-- ON CONFLICT (email) DO UPDATE
--   SET auth_id = EXCLUDED.auth_id, role = 'ADMIN';
--
-- ================================================================
-- 3. To link existing seed retailers to Auth (optional demo)
-- ================================================================
-- For each demo retailer, go to Auth → Add user, get their UUID,
-- then run: UPDATE users SET auth_id = 'UUID' WHERE email = 'aslam@demo.com';
-- ================================================================
