import { supabase } from '../lib/supabase';

// Get available exams for student
export const getAvailableExams = async (): Promise<any[]> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('is_active', true)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Get exam with questions
export const getExamWithQuestions = async (examId: string): Promise<any> => {
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      exam_questions(*)
    `)
    .eq('id', examId)
    .single();

  if (error) throw error;
  return data;
};

// Submit exam answers
export const submitExam = async (examId: string, answers: any): Promise<void> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('exam_submissions')
    .insert({
      exam_id: examId,
      student_id: user.id,
      answers: answers
    });

  if (error) throw error;
};

// Check if student has submitted exam
export const hasSubmittedExam = async (examId: string): Promise<boolean> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return false;

  const { data, error } = await supabase
    .from('exam_submissions')
    .select('id')
    .eq('exam_id', examId)
    .eq('student_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

// Get student submissions
export const getStudentSubmissions = async (): Promise<any[]> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('exam_submissions')
    .select(`
      *,
      exam:exams(title, subject)
    `)
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Upload answer sheet file
export const uploadAnswerSheet = async (
  examId: string,
  file: File
): Promise<void> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  // Convert file to base64 for storage
  const fileBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(fileBuffer);

  const { error } = await supabase
    .from('answer_sheet_uploads')
    .insert({
      student_id: user.id,
      exam_id: examId,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_data: fileData
    });

  if (error) throw error;
};

// Get answer sheet uploads for admin
export const getAnswerSheetUploads = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('answer_sheet_uploads')
    .select(`
      *,
      student:profiles!student_id(full_name),
      exam:exams(title, subject)
    `)
    .order('upload_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Grade answer sheet (admin only)
export const gradeAnswerSheet = async (
  uploadId: string,
  grade: number,
  feedback?: string
): Promise<void> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('answer_sheet_uploads')
    .update({
      admin_grade: grade,
      admin_feedback: feedback,
      graded_by: user.id,
      graded_at: new Date().toISOString(),
      status: 'graded'
    })
    .eq('id', uploadId);

  if (error) throw error;
};

export const examApiService = {
  getAvailableExams,
  getExamWithQuestions,
  submitExam,
  hasSubmittedExam,
  getStudentSubmissions,
  uploadAnswerSheet,
  getAnswerSheetUploads,
  gradeAnswerSheet
};