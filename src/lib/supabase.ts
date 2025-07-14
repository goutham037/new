import { createClient } from '@supabase/supabase-js';

const supabaseUrl =" https://gdbezugvzyyvcgvmxnbw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYmV6dWd2enl5dmNndm14bmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTE5ODQsImV4cCI6MjA2Nzg2Nzk4NH0.q4kHpVx_br4W56hQa_4xK4CY6ZwNxBB9GfkBDTuG5RA";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  subscription_status: 'active' | 'inactive' | 'trial';
  subscription_plan: string;
  subscription_expires_at?: string;
  total_tests_taken: number;
  average_score: number;
  current_rank: number;
}

export interface TestSeries {
  id: string;
  title: string;
  description: string;
  exam_type: 'TGECET' | 'APECET';
  subject: string;
  duration_minutes: number;
  total_questions: number;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  test_series_id: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  created_at: string;
}

export interface TestAttempt {
  id: string;
  user_id: string;
  test_series_id: string;
  started_at: string;
  completed_at?: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number;
  is_completed: boolean;
  answers: Record<string, string>; // question_id -> selected_option
  marked_for_review: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'TGECET_Monthly' | 'APECET_Monthly' | 'Both_Monthly' | 'TGECET_Yearly' | 'APECET_Yearly' | 'Both_Yearly';
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string;
  razorpay_subscription_id?: string;
  amount: number;
  currency: string;
}

export interface Leaderboard {
  id: string;
  user_id: string;
  test_series_id: string;
  score: number;
  time_taken_seconds: number;
  rank: number;
  percentile: number;
  created_at: string;
}