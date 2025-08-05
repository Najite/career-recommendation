/*
  # Create users and assessments tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `answers` (jsonb)
      - `created_at` (timestamp)
    
    - `career_recommendations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `assessment_id` (uuid, references assessments)
      - `title` (text)
      - `match_percentage` (integer)
      - `description` (text)
      - `average_salary` (text)
      - `growth_rate` (text)
      - `required_skills` (text[])
      - `learning_path` (text[])
      - `job_market_demand` (text)
      - `selected_countries` (text[])
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create career_recommendations table
CREATE TABLE IF NOT EXISTS career_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE,
  title text NOT NULL,
  match_percentage integer NOT NULL,
  description text NOT NULL,
  average_salary text NOT NULL,
  growth_rate text NOT NULL,
  required_skills text[] DEFAULT '{}',
  learning_path text[] DEFAULT '{}',
  job_market_demand text NOT NULL,
  selected_countries text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for assessments
CREATE POLICY "Users can read own assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for career_recommendations
CREATE POLICY "Users can read own recommendations"
  ON career_recommendations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recommendations"
  ON career_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recommendations"
  ON career_recommendations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();