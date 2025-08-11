import { supabase } from '../lib/supabase';

export interface ExamQuestion {
  id?: string;
  exam_id?: string;
  question_number: number;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question_text: string;
  options?: string[];
  correct_answer: string;
  points?: number;
  created_at?: string;
}

export interface CreateExamData {
  title: string;
  grade_level: number;
  subject: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  questions: ExamQuestion[];
}

export interface ExamWithQuestions {
  id: string;
  title: string;
  subject: string;
  grade_level: number;
  grade_name?: string;
  subject_name?: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
  status?: string;
  created_by?: string;
  created_at?: string;
  questions: ExamQuestion[];
}

export const examManagementApi = {
  async createExam(examData: CreateExamData): Promise<ExamWithQuestions> {
    try {
      // Determine status based on start time
      const now = new Date();
      const startTime = new Date(examData.start_time);
      const status = startTime > now ? 'scheduled' : 'active';
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create exam with proper status
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert({
          title: examData.title,
          grade_level: examData.grade_level,
          subject: examData.subject,
          duration_minutes: examData.duration_minutes,
          start_time: examData.start_time,
          end_time: examData.end_time,
          status: status,
          is_active: true,
          created_by: user?.id
        })
        .select()
        .single();

      if (examError) throw examError;

      // Insert questions with validated data
      if (examData.questions.length > 0) {
        const questionsToInsert = examData.questions.map(q => ({
          exam_id: exam.id,
          question_number: q.question_number,
          question_type: q.question_type,
          question_text: q.question_text,
          options: q.question_type === 'multiple_choice' ? q.options : null,
          correct_answer: q.correct_answer,
          points: q.points || 1
        }));

        const { error: questionsError } = await supabase
          .from('exam_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      // Return exam with questions
      return {
        ...exam,
        questions: examData.questions
      };
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  },

  async getExams(gradeId?: string, subjectId?: string): Promise<ExamWithQuestions[]> {
    try {
      let query = supabase
        .from('exams')
        .select(`
          *,
          exam_questions(*)
        `)
        .order('created_at', { ascending: false });

      if (gradeId) {
        query = query.eq('grade_level', parseInt(gradeId));
      }

      if (subjectId) {
        query = query.eq('subject', subjectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(exam => ({
        ...exam,
        grade_name: `Grade ${exam.grade_level}`,
        subject_name: exam.subject,
        questions: exam.exam_questions || []
      })) || [];
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },

  async getStudentExams(studentGrade: number): Promise<ExamWithQuestions[]> {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          exam_questions(*)
        `)
        .eq('grade_level', studentGrade)
        .in('status', ['scheduled', 'active'])
        .eq('is_active', true)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return data?.map(exam => ({
        ...exam,
        questions: exam.exam_questions || []
      })) || [];
    } catch (error) {
      console.error('Error fetching student exams:', error);
      throw error;
    }
  },

  async updateExamStatuses(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Update scheduled exams that should be active
      await supabase
        .from('exams')
        .update({ status: 'active' })
        .eq('status', 'scheduled')
        .lte('start_time', now)
        .gt('end_time', now);

      // Update active exams that should be completed
      await supabase
        .from('exams')
        .update({ status: 'completed' })
        .eq('status', 'active')
        .lte('end_time', now);
    } catch (error) {
      console.error('Error updating exam statuses:', error);
      throw error;
    }
  },

  async getUpcomingExams(): Promise<ExamWithQuestions[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          exam_questions(*)
        `)
        .eq('status', 'scheduled')
        .gt('start_time', now)
        .eq('is_active', true)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return data?.map(exam => ({
        ...exam,
        questions: exam.exam_questions || []
      })) || [];
    } catch (error) {
      console.error('Error fetching upcoming exams:', error);
      throw error;
    }
  }
};