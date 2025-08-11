export interface AnswerSheet {
  id: string;
  examDate: string;
  grade: number;
  subjectType: string;
  selectionType: string;
  questionNo: number;
  correctAnswer: string;
  weight: number;
}

export interface StudentAnswer {
  id: string;
  studentId: string;
  examDate: string;
  grade: number;
  subjectType: string;
  selectionType: string;
  questionNo: number;
  answer: string;
  submittedAt: string;
}

export interface ScoringResult {
  id: string;
  studentId: string;
  examDate: string;
  grade: number;
  subjectType: string;
  selectionType: string;
  questionNo: number;
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  score: number;
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  email: string;
  createdAt: string;
}

export interface BoardPost {
  id: string;
  studentId: string;
  studentName: string;
  postTitle: string;
  postContent: string;
  postedAt: string;
}

export interface ExamStats {
  totalExams: number;
  totalStudents: number;
  totalSubmissions: number;
  averageScore: number;
}