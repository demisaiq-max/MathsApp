/*
  # Fix Complete User Profile System

  1. Tables
    - Drop and recreate `user_profiles` table with proper structure
    - Add proper foreign key relationship to auth.users
    
  2. Trigger Function
    - Create `handle_new_user()` function to automatically create profiles
    - Extract data from raw_user_meta_data during signup
    
  3. Security
    - Enable RLS on user_profiles table
    - Add policies for users to read/update their own profiles
    - Add policy for admins to read all profiles
    
  4. Constraints
    - Add check constraints for role and grade validation
*/

-- Drop existing table and recreate with proper structure
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'student')),
  grade integer CHECK (grade >= 5 AND grade <= 10),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, grade)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'grade' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'grade')::integer
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();