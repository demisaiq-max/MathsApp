/*
  # Add User Validation Functions

  1. Functions
    - `check_user_exists` - Check if user already exists by email
    - `validate_user_signup` - Validate signup data before creating user
  
  2. Security
    - Add validation for duplicate emails
    - Proper error messages for user feedback
*/

-- Function to check if user exists
CREATE OR REPLACE FUNCTION check_user_exists(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user exists in auth.users
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = user_email
  );
END;
$$;

-- Function to validate user signup data
CREATE OR REPLACE FUNCTION validate_user_signup(
  user_email text,
  user_full_name text,
  user_role text,
  user_grade integer DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user already exists
  IF check_user_exists(user_email) THEN
    result := json_build_object(
      'success', false,
      'error', 'User with this email already exists'
    );
    RETURN result;
  END IF;

  -- Validate role
  IF user_role NOT IN ('admin', 'student') THEN
    result := json_build_object(
      'success', false,
      'error', 'Invalid role. Must be admin or student'
    );
    RETURN result;
  END IF;

  -- Validate grade for students
  IF user_role = 'student' AND (user_grade IS NULL OR user_grade < 5 OR user_grade > 10) THEN
    result := json_build_object(
      'success', false,
      'error', 'Students must have a grade between 5 and 10'
    );
    RETURN result;
  END IF;

  -- Validate full name
  IF user_full_name IS NULL OR trim(user_full_name) = '' THEN
    result := json_build_object(
      'success', false,
      'error', 'Full name is required'
    );
    RETURN result;
  END IF;

  -- All validations passed
  result := json_build_object(
    'success', true,
    'message', 'Validation passed'
  );
  RETURN result;
END;
$$;

-- Update the handle_new_user function to include better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_full_name text;
  user_role text;
  user_grade integer;
BEGIN
  -- Extract metadata from raw_user_meta_data
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  user_grade := CASE 
    WHEN NEW.raw_user_meta_data->>'grade' IS NOT NULL 
    THEN (NEW.raw_user_meta_data->>'grade')::integer 
    ELSE NULL 
  END;

  -- Insert into user_profiles with error handling
  BEGIN
    INSERT INTO public.user_profiles (
      id,
      full_name,
      role,
      grade,
      created_at
    ) VALUES (
      NEW.id,
      user_full_name,
      user_role,
      user_grade,
      NOW()
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- User profile already exists, update it instead
      UPDATE public.user_profiles 
      SET 
        full_name = user_full_name,
        role = user_role,
        grade = user_grade
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log the error and re-raise
      RAISE EXCEPTION 'Error creating user profile: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION validate_user_signup(text, text, text, integer) TO authenticated, anon;