import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'student'
          grade: number | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role: 'admin' | 'student'
          grade?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'admin' | 'student'
          grade?: number | null
          created_at?: string
        }
      }
      answer_sheets: {
        Row: {
          id: string
          exam_date: string
          grade: number
          subject_type: string
          selection_type: string
          question_no: number
          correct_answer: string
          weight: number
          created_at: string
        }
        Insert: {
          id?: string
          exam_date: string
          grade: number
          subject_type: string
          selection_type: string
          question_no: number
          correct_answer: string
          weight?: number
          created_at?: string
        }
        Update: {
          id?: string
          exam_date?: string
          grade?: number
          subject_type?: string
          selection_type?: string
          question_no?: number
          correct_answer?: string
          weight?: number
          created_at?: string
        }
      }
      student_answers: {
        Row: {
          id: string
          student_id: string
          exam_date: string
          grade: number
          subject_type: string
          selection_type: string
          question_no: number
          answer: string
          submitted_at: string
        }
        Insert: {
          id?: string
          student_id: string
          exam_date: string
          grade: number
          subject_type: string
          selection_type: string
          question_no: number
          answer: string
          submitted_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          exam_date?: string
          grade?: number
          subject_type?: string
          selection_type?: string
          question_no?: number
          answer?: string
          submitted_at?: string
        }
      }
      scoring_results: {
        Row: {
          id: string
          student_id: string
          exam_date: string
          grade: number
          subject_type: string
          selection_type: string
          question_no: number
          correct_answer: string
          student_answer: string
          is_correct: boolean
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          exam_date: string
          grade: number
          subject_type: string
          selection_type: string
          question_no: number
          correct_answer: string
          student_answer: string
          is_correct: boolean
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          exam_date?: string
          grade?: number
          subject_type?: string
          selection_type?: string
          question_no?: number
          correct_answer?: string
          student_answer?: string
          is_correct?: boolean
          score?: number
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          grade: number
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          grade: number
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          grade?: number
          email?: string
          created_at?: string
        }
      }
      board_posts: {
        Row: {
          id: string
          student_id: string
          student_name: string
          post_title: string
          post_content: string
          posted_at: string
        }
        Insert: {
          id?: string
          student_id: string
          student_name: string
          post_title: string
          post_content: string
          posted_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          student_name?: string
          post_title?: string
          post_content?: string
          posted_at?: string
        }
      }
    }
  }
}