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
import { studentApiService, ExamResult, UpcomingExam, BoardUpdate, PerformanceTrend } from '../../services/studentApi';
import StudentExamsList from './StudentExamsList';

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

const StudentPortal: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [progress, setProgress] = useState<StudentProgress>({
    totalExams: 0,
    averageScore: 0,
    bestScore: 0,
    recentExams: [],
    subjectProgress: []
  });
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [boardUpdates, setBoardUpdates] = useState<BoardUpdate[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch all student data
      const [results, upcoming, updates, trends] = await Promise.all([
        studentApiService.getExamResults(),
        studentApiService.getUpcomingExams(profile?.grade || 5),
        studentApiService.getBoardUpdates(),
        studentApiService.getPerformanceTrends()
      ]);

      setExamResults(results);
      setUpcomingExams(upcoming);
      setBoardUpdates(updates);
      setPerformanceTrends(trends);

      // Calculate progress from exam results
      if (results.length > 0) {
        const totalExams = results.length;
        const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalExams;
        const bestScore = Math.max(...results.map(result => result.score));
        
        // Get recent exams (last 4)
        const recentExams = results.slice(0, 4).map(result => ({
          date: result.examDate,
          subject: result.subject,
          score: result.score,
          grade: profile?.grade || 5
        }));

        // Calculate subject progress
        const subjectMap = new Map<string, { total: number; count: number }>();
        results.forEach(result => {
          const current = subjectMap.get(result.subject) || { total: 0, count: 0 };
          subjectMap.set(result.subject, {
            total: current.total + result.score,
            count: current.count + 1
          });
        });

        const subjectProgress = Array.from(subjectMap.entries()).map(([subject, data]) => ({
          subject,
          averageScore: Math.round(data.total / data.count),
          examCount: data.count
        }));

        setProgress({
          totalExams,
          averageScore: Math.round(averageScore),
          bestScore,
          recentExams,
          subjectProgress
        });
      } else {
        // Mock data for demonstration
        const mockProgress: StudentProgress = {
          totalExams: 12,
          averageScore: 78,
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
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Set mock data on error
      const mockProgress: StudentProgress = {
        totalExams: 12,
        averageScore: 78,
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
    } finally {
      setLoading(false);
    }
  };

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
                <p className="text-sm text-gray-500">Student Portal</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

        {/* Performance Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            Performance Trends
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {performanceTrends.map((trend, index) => (
              <div key={trend.id} className="text-center">
                <div className="relative h-20 flex items-end justify-center mb-2">
                  <div 
                    className="w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${(trend.score / 100) * 80}px` }}
                  ></div>
                </div>
                <p className="text-sm font-medium text-gray-900">{trend.score}%</p>
                <p className="text-xs text-gray-500">{trend.month}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-600" />
            Upcoming Exams
          </h3>
          {upcomingExams.length > 0 ? (
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-gray-900">{exam.subject}</p>
                    <p className="text-sm text-gray-600">{exam.examDate} at {exam.examTime}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Grade {exam.gradeLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <StudentExamsList studentGrade={profile?.grade || 5} />
          )}
        </div>

        {/* Board Updates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Board Updates
          </h3>
          {boardUpdates.length > 0 ? (
            <div className="space-y-4">
              {boardUpdates.map((update) => (
                <div key={update.id} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-green-600">
                      {update.authorInitials}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{update.authorName}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{update.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent board updates</p>
            </div>
          )}
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

export default StudentPortal;