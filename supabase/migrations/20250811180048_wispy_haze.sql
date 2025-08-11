/*
  # Create filtering system with grades, subjects, and enhanced exam management

  1. New Tables
    - `grades` - Grade levels (5, 6, 7, etc.)
    - `subjects` - Subject names (Math, Physics, etc.)
    - `grades_subjects` - Many-to-many mapping between grades and subjects
    - Enhanced `exams` table with proper grade/subject relationships
    - Enhanced `submissions` table with better status tracking
    - `announcements` - Teacher announcements per grade/subject
    - `questions_board` - Student Q&A forum
    - `board_replies` - Replies to Q&A threads

  2. Security
    - Enable RLS on all tables
    - Add policies for teachers and students
    - Helper function for user grade detection

  3. Indexes
    - Performance indexes for filtering and sorting
*/

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create grades_subjects mapping table
CREATE TABLE IF NOT EXISTS grades_subjects (
  grade_id uuid REFERENCES grades(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (grade_id, subject_id)
);

-- Update exams table structure
DO $$
BEGIN
  -- Add grade_id and subject_id columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exams' AND column_name = 'grade_id'
  ) THEN
    ALTER TABLE exams ADD COLUMN grade_id uuid REFERENCES grades(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exams' AND column_name = 'subject_id'
  ) THEN
    ALTER TABLE exams ADD COLUMN subject_id uuid REFERENCES subjects(id);
  END IF;

  -- Add requires_submission column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exams' AND column_name = 'requires_submission'
  ) THEN
    ALTER TABLE exams ADD COLUMN requires_submission boolean DEFAULT true;
  END IF;

  -- Add instructions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exams' AND column_name = 'instructions'
  ) THEN
    ALTER TABLE exams ADD COLUMN instructions text;
  END IF;

  -- Add max_attempts column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exams' AND column_name = 'max_attempts'
  ) THEN
    ALTER TABLE exams ADD COLUMN max_attempts integer DEFAULT 1;
  END IF;
END $$;

-- Update exam_questions table
DO $$
BEGIN
  -- Add question_type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type_enum') THEN
    CREATE TYPE question_type_enum AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay');
  END IF;

  -- Update question_type column to use enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exam_questions' AND column_name = 'question_type' AND data_type = 'text'
  ) THEN
    ALTER TABLE exam_questions ALTER COLUMN question_type TYPE question_type_enum USING question_type::question_type_enum;
  END IF;
END $$;

-- Update profiles table to reference grades
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'grade_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN grade_id uuid REFERENCES grades(id);
  END IF;
END $$;

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  grade_id uuid NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions_board table
CREATE TABLE IF NOT EXISTS questions_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  grade_id uuid NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create board_replies table
CREATE TABLE IF NOT EXISTS board_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES questions_board(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_answer boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default grades
INSERT INTO grades (name, display_order) VALUES
  ('Grade 5', 5),
  ('Grade 6', 6),
  ('Grade 7', 7),
  ('Grade 8', 8),
  ('Grade 9', 9),
  ('Grade 10', 10),
  ('Grade 11', 11),
  ('Grade 12', 12)
ON CONFLICT (name) DO NOTHING;

-- Insert default subjects
INSERT INTO subjects (name, description) VALUES
  ('Mathematics', 'Mathematics and Algebra'),
  ('Physics', 'Physics and Physical Sciences'),
  ('Chemistry', 'Chemistry and Chemical Sciences'),
  ('Biology', 'Biology and Life Sciences'),
  ('English', 'English Language and Literature'),
  ('History', 'History and Social Studies'),
  ('Geography', 'Geography and Earth Sciences'),
  ('Computer Science', 'Computer Science and Programming')
ON CONFLICT (name) DO NOTHING;

-- Create grade-subject mappings
INSERT INTO grades_subjects (grade_id, subject_id)
SELECT g.id, s.id
FROM grades g
CROSS JOIN subjects s
WHERE 
  (g.name IN ('Grade 5', 'Grade 6') AND s.name IN ('Mathematics', 'English', 'History', 'Geography')) OR
  (g.name IN ('Grade 7', 'Grade 8') AND s.name IN ('Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Geography')) OR
  (g.name IN ('Grade 9', 'Grade 10', 'Grade 11', 'Grade 12') AND s.name IN ('Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'))
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exams_grade_subject_time ON exams(grade_id, subject_id, start_time);
CREATE INDEX IF NOT EXISTS idx_profiles_grade ON profiles(grade_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_exam_status ON exam_submissions(exam_id, grade, percentage);
CREATE INDEX IF NOT EXISTS idx_announcements_grade_created ON announcements_new(grade_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_board_grade_subject_created ON questions_board(grade_id, subject_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_board_replies_thread ON board_replies(thread_id, created_at);

-- Helper function to get user's grade
CREATE OR REPLACE FUNCTION get_user_grade()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT grade_id FROM profiles WHERE id = auth.uid();
$$;

-- Helper function to get user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Enable RLS on new tables
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grades
CREATE POLICY "Everyone can read grades"
  ON grades FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for subjects
CREATE POLICY "Everyone can read subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for grades_subjects
CREATE POLICY "Everyone can read grade-subject mappings"
  ON grades_subjects FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for announcements_new
CREATE POLICY "Teachers can create announcements"
  ON announcements_new FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin' AND teacher_id = auth.uid());

CREATE POLICY "Teachers can update own announcements"
  ON announcements_new FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid() AND get_user_role() = 'admin');

CREATE POLICY "Teachers can delete own announcements"
  ON announcements_new FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid() AND get_user_role() = 'admin');

CREATE POLICY "Users can read announcements for their grade"
  ON announcements_new FOR SELECT
  TO authenticated
  USING (grade_id = get_user_grade() OR get_user_role() = 'admin');

-- RLS Policies for questions_board
CREATE POLICY "Students can create questions for their grade"
  ON questions_board FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid() AND grade_id = get_user_grade());

CREATE POLICY "Users can read questions for their grade"
  ON questions_board FOR SELECT
  TO authenticated
  USING (grade_id = get_user_grade() OR get_user_role() = 'admin');

CREATE POLICY "Students can update own questions"
  ON questions_board FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can update question status"
  ON questions_board FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'admin');

CREATE POLICY "Authors can delete own questions"
  ON questions_board FOR DELETE
  TO authenticated
  USING (student_id = auth.uid() OR get_user_role() = 'admin');

-- RLS Policies for board_replies
CREATE POLICY "Users can create replies for threads in their grade"
  ON board_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM questions_board qb 
      WHERE qb.id = thread_id AND (qb.grade_id = get_user_grade() OR get_user_role() = 'admin')
    )
  );

CREATE POLICY "Users can read replies for threads in their grade"
  ON board_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions_board qb 
      WHERE qb.id = thread_id AND (qb.grade_id = get_user_grade() OR get_user_role() = 'admin')
    )
  );

CREATE POLICY "Authors can update own replies"
  ON board_replies FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Authors can delete own replies"
  ON board_replies FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR get_user_role() = 'admin');

-- Update existing exams to have proper grade/subject relationships (sample data)
DO $$
DECLARE
  grade_5_id uuid;
  grade_9_id uuid;
  math_id uuid;
  physics_id uuid;
BEGIN
  SELECT id INTO grade_5_id FROM grades WHERE name = 'Grade 5' LIMIT 1;
  SELECT id INTO grade_9_id FROM grades WHERE name = 'Grade 9' LIMIT 1;
  SELECT id INTO math_id FROM subjects WHERE name = 'Mathematics' LIMIT 1;
  SELECT id INTO physics_id FROM subjects WHERE name = 'Physics' LIMIT 1;
  
  -- Update existing exams with grade/subject if they exist
  UPDATE exams SET grade_id = grade_9_id, subject_id = math_id WHERE grade_level = 9 AND subject = 'Math';
  UPDATE exams SET grade_id = grade_9_id, subject_id = physics_id WHERE grade_level = 9 AND subject = 'Physics';
END $$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements_new
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER questions_board_updated_at
  BEFORE UPDATE ON questions_board
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER board_replies_updated_at
  BEFORE UPDATE ON board_replies
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();