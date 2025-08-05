import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Database types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  user_id: string;
  answers: any;
  created_at: string;
}

export interface CareerRecommendationDB {
  id: string;
  user_id: string;
  assessment_id: string | null;
  title: string;
  match_percentage: number;
  description: string;
  average_salary: string;
  growth_rate: string;
  required_skills: string[];
  learning_path: string[];
  job_market_demand: string;
  selected_countries: string[];
  created_at: string;
}