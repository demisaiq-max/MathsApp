/*
  # Create Student Exam Data Tables

  1. New Tables
    - `exam_results`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references profiles)
      - `subject` (text)
      - `score` (integer)
      - `max_score` (integer, default 100)
      - `grade` (text)
      - `exam_date` (date)
      - `created_at` (timestamp)
    
    - `upcoming_exams`
      - `id` (uuid, primary key)
      - `subject` (text)
      - `exam_date` (date)
      - `exam_time` (time)
      - `grade_level` (integer)
      - `created_at` (timestamp)
    
    - `board_updates`
      - `id` (uuid, primary key)
      - `author_name` (text)
      - `author_initials` (text)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for students to read their own data
    - Add policies for admins to manage all data
*/

-- Create exam_results table
CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  score integer NOT NULL CHECK (score >= 0),
  max_score integer DEFAULT 100 CHECK (max_score > 0),
  grade text NOT NULL,
  exam_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create upcoming_exams table
CREATE TABLE IF NOT EXISTS upcoming_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  exam_date date NOT NULL,
  exam_time time NOT NULL,
  grade_level integer NOT NULL CHECK (grade_level >= 5 AND grade_level <= 12),
  created_at timestamptz DEFAULT now()
);

-- Create board_updates table
CREATE TABLE IF NOT EXISTS board_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_initials text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_updates ENABLE ROW LEVEL SECURITY;

-- Policies for exam_results
CREATE POLICY "Students can read own exam results"
  ON exam_results
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Admins can read all exam results"
  ON exam_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert exam results"
  ON exam_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update exam results"
  ON exam_results
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete exam results"
  ON exam_results
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for upcoming_exams
CREATE POLICY "Students can read upcoming exams for their grade"
  ON upcoming_exams
  FOR SELECT
  TO authenticated
  USING (
    grade_level = (
      SELECT grade FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage upcoming exams"
  ON upcoming_exams
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for board_updates
CREATE POLICY "All authenticated users can read board updates"
  ON board_updates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage board updates"
  ON board_updates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id, exam_date DESC);
CREATE INDEX IF NOT EXISTS idx_upcoming_exams_grade ON upcoming_exams(grade_level, exam_date);
CREATE INDEX IF NOT EXISTS idx_board_updates_created ON board_updates(created_at DESC);

-- Insert sample data
INSERT INTO board_updates (author_name, author_initials, message) VALUES
('Mr. Johnson', 'MJ', 'New study materials for Calculus have been uploaded. Check them out before the exam!'),
('Ms. Smith', 'MS', 'Reminder: Office hours are available every Tuesday and Thursday from 3-5 PM.'),
('Dr. Wilson', 'DW', 'Great job everyone on the recent Math competition! Results will be posted soon.'),
('Prof. Davis', 'PD', 'Don''t forget to review the practice problems for next week''s geometry test.');

INSERT INTO upcoming_exams (subject, exam_date, exam_time, grade_level) VALUES
('Calculus I', '2025-01-22', '14:00', 12),
('Linear Algebra', '2025-01-25', '10:00', 12),
('Geometry', '2025-01-23', '09:00', 9),
('Algebra II', '2025-01-24', '11:00', 10),
('Statistics', '2025-01-26', '13:00', 11);