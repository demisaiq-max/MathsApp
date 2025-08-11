/*
  # Add grade-based filtering to announcements

  1. Changes
    - Add grade_level column to announcements table
    - Add index for efficient grade-based filtering
    - Update RLS policies to support grade filtering

  2. Security
    - Maintain existing RLS policies
    - Add grade-based access control
*/

-- Add grade_level column to announcements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcements' AND column_name = 'grade_level'
  ) THEN
    ALTER TABLE announcements ADD COLUMN grade_level integer;
  END IF;
END $$;

-- Add check constraint for grade_level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'announcements_grade_level_check'
  ) THEN
    ALTER TABLE announcements 
    ADD CONSTRAINT announcements_grade_level_check 
    CHECK (grade_level >= 5 AND grade_level <= 12);
  END IF;
END $$;

-- Add index for grade-based filtering
CREATE INDEX IF NOT EXISTS idx_announcements_grade_created 
ON announcements(grade_level, created_at DESC);

-- Update RLS policies to support grade filtering
DROP POLICY IF EXISTS "All authenticated users can read announcements" ON announcements;

CREATE POLICY "Students can read announcements for their grade"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    grade_level IS NULL OR 
    grade_level = (SELECT grade FROM profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add grade_level to qa_posts as well
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qa_posts' AND column_name = 'grade_level'
  ) THEN
    ALTER TABLE qa_posts ADD COLUMN grade_level integer;
  END IF;
END $$;

-- Add check constraint for qa_posts grade_level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'qa_posts_grade_level_check'
  ) THEN
    ALTER TABLE qa_posts 
    ADD CONSTRAINT qa_posts_grade_level_check 
    CHECK (grade_level >= 5 AND grade_level <= 12);
  END IF;
END $$;

-- Add index for qa_posts grade-based filtering
CREATE INDEX IF NOT EXISTS idx_qa_posts_grade_created 
ON qa_posts(grade_level, created_at DESC);

-- Update RLS policies for qa_posts
DROP POLICY IF EXISTS "All authenticated users can read Q&A posts" ON qa_posts;

CREATE POLICY "Students can read Q&A posts for their grade"
  ON qa_posts
  FOR SELECT
  TO authenticated
  USING (
    grade_level IS NULL OR 
    grade_level = (SELECT grade FROM profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );