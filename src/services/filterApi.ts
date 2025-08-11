import { supabase } from '../lib/supabase';

export interface Grade {
  id: string;
  name: string;
  display_order?: number;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
}

export interface GradeWithSubjects extends Grade {
  subjects: Subject[];
}

export const filterApiService = {
  // Get all grades
  getGrades: async (): Promise<Grade[]> => {
    // Generate grades 5-12 from existing data
    const grades: Grade[] = [];
    for (let i = 5; i <= 12; i++) {
      grades.push({
        id: i.toString(),
        name: `Grade ${i}`,
        display_order: i
      });
    }
    return grades;
  },

  // Get subjects for a specific grade
  getSubjectsForGrade: async (gradeId: string): Promise<Subject[]> => {
    // Return common subjects based on grade level
    const gradeNum = parseInt(gradeId);
    const subjects: Subject[] = [];
    
    // Common subjects for all grades
    subjects.push(
      { id: 'math', name: 'Mathematics' },
      { id: 'english', name: 'English' },
      { id: 'science', name: 'Science' }
    );
    
    // Additional subjects for higher grades
    if (gradeNum >= 9) {
      subjects.push(
        { id: 'physics', name: 'Physics' },
        { id: 'chemistry', name: 'Chemistry' },
        { id: 'biology', name: 'Biology' }
      );
    }
    
    if (gradeNum >= 11) {
      subjects.push(
        { id: 'calculus', name: 'Calculus' },
        { id: 'statistics', name: 'Statistics' }
      );
    }
    
    return subjects;
  },

  // Get all grades with their subjects
  getGradesWithSubjects: async (): Promise<GradeWithSubjects[]> => {
    const grades = await filterApiService.getGrades();
    const gradesWithSubjects: GradeWithSubjects[] = [];
    
    for (const grade of grades) {
      const subjects = await filterApiService.getSubjectsForGrade(grade.id);
      gradesWithSubjects.push({
        ...grade,
        subjects
      });
    }
    
    return gradesWithSubjects;
  },

  // Get all subjects
  getSubjects: async (): Promise<Subject[]> => {
    // Return all available subjects
    return [
      { id: 'math', name: 'Mathematics' },
      { id: 'english', name: 'English' },
      { id: 'science', name: 'Science' },
      { id: 'physics', name: 'Physics' },
      { id: 'chemistry', name: 'Chemistry' },
      { id: 'biology', name: 'Biology' },
      { id: 'calculus', name: 'Calculus' },
      { id: 'statistics', name: 'Statistics' }
    ];
  }
};