/*
  # Add Answer Sheet Upload System

  1. New Tables
    - `answer_sheet_uploads`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to profiles)
      - `exam_id` (uuid, foreign key to exams)
      - `file_name` (text)
      - `file_size` (integer)
      - `file_type` (text)
      - `file_data` (bytea for storing file content)
      - `upload_date` (timestamp)
      - `status` (text - pending, reviewed, graded)
      - `admin_grade` (integer, nullable)
      - `admin_feedback` (text, nullable)
      - `graded_by` (uuid, nullable, foreign key to profiles)
      - `graded_at` (timestamp, nullable)

  2. Security
    - Enable RLS on `answer_sheet_uploads` table
    - Add policies for students to upload their own sheets
    - Add policies for admins to view and grade all sheets
*/

CREATE TABLE IF NOT EXISTS answer_sheet_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  file_type text NOT NULL,
  file_data bytea NOT NULL,
  upload_date timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'graded')),
  admin_grade integer CHECK (admin_grade >= 0 AND admin_grade <= 100),
  admin_feedback text,
  graded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  graded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE answer_sheet_uploads ENABLE ROW LEVEL SECURITY;

-- Students can upload their own answer sheets
CREATE POLICY "Students can upload own answer sheets"
  ON answer_sheet_uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Students can view their own answer sheets
CREATE POLICY "Students can view own answer sheets"
  ON answer_sheet_uploads
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Admins can view all answer sheets
CREATE POLICY "Admins can view all answer sheets"
  ON answer_sheet_uploads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can update answer sheets (for grading)
CREATE POLICY "Admins can update answer sheets"
  ON answer_sheet_uploads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create index for better performance
CREATE INDEX idx_answer_sheet_uploads_student ON answer_sheet_uploads(student_id, upload_date DESC);
CREATE INDEX idx_answer_sheet_uploads_exam ON answer_sheet_uploads(exam_id);
CREATE INDEX idx_answer_sheet_uploads_status ON answer_sheet_uploads(status);