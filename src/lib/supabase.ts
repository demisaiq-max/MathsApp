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
      grades: {
        Row: {
          id: string
          name: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_order: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_order?: number
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      grades_subjects: {
        Row: {
          grade_id: string
          subject_id: string
          created_at: string
        }
        Insert: {
          grade_id: string
          subject_id: string
          created_at?: string
        }
        Update: {
          grade_id?: string
          subject_id?: string
          created_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          title: string
          grade_id: string
          subject_id: string
          duration_minutes: number
          start_time: string
          end_time: string
          status: string
          instructions: string | null
          requires_submission: boolean
          max_attempts: number
          is_active: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          grade_id: string
          subject_id: string
          duration_minutes?: number
          start_time: string
          end_time: string
          status?: string
          instructions?: string | null
          requires_submission?: boolean
          max_attempts?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          grade_id?: string
          subject_id?: string
          duration_minutes?: number
          start_time?: string
          end_time?: string
          status?: string
          instructions?: string | null
          requires_submission?: boolean
          max_attempts?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
      exam_questions: {
        Row: {
          id: string
          exam_id: string
          question_number: number
          question_type: string
          question_text: string
          options: any | null
          correct_answer: string
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          question_number: number
          question_type: string
          question_text: string
          options?: any | null
          correct_answer: string
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          question_number?: number
          question_type?: string
          question_text?: string
          options?: any | null
          correct_answer?: string
          points?: number
          created_at?: string
        }
      }
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