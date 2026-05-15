-- Add index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_scores_puzzle_time ON scores(puzzle_id, time_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);

-- Get leaderboard for a puzzle (top 10 by time)
CREATE OR REPLACE FUNCTION get_leaderboard(p_puzzle_id UUID)
RETURNS TABLE (
  rank BIGINT,
  display_name TEXT,
  time_seconds INTEGER,
  is_anonymous BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY s.time_seconds ASC) as rank,
    COALESCE(pr.username, 'Anonymous #' || LEFT(s.ip_address, 8)) as display_name,
    s.time_seconds,
    (s.user_id IS NULL) as is_anonymous,
    s.created_at
  FROM scores s
  LEFT JOIN profiles pr ON pr.id = s.user_id
  WHERE s.puzzle_id = p_puzzle_id AND s.completed = true
  ORDER BY s.time_seconds ASC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;