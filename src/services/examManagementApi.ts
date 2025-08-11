import { supabase } from '../lib/supabase';

export interface ExamQuestion {
  id?: string;
  question_number: number;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question_text: string;
  options?: string[];
  correct_answer: string;
  points: number;
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
  grade_level: number;
  subject: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  status: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  questions: ExamQuestion[];
}

export const examManagementApi = {
  // Create a new exam with questions
  createExam: async (examData: CreateExamData): Promise<string> => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Determine status based on start time
    const now = new Date();
    const startTime = new Date(examData.start_time);
    const status = startTime > now ? 'scheduled' : 'active';

    // Start a transaction
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
        created_by: user.id
      })
      .select()
      .single();

    if (examError) throw examError;

    // Insert questions
    if (examData.questions.length > 0) {
      const questionsToInsert = examData.questions.map(question => {
        // Ensure question_type matches database constraint exactly
        let questionType = question.question_type;
        if (questionType === 'mcq') questionType = 'multiple_choice';
        if (questionType === 'tf') questionType = 'true_false';
        
        return {
        exam_id: exam.id,
        question_number: question.question_number,
        question_type: questionType,
        question_text: question.question_text,
        options: question.question_type === 'multiple_choice' && question.options ? 
          JSON.stringify(question.options) : null,
        correct_answer: question.correct_answer,
        points: question.points || 1
        };
      });

      const { error: questionsError } = await supabase
        .from('exam_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;
    }

    return exam.id;
  },

  // Get exams with filtering
  getExams: async (gradeLevel?: string, subject?: string): Promise<ExamWithQuestions[]> => {
    let query = supabase
      .from('exams')
      .select(`
        *,
        exam_questions(*)
      `)
      .order('created_at', { ascending: false });

    if (gradeLevel) {
      query = query.eq('grade_level', parseInt(gradeLevel));
    }

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(exam => ({
      id: exam.id,
      title: exam.title,
      grade_level: exam.grade_level,
      subject: exam.subject,
      duration_minutes: exam.duration_minutes,
      start_time: exam.start_time,
      end_time: exam.end_time,
      status: exam.status || 'draft',
      is_active: exam.is_active,
      created_by: exam.created_by,
      created_at: exam.created_at,
      questions: exam.exam_questions || []
    }));
  },

  // Get exams for specific student grade
  getStudentExams: async (studentGrade: number): Promise<ExamWithQuestions[]> => {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        exam_questions(*)
      `)
      .eq('grade_level', studentGrade)
      .in('status', ['scheduled', 'active'])
      .order('start_time', { ascending: true });

    if (error) throw error;

    return data.map(exam => ({
      id: exam.id,
      title: exam.title,
      grade_level: exam.grade_level,
      subject: exam.subject,
      duration_minutes: exam.duration_minutes,
      start_time: exam.start_time,
      end_time: exam.end_time,
      status: exam.status || 'draft',
      is_active: exam.is_active,
      created_by: exam.created_by,
      created_at: exam.created_at,
      questions: exam.exam_questions || []
    }));
  },

  // Get upcoming exams
  getUpcomingExams: async (): Promise<ExamWithQuestions[]> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        exam_questions(*)
      `)
      .eq('status', 'scheduled')
      .gt('start_time', now)
      .order('start_time', { ascending: true });

    if (error) throw error;

    return data.map(exam => ({
      id: exam.id,
      title: exam.title,
      grade_level: exam.grade_level,
      subject: exam.subject,
      duration_minutes: exam.duration_minutes,
      start_time: exam.start_time,
      end_time: exam.end_time,
      status: exam.status || 'draft',
      is_active: exam.is_active,
      created_by: exam.created_by,
      created_at: exam.created_at,
      questions: exam.exam_questions || []
    }));
  },

  // Update exam statuses based on time
  updateExamStatuses: async (): Promise<void> => {
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
  },

  // Get single exam with questions
  getExamById: async (examId: string): Promise<ExamWithQuestions | null> => {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        exam_questions(*)
      `)
      .eq('id', examId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      grade_level: data.grade_level,
      subject: data.subject,
      duration_minutes: data.duration_minutes,
      start_time: data.start_time,
      end_time: data.end_time,
      status: data.status || 'draft',
      is_active: data.is_active,
      created_by: data.created_by,
      created_at: data.created_at,
      questions: data.exam_questions || []
    };
  },

  // Update exam
  updateExam: async (examId: string, updates: Partial<CreateExamData>): Promise<void> => {
    const { error } = await supabase
      .from('exams')
      .update({
        title: updates.title,
        grade_level: updates.grade_level,
        subject: updates.subject,
        duration_minutes: updates.duration_minutes,
        start_time: updates.start_time,
        end_time: updates.end_time,
      })
      .eq('id', examId);

    if (error) throw error;

    // Update questions if provided
    if (updates.questions) {
      // Delete existing questions
      await supabase
        .from('exam_questions')
        .delete()
        .eq('exam_id', examId);

      // Insert new questions
      const questionsToInsert = updates.questions.map(question => ({
        exam_id: examId,
        question_number: question.question_number,
        question_type: question.question_type,
        question_text: question.question_text,
        options: question.options ? JSON.stringify(question.options) : null,
        correct_answer: question.correct_answer,
        points: question.points
      }));

      const { error: questionsError } = await supabase
        .from('exam_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;
    }
  },

  // Delete exam
  deleteExam: async (examId: string): Promise<void> => {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', examId);

    if (error) throw error;
  },

  // Toggle exam active status
  toggleExamStatus: async (examId: string, isActive: boolean): Promise<void> => {
    const { error } = await supabase
      .from('exams')
      .update({ is_active: isActive })
      .eq('id', examId);

    if (error) throw error;
  }
};