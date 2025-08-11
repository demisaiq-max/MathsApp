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
  grade_id: string;
  subject_id: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  instructions?: string;
  requires_submission: boolean;
  max_attempts: number;
  questions: ExamQuestion[];
}

export interface ExamWithQuestions {
  id: string;
  title: string;
  grade_id: string;
  subject_id: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  instructions?: string;
  requires_submission: boolean;
  max_attempts: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  questions: ExamQuestion[];
  grade_name?: string;
  subject_name?: string;
}

export const examManagementApi = {
  // Create a new exam with questions
  createExam: async (examData: CreateExamData): Promise<string> => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Start a transaction
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert({
        title: examData.title,
        grade_id: examData.grade_id,
        subject_id: examData.subject_id,
        duration_minutes: examData.duration_minutes,
        start_time: examData.start_time,
        end_time: examData.end_time,
        instructions: examData.instructions,
        requires_submission: examData.requires_submission,
        max_attempts: examData.max_attempts,
        is_active: true,
        created_by: user.id
      })
      .select()
      .single();

    if (examError) throw examError;

    // Insert questions
    if (examData.questions.length > 0) {
      const questionsToInsert = examData.questions.map(question => ({
        exam_id: exam.id,
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

    return exam.id;
  },

  // Get exams with filtering
  getExams: async (gradeId?: string, subjectId?: string): Promise<ExamWithQuestions[]> => {
    let query = supabase
      .from('exams')
      .select(`
        *,
        grades(name),
        subjects(name),
        exam_questions(*)
      `)
      .order('created_at', { ascending: false });

    if (gradeId) {
      query = query.eq('grade_id', gradeId);
    }

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(exam => ({
      id: exam.id,
      title: exam.title,
      grade_id: exam.grade_id,
      subject_id: exam.subject_id,
      duration_minutes: exam.duration_minutes,
      start_time: exam.start_time,
      end_time: exam.end_time,
      instructions: exam.instructions,
      requires_submission: exam.requires_submission,
      max_attempts: exam.max_attempts,
      is_active: exam.is_active,
      created_by: exam.created_by,
      created_at: exam.created_at,
      grade_name: exam.grades?.name,
      subject_name: exam.subjects?.name,
      questions: exam.exam_questions || []
    }));
  },

  // Get single exam with questions
  getExamById: async (examId: string): Promise<ExamWithQuestions | null> => {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        grades(name),
        subjects(name),
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
      grade_id: data.grade_id,
      subject_id: data.subject_id,
      duration_minutes: data.duration_minutes,
      start_time: data.start_time,
      end_time: data.end_time,
      instructions: data.instructions,
      requires_submission: data.requires_submission,
      max_attempts: data.max_attempts,
      is_active: data.is_active,
      created_by: data.created_by,
      created_at: data.created_at,
      grade_name: data.grades?.name,
      subject_name: data.subjects?.name,
      questions: data.exam_questions || []
    };
  },

  // Update exam
  updateExam: async (examId: string, updates: Partial<CreateExamData>): Promise<void> => {
    const { error } = await supabase
      .from('exams')
      .update({
        title: updates.title,
        grade_id: updates.grade_id,
        subject_id: updates.subject_id,
        duration_minutes: updates.duration_minutes,
        start_time: updates.start_time,
        end_time: updates.end_time,
        instructions: updates.instructions,
        requires_submission: updates.requires_submission,
        max_attempts: updates.max_attempts
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