/*
  # Complete Auth Schema Setup

  1. New Tables
    - `profiles` table linked 1:1 with auth.users
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text, nullable)
      - `role` (text, default 'student')
      - `grade` (int, nullable)
      - `avatar_url` (text, nullable)
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on profiles table
    - Add policies for users to manage their own profiles
    - Create trigger to auto-create profile on user signup

  3. Performance
    - Add indexes on role and grade for faster queries
*/

-- 1) Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'student',
  grade int,
  avatar_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Create RLS policies
DO $$
BEGIN
  -- Policy for selecting own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  -- Policy for inserting own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Policy for updating own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 4) Create trigger function to auto-create profile on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, grade)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    NULLIF(new.raw_user_meta_data->>'grade', '')::int
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- 5) Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- 6) Add indexes for performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_grade_idx ON public.profiles(grade);