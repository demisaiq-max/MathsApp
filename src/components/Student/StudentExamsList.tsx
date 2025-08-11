import React, { useState, useEffect } from 'react';
import { Clock, Calendar, BookOpen, Users, AlertCircle } from 'lucide-react';
import { examManagementApi, ExamWithQuestions } from '../../services/examManagementApi';
import { supabase } from '../../lib/supabase';

interface StudentExamsListProps {
  studentGrade: number;
}

const StudentExamsList: React.FC<StudentExamsListProps> = ({ studentGrade }) => {
  const [exams, setExams] = useState<ExamWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentExams();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('student-exams')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'exams',
          filter: `grade_level=eq.${studentGrade}`
        }, 
        () => fetchStudentExams()
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, [studentGrade]);

  const fetchStudentExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examManagementApi.getStudentExams(studentGrade);
      setExams(data);
    } catch (err) {
      console.error('Error fetching student exams:', err);
      setError('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeUntilExam = (startTime: string) => {
    const now = new Date();
    const examStart = new Date(startTime);
    const diffMs = examStart.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Started';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchStudentExams}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Exams</h3>
        <p className="text-gray-500">You don't have any scheduled exams at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upcoming Exams - Grade {studentGrade}
      </h3>
      
      {exams.map((exam) => (
        <div key={exam.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{exam.title}</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                  {exam.status}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{exam.subject}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{exam.questions.length} questions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{exam.duration_minutes} minutes</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(exam.start_time).toLocaleDateString()}</span>
                  <span>{new Date(exam.start_time).toLocaleTimeString()}</span>
                </div>
                
                {exam.status === 'scheduled' && (
                  <div className="text-blue-600 font-medium">
                    Starts in {getTimeUntilExam(exam.start_time)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="ml-4">
              {exam.status === 'active' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Take Exam
                </button>
              )}
              {exam.status === 'scheduled' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentExamsList;