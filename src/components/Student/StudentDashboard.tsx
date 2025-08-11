import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  Calendar, 
  BarChart3, 
  Target,
  Clock,
  Star,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface StudentProgress {
  totalExams: number;
  averageScore: number;
  bestScore: number;
  recentExams: Array<{
    date: string;
    subject: string;
    score: number;
    grade: number;
  }>;
  subjectProgress: Array<{
    subject: string;
    averageScore: number;
    examCount: number;
  }>;
}

const StudentDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [progress, setProgress] = useState<StudentProgress>({
    totalExams: 0,
    averageScore: 0,
    bestScore: 0,
    recentExams: [],
    subjectProgress: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProgress = async () => {
      try {
        setLoading(true);
        // Mock data for now - you can replace with actual API calls
        const mockProgress: StudentProgress = {
          totalExams: 12,
          averageScore: 78.5,
          bestScore: 95,
          recentExams: [
            { date: '2025-01-15', subject: 'Math', score: 85, grade: 9 },
            { date: '2025-01-10', subject: 'Physics', score: 72, grade: 9 },
            { date: '2025-01-05', subject: 'Math', score: 90, grade: 9 },
            { date: '2024-12-20', subject: 'Chemistry', score: 68, grade: 9 }
          ],
          subjectProgress: [
            { subject: 'Math', averageScore: 82, examCount: 5 },
            { subject: 'Physics', averageScore: 75, examCount: 4 },
            { subject: 'Chemistry', averageScore: 70, examCount: 3 }
          ]
        };
        setProgress(mockProgress);
      } catch (error) {
        console.error('Error fetching student progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProgress();
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MathTrack</h1>
                <p className="text-sm text-gray-500">Student Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500">Grade {profile?.grade}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">Here's your academic progress overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{progress.totalExams}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(progress.averageScore)}`}>
                  {progress.averageScore}%
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Best Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(progress.bestScore)}`}>
                  {progress.bestScore}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Current Grade</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.grade}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Exams */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Recent Exams
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {progress.recentExams.map((exam, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{exam.subject}</p>
                      <p className="text-sm text-gray-500">{exam.date}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreBadgeColor(exam.score)}`}>
                        {exam.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                Subject Progress
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {progress.subjectProgress.map((subject, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{subject.subject}</span>
                      <span className={`text-sm font-medium ${getScoreColor(subject.averageScore)}`}>
                        {subject.averageScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${subject.averageScore}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{subject.examCount} exams taken</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900">Improving</p>
              <p className="text-xs text-blue-700">Your Math scores are trending upward</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <Award className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-900">Strong Performance</p>
              <p className="text-xs text-emerald-700">Excellent work in recent exams</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-900">Focus Area</p>
              <p className="text-xs text-orange-700">Physics needs more attention</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;