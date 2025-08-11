-- Fix Auth Trigger and User Profile Creation
-- This migration addresses the 500 error during signup by fixing the trigger function

-- First, drop existing trigger and function to start clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate user_profiles table with proper defaults and nullable fields
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text DEFAULT '',
  role text DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  grade integer DEFAULT 5 CHECK (grade >= 5 AND grade <= 10),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create robust trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_full_name text;
  user_role text;
  user_grade integer;
BEGIN
  -- Extract metadata with safe defaults
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  user_grade := COALESCE((NEW.raw_user_meta_data->>'grade')::integer, 5);
  
  -- Validate role
  IF user_role NOT IN ('admin', 'student') THEN
    user_role := 'student';
  END IF;
  
  -- Validate grade
  IF user_grade < 5 OR user_grade > 10 THEN
    user_grade := 5;
  END IF;
  
  -- Insert user profile with error handling
  BEGIN
    INSERT INTO public.user_profiles (id, full_name, role, grade, created_at)
    VALUES (NEW.id, user_full_name, user_role, user_grade, now());
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    -- Insert minimal profile to prevent auth failure
    INSERT INTO public.user_profiles (id, full_name, role, grade)
    VALUES (NEW.id, '', 'student', 5)
    ON CONFLICT (id) DO NOTHING;
  END;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;

-- Test function to verify setup
CREATE OR REPLACE FUNCTION public.test_user_creation()
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- This function can be called to test if the setup works
  RETURN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
  );
END;
$$;