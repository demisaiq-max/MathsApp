/*
  # Enhanced Board System with Q&A, Likes, and Comments

  1. New Tables
    - `announcements` - Teacher/admin announcements
    - `qa_posts` - Student questions and answers
    - `post_likes` - Likes for announcements and Q&A posts
    - `post_comments` - Comments on announcements and Q&A posts

  2. Security
    - Enable RLS on all tables
    - Students can read all posts, create Q&A posts, like and comment
    - Admins can create announcements and manage all content
*/

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_initials text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Q&A Posts table
CREATE TABLE IF NOT EXISTS qa_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_initials text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  post_type text DEFAULT 'question' CHECK (post_type IN ('question', 'answer')),
  parent_id uuid REFERENCES qa_posts(id) ON DELETE CASCADE,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post Likes table (for both announcements and Q&A posts)
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL,
  post_type text NOT NULL CHECK (post_type IN ('announcement', 'qa_post')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id, post_type)
);

-- Post Comments table (for both announcements and Q&A posts)
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  post_type text NOT NULL CHECK (post_type IN ('announcement', 'qa_post')),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_initials text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_posts_created ON qa_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_posts_parent ON qa_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id, post_type);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id, post_type);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
CREATE POLICY "All authenticated users can read announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete announcements"
  ON announcements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Q&A posts
CREATE POLICY "All authenticated users can read Q&A posts"
  ON qa_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create Q&A posts"
  ON qa_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own Q&A posts"
  ON qa_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own Q&A posts"
  ON qa_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- RLS Policies for post likes
CREATE POLICY "All authenticated users can read post likes"
  ON post_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create post likes"
  ON post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post likes"
  ON post_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for post comments
CREATE POLICY "All authenticated users can read post comments"
  ON post_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create post comments"
  ON post_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own post comments"
  ON post_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own post comments"
  ON post_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Insert sample announcements
INSERT INTO announcements (author_id, author_name, author_initials, title, content, priority) VALUES
  (
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'Mr. Johnson',
    'MJ',
    'New Study Materials Available',
    'New study materials for Calculus have been uploaded to the resource center. Please check them out before the upcoming exam on January 22nd.',
    'high'
  ),
  (
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'Ms. Smith',
    'MS',
    'Office Hours Reminder',
    'Reminder: Office hours are available every Tuesday and Thursday from 3-5 PM in room 204. Feel free to drop by if you need help with any math topics.',
    'normal'
  ),
  (
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'Dr. Wilson',
    'DW',
    'Exam Schedule Update',
    'The midterm exam schedule has been updated. Please check your student portal for the latest dates and times. Make sure to prepare accordingly.',
    'urgent'
  );

-- Insert sample Q&A posts
INSERT INTO qa_posts (author_id, author_name, author_initials, title, content, post_type) VALUES
  (
    (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
    'Sarah Johnson',
    'SJ',
    'Help with Quadratic Equations',
    'I''m having trouble understanding how to solve quadratic equations using the quadratic formula. Can someone explain the steps?',
    'question'
  ),
  (
    (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
    'Mike Davis',
    'MD',
    'Calculus Derivatives Question',
    'What''s the best way to remember the derivative rules? I keep mixing up the power rule and product rule.',
    'question'
  );