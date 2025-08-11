import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { useFilters } from '../../contexts/FilterContext';
import { filterApiService, Grade, Subject } from '../../services/filterApi';

interface FilterBarProps {
  showSubjectFilter?: boolean;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  showSubjectFilter = true, 
  className = '' 
}) => {
  const { gradeId, subjectId, setGrade, setSubject, resetFilters } = useFilters();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (gradeId) {
      fetchSubjectsForGrade(gradeId);
    } else {
      setSubjects([]);
    }
  }, [gradeId]);

  const fetchGrades = async () => {
    try {
      const gradesData = await filterApiService.getGrades();
      setGrades(gradesData);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsForGrade = async (gradeId: string) => {
    try {
      const subjectsData = await filterApiService.getSubjectsForGrade(gradeId);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const hasActiveFilters = gradeId || subjectId;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Grade Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">Grade:</label>
            <select
              value={gradeId || ''}
              onChange={(e) => setGrade(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[120px]"
            >
              <option value="">All Grades</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          {showSubjectFilter && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Subject:</label>
              <select
                value={subjectId || ''}
                onChange={(e) => setSubject(e.target.value || null)}
                disabled={!gradeId}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[120px] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {gradeId && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {grades.find(g => g.id === gradeId)?.name}
              </span>
            )}
            {subjectId && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {subjects.find(s => s.id === subjectId)?.name}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;