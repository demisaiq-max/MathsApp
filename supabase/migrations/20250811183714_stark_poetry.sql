/*
  # Add grade level support to announcements and Q&A posts

  1. Updates
    - Add grade_level column to announcements table
    - Add grade_level column to qa_posts table
    - Update RLS policies to filter by grade level
  
  2. Security
    - Students can only see announcements for their grade or general announcements
    - Q&A posts are filtered by grade level
*/

-- Add grade_level to announcements if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcements' AND column_name = 'grade_level'
  ) THEN
    ALTER TABLE announcements ADD COLUMN grade_level integer;
    ALTER TABLE announcements ADD CONSTRAINT announcements_grade_level_check 
    CHECK (grade_level >= 5 AND grade_level <= 12);
  END IF;
END $$;

-- Add grade_level to qa_posts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qa_posts' AND column_name = 'grade_level'
  ) THEN
    ALTER TABLE qa_posts ADD COLUMN grade_level integer;
    ALTER TABLE qa_posts ADD CONSTRAINT qa_posts_grade_level_check 
    CHECK (grade_level >= 5 AND grade_level <= 12);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_grade_created 
ON announcements(grade_level, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qa_posts_grade_created 
ON qa_posts(grade_level, created_at DESC);

-- Update RLS policies for announcements
DROP POLICY IF EXISTS "Students can read announcements for their grade" ON announcements;
CREATE POLICY "Students can read announcements for their grade"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    grade_level IS NULL OR 
    grade_level = (SELECT grade FROM profiles WHERE id = uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = uid() AND role = 'admin')
  );

-- Update RLS policies for qa_posts
DROP POLICY IF EXISTS "Students can read Q&A posts for their grade" ON qa_posts;
CREATE POLICY "Students can read Q&A posts for their grade"
  ON qa_posts
  FOR SELECT
  TO authenticated
  USING (
    grade_level IS NULL OR 
    grade_level = (SELECT grade FROM profiles WHERE id = uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = uid() AND role = 'admin')
  );