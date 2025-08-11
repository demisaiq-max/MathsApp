-- Fix exam_questions constraint and add proper status management
-- Drop and recreate constraint with correct values
ALTER TABLE exam_questions 
DROP CONSTRAINT IF EXISTS exam_questions_question_type_check;

ALTER TABLE exam_questions 
ADD CONSTRAINT exam_questions_question_type_check 
CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay'));

-- Ensure exams table has proper status enum
ALTER TABLE exams 
DROP CONSTRAINT IF EXISTS exams_status_check;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exams' AND column_name = 'status'
  ) THEN
    ALTER TABLE exams ADD COLUMN status text DEFAULT 'draft';
  END IF;
END $$;

ALTER TABLE exams 
ADD CONSTRAINT exams_status_check 
CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'cancelled'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exams_grade_subject_status 
ON exams(grade_level, subject, status, start_time);

CREATE INDEX IF NOT EXISTS idx_exams_status_time 
ON exams(status, start_time, end_time);

-- Update existing exams to have proper status
UPDATE exams 
SET status = CASE 
  WHEN start_time > NOW() THEN 'scheduled'
  WHEN start_time <= NOW() AND end_time > NOW() THEN 'active'
  WHEN end_time <= NOW() THEN 'completed'
  ELSE 'draft'
END
WHERE status IS NULL OR status = '';