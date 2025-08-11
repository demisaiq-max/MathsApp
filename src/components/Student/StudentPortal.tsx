import React, { useState, useEffect } from 'react';
import { 
  BookOpen,
  TrendingUp, 
  Trophy,
  Calendar, 
  Plus,
  Home,
  BarChart3,
  MessageSquare,
  User,
  Bell,
  LogOut,
  Heart,
  MessageCircle,
  Send,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { boardApiService, Announcement, QAPost, PostComment } from '../../services/boardApi';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [qaPosts, setQAPosts] = useState<QAPost[]>([]);
  const [comments, setComments] = useState<{ [key: string]: PostComment[] }>({});
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: ''
  });
  const [boardTab, setBoardTab] = useState('announcements');
  const [progress, setProgress] = useState<StudentProgress>({
    totalExams: 0,
    averageScore: 0,
    bestScore: 0,
    recentExams: [],
    subjectProgress: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProgress();
    if (activeTab === 'board' && boardTab === 'announcements') {
      fetchAnnouncements();
    }
    if (activeTab === 'board' && boardTab === 'qa') {
      fetchQAPosts();
    }
  }, [activeTab, boardTab]);

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

  const fetchAnnouncements = async () => {
    try {
      const data = await boardApiService.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchQAPosts = async () => {
    try {
      const data = await boardApiService.getQAPosts();
      setQAPosts(data);
    } catch (error) {
      console.error('Error fetching Q&A posts:', error);
    }
  };

  const fetchComments = async (postId: string, postType: 'announcement' | 'qa_post') => {
    try {
      const data = await boardApiService.getPostComments(postId, postType);
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) return;

    try {
      await boardApiService.createQAPost({
        title: newQuestion.title,
        content: newQuestion.content,
        postType: 'question'
      });
      setShowNewQuestion(false);
      setNewQuestion({ title: '', content: '' });
      fetchQAPosts();
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  const handleToggleLike = async (postId: string, postType: 'announcement' | 'qa_post') => {
    try {
      await boardApiService.toggleLike(postId, postType);
      if (postType === 'announcement') {
        fetchAnnouncements();
      } else {
        fetchQAPosts();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (postId: string, postType: 'announcement' | 'qa_post') => {
    if (!newComment.trim()) return;

    try {
      await boardApiService.addComment(postId, postType, newComment);
      setNewComment('');
      fetchComments(postId, postType);
      if (postType === 'announcement') {
        fetchAnnouncements();
      } else {
        fetchQAPosts();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!</h1>
        <p className="opacity-90">Ready to check your latest scores?</p>
      </div>

      {/* Stats Cards */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Latest</span>
            </div>
            <div className="text-2xl font-bold">{progress.recentExams[0]?.score || 0}%</div>
            <div className="text-sm text-gray-600">Last Exam Score</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-sm text-gray-600">Average</span>
            </div>
            <div className="text-2xl font-bold">{progress.averageScore}%</div>
            <div className="text-sm text-gray-600">Overall Average</div>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Performance Trend</h3>
          <div className="flex items-end justify-between h-24 space-x-2">
            {progress.recentExams.slice(0, 5).map((exam, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div 
                  className="bg-blue-600 rounded-t"
                  style={{ height: `${exam.score}%`, width: '24px' }}
                />
                <span className="text-xs text-gray-600">
                  {new Date(exam.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Exams</h3>
            <button 
              onClick={() => setActiveTab('scores')}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {progress.recentExams.slice(0, 2).map((exam, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded">
                    <span className="text-xs font-mono">📚</span>
                  </div>
                  <div>
                    <div className="font-medium">{exam.subject}</div>
                    <div className="text-sm text-gray-600">{exam.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(exam.score)}`}>{exam.score}%</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeColor(exam.score)}`}>
                    Grade: {exam.score >= 90 ? 'A' : exam.score >= 80 ? 'B' : exam.score >= 70 ? 'C' : 'D'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Upcoming Exams</h3>
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="font-medium">Next Exam</div>
                <div className="text-sm text-gray-600">Check schedule for details</div>
              </div>
            </div>
            <button className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              Remind Me
            </button>
          </div>
        </div>

        {/* Board Updates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Board Updates</h3>
            <button 
              onClick={() => setActiveTab('board')}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
            >
              View Board
            </button>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
              MJ
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Mr. Johnson</div>
              <div className="text-sm text-gray-600">
                New study materials for Math have been uploaded. Check them out before the exam!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around p-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('scores')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'scores' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Scores</span>
          </button>
          <button 
            onClick={() => setActiveTab('board')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'board' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">Board</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderScores = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Scores</h2>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Exam History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Exam History</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {progress.recentExams.map((exam, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{exam.subject}</p>
                    <p className="text-sm text-gray-500">{exam.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getScoreColor(exam.score)}`}>{exam.score}%</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeColor(exam.score)}`}>
                    Grade: {exam.score >= 90 ? 'A' : exam.score >= 80 ? 'B' : exam.score >= 70 ? 'C' : 'D'}
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
          <h3 className="text-lg font-semibold text-gray-900">Subject Progress</h3>
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
  );

  const renderBoard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Student Board</h2>
        <button
          onClick={() => setShowNewQuestion(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Ask Question</span>
        </button>
      </div>

      {/* Board Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setBoardTab('announcements')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              boardTab === 'announcements'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Announcements</span>
            </div>
          </button>
          <button
            onClick={() => setBoardTab('qa')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              boardTab === 'qa'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Q&A Forum</span>
            </div>
          </button>
        </div>
      </div>

      {/* Board Content */}
      {boardTab === 'announcements' && renderAnnouncements()}
      {boardTab === 'qa' && renderQA()}

      {/* New Question Modal */}
      {showNewQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ask a Question</h3>
              <button
                onClick={() => setShowNewQuestion(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Title</label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your question title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Details</label>
                <textarea
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe your question in detail"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCreateQuestion}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post Question
                </button>
                <button
                  onClick={() => setShowNewQuestion(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{profile?.full_name}</h3>
            <p className="text-gray-600">Grade {profile?.grade} Student</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{progress.totalExams}</div>
            <div className="text-sm text-gray-600">Total Exams</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{progress.averageScore}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{announcement.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By {announcement.authorName}</span>
                  <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleToggleLike(announcement.id, 'announcement')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                    announcement.isLiked 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${announcement.isLiked ? 'fill-current' : ''}`} />
                  <span>{announcement.likesCount}</span>
                </button>
                <button
                  onClick={() => {
                    if (showComments === announcement.id) {
                      setShowComments(null);
                    } else {
                      setShowComments(announcement.id);
                      fetchComments(announcement.id, 'announcement');
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{announcement.commentsCount}</span>
                </button>
              </div>
            </div>

            {showComments === announcement.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-3 mb-4">
                  {comments[announcement.id]?.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-600">
                          {comment.authorInitials}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">{comment.authorName}</p>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(announcement.id, 'announcement')}
                  />
                  <button
                    onClick={() => handleAddComment(announcement.id, 'announcement')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderQA = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Q&A Forum</h2>
        <button
          onClick={() => setShowNewQuestion(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Ask Question</span>
        </button>
      </div>

      <div className="space-y-4">
        {qaPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                  {post.isResolved && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Resolved
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-3">{post.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By {post.authorName}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  {post.answers && post.answers.length > 0 && (
                    <span>{post.answers.length} answer{post.answers.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleToggleLike(post.id, 'qa_post')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                    post.isLiked 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span>{post.likesCount}</span>
                </button>
                <button
                  onClick={() => {
                    if (showComments === post.id) {
                      setShowComments(null);
                    } else {
                      setShowComments(post.id);
                      fetchComments(post.id, 'qa_post');
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.commentsCount}</span>
                </button>
              </div>
            </div>

            {/* Answers */}
            {post.answers && post.answers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Answers</h4>
                <div className="space-y-3">
                  {post.answers.map((answer) => (
                    <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {answer.authorInitials}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{answer.authorName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(answer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{answer.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showComments === post.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-3 mb-4">
                  {comments[post.id]?.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-600">
                          {comment.authorInitials}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">{comment.authorName}</p>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id, 'qa_post')}
                  />
                  <button
                    onClick={() => handleAddComment(post.id, 'qa_post')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Question Modal */}
      {showNewQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ask a Question</h3>
              <button
                onClick={() => setShowNewQuestion(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Title</label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your question title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Details</label>
                <textarea
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe your question in detail"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCreateQuestion}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post Question
                </button>
                <button
                  onClick={() => setShowNewQuestion(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="font-semibold">Score Manager</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
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

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'announcements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1">
                <Bell className="h-4 w-4" />
                <span>Announcements</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'qa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>Q&A Forum</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'scores' && renderScores()}
        {activeTab === 'board' && renderBoard()}
        {activeTab === 'profile' && renderProfile()}
      </main>
    </div>
  );
};

export default StudentPortal;