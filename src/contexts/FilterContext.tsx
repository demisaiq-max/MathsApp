import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FilterContextType {
  gradeId: string | null;
  subjectId: string | null;
  setGrade: (gradeId: string | null) => void;
  setSubject: (subjectId: string | null) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedGradeId = localStorage.getItem('mathtrack_grade_filter');
    const savedSubjectId = localStorage.getItem('mathtrack_subject_filter');
    
    if (savedGradeId) setGradeId(savedGradeId);
    if (savedSubjectId) setSubjectId(savedSubjectId);
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    if (gradeId) {
      localStorage.setItem('mathtrack_grade_filter', gradeId);
    } else {
      localStorage.removeItem('mathtrack_grade_filter');
    }
  }, [gradeId]);

  useEffect(() => {
    if (subjectId) {
      localStorage.setItem('mathtrack_subject_filter', subjectId);
    } else {
      localStorage.removeItem('mathtrack_subject_filter');
    }
  }, [subjectId]);

  const setGrade = (newGradeId: string | null) => {
    setGradeId(newGradeId);
    // Reset subject when grade changes
    setSubjectId(null);
  };

  const setSubject = (newSubjectId: string | null) => {
    setSubjectId(newSubjectId);
  };

  const resetFilters = () => {
    setGradeId(null);
    setSubjectId(null);
  };

  return (
    <FilterContext.Provider
      value={{
        gradeId,
        subjectId,
        setGrade,
        setSubject,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};