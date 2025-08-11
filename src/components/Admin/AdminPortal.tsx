import React, { useState, useEffect } from 'react';
import { FilterProvider } from '../../contexts/FilterContext';
import FilterBar from '../Common/FilterBar';
import CreateExamModal from '../Exams/CreateExamModal';
import { examManagementApi, ExamWithQuestions } from '../../services/examManagementApi';
import { useFilters } from '../../contexts/FilterContext';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  Calendar,
  TrendingUp,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Award,
  BookOpen,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AnswerSheetUpload {
  id: string;
  studentName: string;
  examTitle: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'pending' | 'reviewed' | 'graded';
  adminGrade?: number;
  adminFeedback?: string;
}

interface ExamStats {
  totalStudents: number;
  activeExams: number;
  avgScore: number;
  pendingReviews: number;
}

const AdminPortalContent: React.FC = () => {
  const { user, signOut } = useAuth();
  const { gradeId, subjectId } = useFilters();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [answerSheets, setAnswerSheets] = useState<AnswerSheetUpload[]>([]);
  const [exams, setExams] = useState<ExamWithQuestions[]>([]);
  const [stats, setStats] = useState<ExamStats>({
    totalStudents: 0,
    activeExams: 0,
    avgScore: 0,
    pendingReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUpload, setSelectedUpload] = useState<AnswerSheetUpload | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [gradingData, setGradingData] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'exams') {
      fetchExams();
    }
  }, [activeTab, gradeId, subjectId]);

  useEffect(() => {
    // Update exam statuses periodically
    const updateStatuses = async () => {
      try {
        await examManagementApi.updateExamStatuses();
      } catch (error) {
        console.error('Error updating exam statuses:', error);
      }
    };
    
    updateStatuses();
    const interval = setInterval(updateStatuses, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockAnswerSheets: AnswerSheetUpload[] = [
        {
          id: '1',
          studentName: 'John Smith',
          examTitle: 'Algebra II - Final Exam',
          fileName: 'algebra_final_john_smith.pdf',
          fileSize: 2.4,
          uploadDate: '2025-01-15T14:30:00Z',
          status: 'pending'
        },
        {
          id: '2',
          studentName: 'Sarah Johnson',
          examTitle: 'Geometry - Chapter 8 Quiz',
          fileName: 'geometry_quiz_sarah.pdf',
          fileSize: 1.8,
          uploadDate: '2025-01-15T13:45:00Z',
          status: 'graded',
          adminGrade: 92,
          adminFeedback: 'Excellent work on problem solving!'
        },
        {
          id: '3',
          studentName: 'Mike Davis',
          examTitle: 'Calculus I - Midterm',
          fileName: 'calculus_midterm_mike.pdf',
          fileSize: 3.2,
          uploadDate: '2025-01-14T16:20:00Z',
          status: 'reviewed'
        }
      ];

      const mockStats: ExamStats = {
        totalStudents: 2847,
        activeExams: 156,
        avgScore: 87.3,
        pendingReviews: mockAnswerSheets.filter(sheet => sheet.status === 'pending').length
      };

      setAnswerSheets(mockAnswerSheets);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const examsData = await examManagementApi.getExams(gradeId || undefined, subjectId || undefined);
      setExams(examsData);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedUpload || !gradingData.grade) return;

    try {
      // Mock grading for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setAnswerSheets(prev => prev.map(sheet => 
        sheet.id === selectedUpload.id 
          ? { 
              ...sheet, 
              status: 'graded', 
              adminGrade: parseInt(gradingData.grade),
              adminFeedback: gradingData.feedback 
            }
          : sheet
      ));

      setShowGradingModal(false);
      setSelectedUpload(null);
      setGradingData({ grade: '', feedback: '' });
    } catch (error) {
      console.error('Error grading submission:', error);
    }
  };

  const handleCreateExam = () => {
    setShowCreateExamModal(true);
  };

  const handleExamCreated = () => {
    fetchExams();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'reviewed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Reviewed</span>;
      case 'graded':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Graded</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
              <p className="text-sm text-emerald-600">+12% from last month</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Exams</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeExams}</p>
              <p className="text-sm text-gray-500">8 scheduled today</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgScore}%</p>
              <p className="text-sm text-emerald-600">+2.1% improvement</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</p>
              <p className="text-sm text-amber-600">Needs attention</p>
            </div>
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={handleCreateExam}
            className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Create Exam</span>
          </button>
          <button className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <Upload className="h-5 w-5 text-gray-600" />
            <span className="text-xs text-gray-600">Import Data</span>
          </button>
          <button className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <Download className="h-5 w-5 text-gray-600" />
            <span className="text-xs text-gray-600">Export Reports</span>
          </button>
          <button 
            onClick={() => setActiveTab('submissions')}
            className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-xs text-gray-600">Review Submissions</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
          <div className="space-y-3">
            {answerSheets.slice(0, 3).map((sheet) => (
              <div key={sheet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{sheet.studentName}</p>
                    <p className="text-sm text-gray-500">{sheet.examTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(sheet.status)}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(sheet.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Calculus Quiz</p>
                <p className="text-xs text-gray-500">2:00 PM - Grade 12</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Physics Lab Test</p>
                <p className="text-xs text-gray-500">3:30 PM - Grade 11</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Staff Meeting</p>
                <p className="text-xs text-gray-500">4:00 PM - Conference Room</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Answer Sheet Submissions</h2>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Student
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Exam
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  File
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Submitted
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Grade
                </th>
                <th className="text-right py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {answerSheets.map((sheet) => (
                <tr key={sheet.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {sheet.studentName.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{sheet.studentName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{sheet.examTitle}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm text-gray-900">{sheet.fileName}</p>
                      <p className="text-xs text-gray-500">{sheet.fileSize} MB</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">
                      {new Date(sheet.uploadDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(sheet.status)}
                  </td>
                  <td className="py-4 px-6">
                    {sheet.adminGrade ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{sheet.adminGrade}%</span>
                        {sheet.adminGrade >= 90 && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      {sheet.status !== 'graded' && (
                        <button 
                          onClick={() => {
                            setSelectedUpload(sheet);
                            setShowGradingModal(true);
                          }}
                          className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderExams = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Exam Management</h2>
        <button
          onClick={handleCreateExam}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Exam</span>
        </button>
      </div>

      <FilterBar />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {exams.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-500 mb-6">
              {gradeId || subjectId ? 'No exams match your current filters' : 'Create your first exam to get started'}
            </p>
            <button
              onClick={handleCreateExam}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Exam</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Grade & Subject
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{exam.title}</p>
                        {exam.instructions && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">{exam.instructions}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{exam.grade_name}</p>
                        <p className="text-sm text-gray-500">{exam.subject_name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-gray-900">
                          {new Date(exam.start_time).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(exam.start_time).toLocaleTimeString()} - {new Date(exam.end_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{exam.duration_minutes}m</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{exam.questions.length} questions</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        exam.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderGradingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Grade Submission</h3>
          <button
            onClick={() => setShowGradingModal(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Student: <span className="font-medium">{selectedUpload?.studentName}</span></p>
            <p className="text-sm text-gray-600">Exam: <span className="font-medium">{selectedUpload?.examTitle}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={gradingData.grade}
              onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter grade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback (Optional)
            </label>
            <textarea
              value={gradingData.feedback}
              onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter feedback for the student"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleGradeSubmission}
              disabled={!gradingData.grade}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              Submit Grade
            </button>
            <button
              onClick={() => setShowGradingModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">MathTrack Admin</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Administration Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Administrator</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="text-right sm:hidden">
                  <p className="text-xs font-medium text-gray-900">Admin</p>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Submissions ({stats.pendingReviews})
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'exams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Exams
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Students
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {(activeTab === 'dashboard' || activeTab === 'submissions') && <FilterBar className="mb-6" />}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'submissions' && renderSubmissions()}
        {activeTab === 'exams' && renderExams()}
        {activeTab === 'students' && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Student Management</h3>
            <p className="text-gray-500">Coming soon - Manage student accounts</p>
          </div>
        )}
      </main>

      {/* Grading Modal */}
      {showGradingModal && renderGradingModal()}

      {/* Create Exam Modal */}
      <CreateExamModal
        isOpen={showCreateExamModal}
        onClose={() => setShowCreateExamModal(false)}
        onSuccess={handleExamCreated}
      />
    </div>
  );
};

const AdminPortal: React.FC = () => {
  return (
    <FilterProvider>
      <AdminPortalContent />
    </FilterProvider>
  );
};

export default AdminPortal;