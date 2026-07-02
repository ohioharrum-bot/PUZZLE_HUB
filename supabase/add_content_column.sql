-- Migration: Add content column to puzzles table
ALTER TABLE puzzles ADD COLUMN IF NOT EXISTS content JSONB;
