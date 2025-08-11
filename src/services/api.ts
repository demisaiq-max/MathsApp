import { supabase } from '../lib/supabase';
import { AnswerSheet, StudentAnswer, ScoringResult, Student, BoardPost, ExamStats } from '../types';

export const apiService = {
  // Answer Sheets
  getAnswerSheets: async (): Promise<AnswerSheet[]> => {
    const { data, error } = await supabase
      .from('answer_sheets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(sheet => ({
      id: sheet.id,
      examDate: sheet.exam_date,
      grade: sheet.grade,
      subjectType: sheet.subject_type,
      selectionType: sheet.selection_type,
      questionNo: sheet.question_no,
      correctAnswer: sheet.correct_answer,
      weight: sheet.weight
    }));
  },

  createAnswerSheet: async (answerSheet: Omit<AnswerSheet, 'id'>): Promise<AnswerSheet> => {
    const { data, error } = await supabase
      .from('answer_sheets')
      .insert({
        exam_date: answerSheet.examDate,
        grade: answerSheet.grade,
        subject_type: answerSheet.subjectType,
        selection_type: answerSheet.selectionType,
        question_no: answerSheet.questionNo,
        correct_answer: answerSheet.correctAnswer,
        weight: answerSheet.weight
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      examDate: data.exam_date,
      grade: data.grade,
      subjectType: data.subject_type,
      selectionType: data.selection_type,
      questionNo: data.question_no,
      correctAnswer: data.correct_answer,
      weight: data.weight
    };
  },

  deleteAnswerSheet: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('answer_sheets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Student Answers
  submitStudentAnswer: async (answer: Omit<StudentAnswer, 'id' | 'submittedAt'>): Promise<StudentAnswer> => {
    const { data, error } = await supabase
      .from('student_answers')
      .insert({
        student_id: answer.studentId,
        exam_date: answer.examDate,
        grade: answer.grade,
        subject_type: answer.subjectType,
        selection_type: answer.selectionType,
        question_no: answer.questionNo,
        answer: answer.answer
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      studentId: data.student_id,
      examDate: data.exam_date,
      grade: data.grade,
      subjectType: data.subject_type,
      selectionType: data.selection_type,
      questionNo: data.question_no,
      answer: data.answer,
      submittedAt: data.submitted_at
    };
  },

  // Scoring
  calculateScores: async (examDate: string, grade: number): Promise<ScoringResult[]> => {
    // Get answer sheets for this exam
    const { data: answerSheets, error: answerError } = await supabase
      .from('answer_sheets')
      .select('*')
      .eq('exam_date', examDate)
      .eq('grade', grade);
    
    if (answerError) throw answerError;
    
    // Get student answers for this exam
    const { data: studentAnswers, error: studentError } = await supabase
      .from('student_answers')
      .select('*')
      .eq('exam_date', examDate)
      .eq('grade', grade);
    
    if (studentError) throw studentError;
    
    const results: ScoringResult[] = [];
    
    // Calculate scores
    for (const studentAnswer of studentAnswers) {
      const answerSheet = answerSheets.find(
        sheet => sheet.question_no === studentAnswer.question_no &&
                sheet.subject_type === studentAnswer.subject_type &&
                sheet.selection_type === studentAnswer.selection_type
      );
      
      if (answerSheet) {
        const isCorrect = answerSheet.correct_answer.toLowerCase() === studentAnswer.answer.toLowerCase();
        const score = isCorrect ? answerSheet.weight : 0;
        
        const result = {
          student_id: studentAnswer.student_id,
          exam_date: studentAnswer.exam_date,
          grade: studentAnswer.grade,
          subject_type: studentAnswer.subject_type,
          selection_type: studentAnswer.selection_type,
          question_no: studentAnswer.question_no,
          correct_answer: answerSheet.correct_answer,
          student_answer: studentAnswer.answer,
          is_correct: isCorrect,
          score: score
        };
        
        results.push({
          id: '',
          studentId: result.student_id,
          examDate: result.exam_date,
          grade: result.grade,
          subjectType: result.subject_type,
          selectionType: result.selection_type,
          questionNo: result.question_no,
          correctAnswer: result.correct_answer,
          studentAnswer: result.student_answer,
          isCorrect: result.is_correct,
          score: result.score
        });
      }
    }
    
    // Save results to database
    if (results.length > 0) {
      const { error: insertError } = await supabase
        .from('scoring_results')
        .upsert(results.map(result => ({
          student_id: result.studentId,
          exam_date: result.examDate,
          grade: result.grade,
          subject_type: result.subjectType,
          selection_type: result.selectionType,
          question_no: result.questionNo,
          correct_answer: result.correctAnswer,
          student_answer: result.studentAnswer,
          is_correct: result.isCorrect,
          score: result.score
        })));
      
      if (insertError) throw insertError;
    }
    
    return results;
  },

  getScoreResults: async (studentId?: string): Promise<ScoringResult[]> => {
    let query = supabase
      .from('scoring_results')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(result => ({
      id: result.id,
      studentId: result.student_id,
      examDate: result.exam_date,
      grade: result.grade,
      subjectType: result.subject_type,
      selectionType: result.selection_type,
      questionNo: result.question_no,
      correctAnswer: result.correct_answer,
      studentAnswer: result.student_answer,
      isCorrect: result.is_correct,
      score: result.score
    }));
  },

  // Students
  getStudents: async (): Promise<Student[]> => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(student => ({
      id: student.id,
      name: student.name,
      grade: student.grade,
      email: student.email,
      createdAt: student.created_at
    }));
  },

  createStudent: async (student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> => {
    const { data, error } = await supabase
      .from('students')
      .insert({
        name: student.name,
        grade: student.grade,
        email: student.email
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      grade: data.grade,
      email: data.email,
      createdAt: data.created_at
    };
  },

  deleteStudent: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Board Posts
  getBoardPosts: async (): Promise<BoardPost[]> => {
    const { data, error } = await supabase
      .from('board_posts')
      .select('*')
      .order('posted_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(post => ({
      id: post.id,
      studentId: post.student_id,
      studentName: post.student_name,
      postTitle: post.post_title,
      postContent: post.post_content,
      postedAt: post.posted_at
    }));
  },

  deleteBoardPost: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('board_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Statistics
  getExamStats: async (): Promise<ExamStats> => {
    // Get total exams (unique exam dates)
    const { data: examData, error: examError } = await supabase
      .from('answer_sheets')
      .select('exam_date')
      .distinct();
    
    if (examError) throw examError;
    
    // Get total students
    const { count: totalStudents, error: studentsError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    if (studentsError) throw studentsError;
    
    // Get total submissions
    const { count: totalSubmissions, error: submissionsError } = await supabase
      .from('student_answers')
      .select('*', { count: 'exact', head: true });
    
    if (submissionsError) throw submissionsError;
    
    // Get average score
    const { data: scoreData, error: scoreError } = await supabase
      .from('scoring_results')
      .select('score');
    
    if (scoreError) throw scoreError;
    
    const averageScore = scoreData.length > 0 
      ? scoreData.reduce((sum, result) => sum + result.score, 0) / scoreData.length
      : 0;
    
    return {
      totalExams: examData?.length || 0,
      totalStudents: totalStudents || 0,
      totalSubmissions: totalSubmissions || 0,
      averageScore: Math.round(averageScore * 10) / 10
    };
  }
};