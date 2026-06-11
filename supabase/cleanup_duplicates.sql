-- SQL to remove duplicate daily puzzles and fix generic titles
-- Run this in the Supabase SQL Editor

-- 1. Remove duplicates for the same date and type (keeping the newest one by created_at if available, or just any)
-- Since we don't have created_at in the provided schema knowledge, we'll use the ID.
DELETE FROM puzzles
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY type, daily_date, is_daily ORDER BY id) as row_num
    FROM puzzles
    WHERE is_daily = true
  ) t
  WHERE t.row_num > 1
);

-- 2. Update generic 'Daily Sudoku #1' etc titles to be unique if they still exist
-- This is a one-time fix for existing rows.
UPDATE puzzles
SET title = 'Daily Sudoku - ' || daily_date
WHERE title LIKE 'Daily Sudoku #%' AND is_daily = true;

-- 3. Cleanup non-daily puzzles with duplicate titles
DELETE FROM puzzles
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY title, type, difficulty ORDER BY id) as row_num
    FROM puzzles
    WHERE is_daily = false
  ) t
  WHERE t.row_num > 1
);
