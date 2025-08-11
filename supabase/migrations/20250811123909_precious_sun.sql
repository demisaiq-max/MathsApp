/*
  # Fix User Profiles and Authentication

  1. Database Issues Fixed
    - Ensure user_profiles table has correct structure
    - Add proper trigger function to create profiles automatically
    - Fix foreign key relationship with auth.users
    - Add proper RLS policies

  2. Authentication Flow
    - Auto-create user profile when user signs up
    - Handle role and grade assignment from signup metadata
    - Ensure proper permissions for profile access
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure user_profiles table has correct structure
ALTER TABLE user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Recreate the foreign key constraint properly
ALTER TABLE user_profiles 
  ADD CONSTRAINT user_profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create the trigger function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, grade)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'student' 
      THEN COALESCE((new.raw_user_meta_data->>'grade')::integer, 5)
      ELSE NULL
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );