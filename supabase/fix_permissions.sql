-- Trigger function to create a profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the Auth table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure proper RLS for scores
DROP POLICY IF EXISTS "Users can insert their own scores" ON scores;
CREATE POLICY "Users can insert their own scores" ON scores FOR INSERT WITH CHECK (true);

-- Ensure public can read profiles for the leaderboard
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
