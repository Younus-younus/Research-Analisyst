/*
  # Create posts table for research sharing platform

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `abstract` (text)
      - `content` (text)
      - `category` (text)

  2. Security
    - Enable RLS on posts table
    - Add policies for:
      - Anyone can read posts
      - Authenticated users can create posts
      - Users can only update/delete their own posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  abstract text NOT NULL,
  content text NOT NULL,
  category text NOT NULL
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read posts
CREATE POLICY "Anyone can read posts"
  ON posts
  FOR SELECT
  USING (true);

-- Allow authenticated users to create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);