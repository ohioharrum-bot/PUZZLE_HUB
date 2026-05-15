-- Run this in the Supabase SQL Editor to fix the missing column and permissions

-- 1. Add missing ip_address column if it doesn't exist
ALTER TABLE scores ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 2. Add missing completed column if it doesn't exist (used in API)
ALTER TABLE scores ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT true;

-- 3. Ensure RLS allows anonymous inserts for guest tracking
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own scores" ON scores;
CREATE POLICY "Users can insert their own scores" ON scores FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Scores are viewable by everyone" ON scores;
CREATE POLICY "Scores are viewable by everyone" ON scores FOR SELECT USING (true);

-- 4. Ensure foreign key to puzzles is correct
-- (Only run if you see foreign key errors)
-- ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_puzzle_id_fkey;
-- ALTER TABLE scores ADD CONSTRAINT scores_puzzle_id_fkey FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE;

-- 5. Refresh PostgREST cache (Supabase does this automatically after running SQL here)
