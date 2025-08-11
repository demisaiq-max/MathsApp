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
  LogOut,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { studentApiService, ExamResult, UpcomingExam, BoardUpdate, PerformanceTrend } from '../../services/studentApi';
import { examApiService } from '../../services/examApi';
import StudentExamsList from './StudentExamsList';
import ExamTaking from './ExamTaking';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [progress, setProgress] = useState<StudentProgress>({
    totalExams: 0,
    averageScore: 0,
    bestScore: 0,
    recentExams: [],
    subjectProgress: []
  });
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [boardUpdates, setBoardUpdates] = useState<BoardUpdate[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
    fetchAvailableExams();
    
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchStudentData();
      fetchAvailableExams();
    }, 30000);

    return () => clearInterval(interval);
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

  const fetchAvailableExams = async () => {
    try {
      const exams = await examApiService.getAvailableExams();
      setAvailableExams(exams);
    } catch (error) {
      console.error('Error fetching available exams:', error);
    }
  };

  const handleStartExam = async (examId: string) => {
    try {
      const examWithQuestions = await examApiService.getExamWithQuestions(examId);
      setCurrentExam(examWithQuestions);
      setActiveTab('exam');
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam. Please try again.');
    }
  };

  const handleExamSubmit = async (examId: string, answers: any) => {
    try {
      await examApiService.submitExam(examId, answers);
      setCurrentExam(null);
      setActiveTab('dashboard');
      // Refresh data to show updated results
      await fetchStudentData();
      alert('Exam submitted successfully!');
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
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

  const isExamActive = (exam: any) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);
    return now >= startTime && now <= endTime;
  };

  const getExamStatus = (exam: any) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    return 'ended';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // If taking an exam, show exam interface
  if (currentExam) {
    return (
      <ExamTaking
        exam={currentExam}
        onSubmit={(answers) => handleExamSubmit(currentExam.id, answers)}
        onCancel={() => {
          setCurrentExam(null);
          setActiveTab('dashboard');
        }}
      />
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Exams ({availableExams.filter(exam => isExamActive(exam)).length} Active)
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Results
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <>
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
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Exams</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {availableExams.filter(exam => isExamActive(exam)).length}
                    </p>
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
          </>
        )}

        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Available Exams</h2>
              <div className="text-sm text-gray-500">
                {availableExams.filter(exam => isExamActive(exam)).length} active exams
              </div>
            </div>

            {availableExams.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Available</h3>
                <p className="text-gray-500">Check back later for new exams.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {availableExams.map((exam) => {
                  const status = getExamStatus(exam);
                  const hasSubmitted = false; // You can implement this check
                  
                  return (
                    <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status === 'active' ? 'bg-green-100 text-green-800' :
                              status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {status === 'active' ? 'Active Now' : 
                               status === 'upcoming' ? 'Upcoming' : 'Ended'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{exam.subject}</span>
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
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {status === 'active' && !hasSubmitted && (
                            <button
                              onClick={() => handleStartExam(exam.id)}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Play className="h-4 w-4" />
                              <span>Start Exam</span>
                            </button>
                          )}
                          {hasSubmitted && (
                            <div className="flex items-center space-x-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Submitted</span>
                            </div>
                          )}
                          {status === 'upcoming' && (
                            <div className="flex items-center space-x-2 text-blue-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">Starts Soon</span>
                            </div>
                          )}
                          {status === 'ended' && (
                            <div className="flex items-center space-x-2 text-gray-500">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Ended</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Exam Results</h2>
            
            {examResults.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                <p className="text-gray-500">Your exam results will appear here after submission.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                          Date
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                          Score
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                          Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {examResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900">{result.subject}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-500">{result.examDate}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreBadgeColor(result.score)}`}>
                              {result.score}/{result.maxScore}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm font-medium text-gray-900">{result.grade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPortal;