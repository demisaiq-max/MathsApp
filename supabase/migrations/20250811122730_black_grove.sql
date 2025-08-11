/*
  # Create Student Math Score Management Schema

  1. New Tables
    - `answer_sheets`
      - `id` (uuid, primary key)
      - `exam_date` (date)
      - `grade` (integer)
      - `subject_type` (text)
      - `selection_type` (text)
      - `question_no` (integer)
      - `correct_answer` (text)
      - `weight` (integer, default 1)
      - `created_at` (timestamp)

    - `student_answers`
      - `id` (uuid, primary key)
      - `student_id` (text)
      - `exam_date` (date)
      - `grade` (integer)
      - `subject_type` (text)
      - `selection_type` (text)
      - `question_no` (integer)
      - `answer` (text)
      - `submitted_at` (timestamp)

    - `scoring_results`
      - `id` (uuid, primary key)
      - `student_id` (text)
      - `exam_date` (date)
      - `grade` (integer)
      - `subject_type` (text)
      - `selection_type` (text)
      - `question_no` (integer)
      - `correct_answer` (text)
      - `student_answer` (text)
      - `is_correct` (boolean)
      - `score` (integer)
      - `created_at` (timestamp)

    - `students`
      - `id` (uuid, primary key)
      - `name` (text)
      - `grade` (integer)
      - `email` (text, unique)
      - `created_at` (timestamp)

    - `board_posts`
      - `id` (uuid, primary key)
      - `student_id` (text)
      - `student_name` (text)
      - `post_title` (text)
      - `post_content` (text)
      - `posted_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
*/

-- Create answer_sheets table
CREATE TABLE IF NOT EXISTS answer_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_date date NOT NULL,
  grade integer NOT NULL,
  subject_type text NOT NULL,
  selection_type text NOT NULL,
  question_no integer NOT NULL,
  correct_answer text NOT NULL,
  weight integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE (exam_date, grade, subject_type, selection_type, question_no)
);

-- Create student_answers table
CREATE TABLE IF NOT EXISTS student_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  exam_date date NOT NULL,
  grade integer NOT NULL,
  subject_type text NOT NULL,
  selection_type text NOT NULL,
  question_no integer NOT NULL,
  answer text NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Create scoring_results table
CREATE TABLE IF NOT EXISTS scoring_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  exam_date date NOT NULL,
  grade integer NOT NULL,
  subject_type text NOT NULL,
  selection_type text NOT NULL,
  question_no integer NOT NULL,
  correct_answer text NOT NULL,
  student_answer text NOT NULL,
  is_correct boolean NOT NULL,
  score integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade integer NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create board_posts table
CREATE TABLE IF NOT EXISTS board_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  student_name text NOT NULL,
  post_title text NOT NULL,
  post_content text NOT NULL,
  posted_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE answer_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for answer_sheets
CREATE POLICY "Authenticated users can read answer sheets"
  ON answer_sheets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert answer sheets"
  ON answer_sheets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update answer sheets"
  ON answer_sheets
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete answer sheets"
  ON answer_sheets
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for student_answers
CREATE POLICY "Authenticated users can read student answers"
  ON student_answers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert student answers"
  ON student_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update student answers"
  ON student_answers
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete student answers"
  ON student_answers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for scoring_results
CREATE POLICY "Authenticated users can read scoring results"
  ON scoring_results
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert scoring results"
  ON scoring_results
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update scoring results"
  ON scoring_results
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete scoring results"
  ON scoring_results
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for students
CREATE POLICY "Authenticated users can read students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete students"
  ON students
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for board_posts
CREATE POLICY "Authenticated users can read board posts"
  ON board_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert board posts"
  ON board_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update board posts"
  ON board_posts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete board posts"
  ON board_posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_answer_sheets_exam ON answer_sheets(exam_date, grade, subject_type);
CREATE INDEX IF NOT EXISTS idx_student_answers_student ON student_answers(student_id, exam_date);
CREATE INDEX IF NOT EXISTS idx_scoring_results_student ON scoring_results(student_id, exam_date);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_board_posts_student ON board_posts(student_id, posted_at DESC);