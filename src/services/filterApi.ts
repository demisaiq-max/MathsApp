import { supabase } from '../lib/supabase';

export interface Grade {
  id: string;
  name: string;
  display_order: number;
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
  // Get all grades with their subjects
  getGradesWithSubjects: async (): Promise<GradeWithSubjects[]> => {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        id,
        name,
        display_order,
        grades_subjects!inner(
          subjects(
            id,
            name,
            description
          )
        )
      `)
      .order('display_order');

    if (error) throw error;

    return data.map(grade => ({
      id: grade.id,
      name: grade.name,
      display_order: grade.display_order,
      subjects: grade.grades_subjects.map((gs: any) => gs.subjects).filter(Boolean)
    }));
  },

  // Get subjects for a specific grade
  getSubjectsForGrade: async (gradeId: string): Promise<Subject[]> => {
    const { data, error } = await supabase
      .from('grades_subjects')
      .select(`
        subjects(
          id,
          name,
          description
        )
      `)
      .eq('grade_id', gradeId);

    if (error) throw error;

    return data.map(item => item.subjects).filter(Boolean);
  },

  // Get all grades
  getGrades: async (): Promise<Grade[]> => {
    const { data, error } = await supabase
      .from('grades')
      .select('id, name, display_order')
      .order('display_order');

    if (error) throw error;
    return data;
  },

  // Get all subjects
  getSubjects: async (): Promise<Subject[]> => {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, description')
      .order('name');

    if (error) throw error;
    return data;
  }
};