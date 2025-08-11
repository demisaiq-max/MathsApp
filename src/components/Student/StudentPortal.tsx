import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Trophy, 
  Calendar, 
  Plus,
  Home,
  BarChart3,
  MessageSquare,
  User,
  Bell,
  ArrowLeft,
  LogOut,
  Heart,
  MessageCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Megaphone,
  X,
  Clock,
  Upload,
  Send,
  AlertCircle,
  FileText,
  BookOpen
} from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';
import { studentApiService, PerformanceTrend } from '../../services/studentApi';
import { boardApiService, Announcement, QAPost, PostComment } from '../../services/boardApi';

interface ExamResult {
  id: string;
  subject: string;
  score: number;
  date: string;
  grade: string;
  maxScore: number;
}

interface UpcomingExam {
  id: string;
  subject: string;
  date: string;
  time: string;
}

interface BoardUpdate {
  id: string;
  author: string;
  authorInitials: string;
  message: string;
  timestamp: string;
}

const StudentPortal: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [boardTab, setBoardTab] = useState<'announcements' | 'qa'>('announcements');
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [qaPosts, setQAPosts] = useState<QAPost[]>([]);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [examAnswers, setExamAnswers] = useState<{[key: string]: string}>({});
  const [examTimeLeft, setExamTimeLeft] = useState(3600); // 60 minutes in seconds
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [completedExams, setCompletedExams] = useState<string[]>([]);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);

  // Mock exam data
  const mockExam = {
    id: 'exam-1',
    title: 'Algebra II - Final Exam',
    subject: 'Mathematics',
    duration: 60, // minutes
    totalQuestions: 15,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'What is the solution to the equation 2x + 5 = 13?',
        options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
        correctAnswer: 'x = 4'
      },
      {
        id: 'q2',
        type: 'mcq',
        question: 'Which of the following is equivalent to (x + 3)²?',
        options: ['x² + 6x + 9', 'x² + 3x + 9', 'x² + 6x + 6', 'x² + 9'],
        correctAnswer: 'x² + 6x + 9'
      },
      {
        id: 'q3',
        type: 'true_false',
        question: 'The graph of y = x² is a parabola that opens upward.',
        correctAnswer: 'true'
      },
      {
        id: 'q4',
        type: 'true_false',
        question: 'The equation y = mx + b represents a quadratic function.',
        correctAnswer: 'false'
      },
      {
        id: 'q5',
        type: 'short_answer',
        question: 'Find the vertex of the parabola y = x² - 4x + 3.',
        correctAnswer: '(2, -1)'
      },
      {
        id: 'q6',
        type: 'mcq',
        question: 'What is the discriminant of the quadratic equation x² - 6x + 9 = 0?',
        options: ['0', '36', '-36', '18'],
        correctAnswer: '0'
      },
      {
        id: 'q7',
        type: 'mcq',
        question: 'Which function represents exponential growth?',
        options: ['y = 2x', 'y = x²', 'y = 2^x', 'y = x/2'],
        correctAnswer: 'y = 2^x'
      },
      {
        id: 'q8',
        type: 'true_false',
        question: 'The domain of f(x) = √x is all real numbers.',
        correctAnswer: 'false'
      },
      {
        id: 'q9',
        type: 'short_answer',
        question: 'Solve for x: log₂(x) = 3',
        correctAnswer: '8'
      },
      {
        id: 'q10',
        type: 'mcq',
        question: 'What is the slope of the line passing through points (2, 3) and (4, 7)?',
        options: ['1', '2', '3', '4'],
        correctAnswer: '2'
      },
      {
        id: 'q11',
        type: 'true_false',
        question: 'Two parallel lines have the same slope.',
        correctAnswer: 'true'
      },
      {
        id: 'q12',
        type: 'short_answer',
        question: 'What is the y-intercept of the line y = 3x - 7?',
        correctAnswer: '-7'
      },
      {
        id: 'q13',
        type: 'mcq',
        question: 'Which of the following is a factor of x² - 5x + 6?',
        options: ['(x - 1)', '(x - 2)', '(x - 4)', '(x - 5)'],
        correctAnswer: '(x - 2)'
      },
      {
        id: 'q14',
        type: 'true_false',
        question: 'The function f(x) = |x| is continuous everywhere.',
        correctAnswer: 'true'
      },
      {
        id: 'q15',
        type: 'short_answer',
        question: 'Simplify: (3x²y³)²',
        correctAnswer: '9x⁴y⁶'
      }
    ]
  };

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        
        // Mock exam results
        const mockResults: ExamResult[] = [
          {
            id: '1',
            subject: 'Algebra II',
            score: 92,
            date: 'January 15, 2024',
            grade: 'A-',
            maxScore: 100
          },
          {
            id: '2',
            subject: 'Geometry',
            score: 88,
            date: 'January 10, 2024',
            grade: 'B+',
            maxScore: 100
          },
          {
            id: '3',
            subject: 'Statistics',
            score: 95,
            date: 'January 5, 2024',
            grade: 'A',
            maxScore: 100
          },
          {
            id: '4',
            subject: 'Trigonometry',
            score: 85,
            date: 'December 20, 2023',
            grade: 'B',
            maxScore: 100
          },
          {
            id: '5',
            subject: 'Pre-Calculus',
            score: 90,
            date: 'December 15, 2023',
            grade: 'A-',
            maxScore: 100
          }
        ];

        const mockUpcoming: UpcomingExam[] = [
          {
            id: '1',
            subject: 'Calculus I',
            date: 'January 22, 2024',
            time: '2:00 PM'
          },
          {
            id: '2',
            subject: 'Linear Algebra',
            date: 'January 25, 2024',
            time: '10:00 AM'
          }
        ];

        const mockBoardUpdates: BoardUpdate[] = [
          {
            id: '1',
            author: 'Mr. Johnson',
            authorInitials: 'MJ',
            message: 'New study materials for Calculus have been uploaded. Check them out before the exam!',
            timestamp: '2 hours ago'
          },
          {
            id: '2',
            author: 'Ms. Smith',
            authorInitials: 'MS',
            message: 'Reminder: Office hours are available every Tuesday and Thursday from 3-5 PM.',
            timestamp: '1 day ago'
          }
        ];

        setExamResults(mockResults);
        setUpcomingExams(mockUpcoming);
        
        // Load board data
        const [announcementsData, qaPostsData, trendsData] = await Promise.all([
          boardApiService.getAnnouncements(),
          boardApiService.getQAPosts(),
          studentApiService.getPerformanceTrends()
        ]);
        
        setAnnouncements(announcementsData);
        setQAPosts(qaPostsData);
        setPerformanceTrends(trendsData);
        
        // Load completed exams from localStorage
        const completed = localStorage.getItem('completedExams');
        if (completed) {
          setCompletedExams(JSON.parse(completed));
        }
      } catch (error) {
        console.error('Error loading student data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, []);

  const getLatestScore = () => {
    return examResults.length > 0 ? examResults[0].score : 0;
  };

  const getAverageScore = () => {
    if (examResults.length === 0) return 0;
    const total = examResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / examResults.length);
  };

  const getPerformanceTrend = () => {
    return examResults.slice(0, 5).reverse().map(result => result.score);
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBadgeVariant = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleLike = async (postId: string, postType: 'announcement' | 'qa_post') => {
    try {
      const isLiked = await boardApiService.toggleLike(postId, postType);
      
      if (postType === 'announcement') {
        setAnnouncements(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isLiked, likesCount: post.likesCount + (isLiked ? 1 : -1) }
            : post
        ));
      } else {
        setQAPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isLiked, likesCount: post.likesCount + (isLiked ? 1 : -1) }
            : post
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShowComments = async (postId: string, postType: 'announcement' | 'qa_post') => {
    try {
      const commentsData = await boardApiService.getPostComments(postId, postType);
      setComments(commentsData);
      setShowComments(postId);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async (postId: string, postType: 'announcement' | 'qa_post') => {
    if (!newComment.trim()) return;
    
    try {
      const comment = await boardApiService.addComment(postId, postType, newComment);
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
      // Update comments count
      if (postType === 'announcement') {
        setAnnouncements(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        ));
      } else {
        setQAPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) return;
    
    try {
      const question = await boardApiService.createQAPost({
        title: newQuestion.title,
        content: newQuestion.content,
        postType: 'question'
      });
      
      setQAPosts(prev => [question, ...prev]);
      setNewQuestion({ title: '', content: '' });
      setShowNewQuestionForm(false);
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const startExam = () => {
    setCurrentExam(mockExam);
    setCurrentView('exam-taking');
    setExamTimeLeft(mockExam.duration * 60); // Convert minutes to seconds
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setExamAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitExam = () => {
    // Check if currentExam exists to prevent null reference error
    if (!currentExam) {
      console.error('No active exam to submit');
      return;
    }
    
    // Calculate score
    let correctAnswers = 0;
    currentExam.questions.forEach((question: any) => {
      if (examAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / currentExam.questions.length) * 100);
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B+' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'F';
    
    // Create exam result
    const newResult = {
      id: Date.now().toString(),
      subject: currentExam.title,
      score: score,
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      grade: grade,
      maxScore: 100,
      correctAnswers: correctAnswers,
      totalQuestions: currentExam.questions.length,
      examId: currentExam.id,
      answers: examAnswers
    };
    
    // Add to exam results
    setExamResults(prev => [newResult, ...prev]);
    
    // Mark exam as completed
    const updatedCompleted = [...completedExams, currentExam.id];
    setCompletedExams(updatedCompleted);
    localStorage.setItem('completedExams', JSON.stringify(updatedCompleted));
    
    // Store exam result for answer sheet
    setExamResult(newResult);
    
    setExamSubmitted(true);
    setShowAnswerSheet(true);
  };

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentView === 'exam-taking' && examTimeLeft > 0 && !examSubmitted) {
      interval = setInterval(() => {
        setExamTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentView, examTimeLeft, examSubmitted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderHomeView = () => (
    <div className="pb-24">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!</h1>
        <p className="opacity-90">Ready to check your latest scores?</p>
      </div>

      {/* Stats Cards */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Latest</span>
            </div>
            <div className={`text-2xl font-bold ${getGradeColor(getLatestScore())}`}>
              {getLatestScore()}%
            </div>
            <div className="text-sm text-gray-600">Last Exam Score</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-sm text-gray-600">Average</span>
            </div>
            <div className={`text-2xl font-bold ${getGradeColor(getAverageScore())}`}>
              {getAverageScore()}%
            </div>
            <div className="text-sm text-gray-600">Overall Average</div>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Performance Trend</h3>
          {performanceTrends.length > 0 ? (
            <div className="flex items-end justify-between h-32 space-x-2">
              {performanceTrends.map((trend, index) => {
                const height = Math.max((trend.score / 100) * 120, 15); // Scale to container height
                const barColor = trend.score >= 90 ? 'bg-emerald-500' : 
                                trend.score >= 80 ? 'bg-blue-500' : 
                                trend.score >= 70 ? 'bg-orange-500' : 'bg-red-500';
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    <div className="relative flex flex-col items-center">
                      <span className="text-xs font-medium text-gray-700 mb-1">{trend.score}%</span>
                      <div 
                        className={`${barColor} rounded-t transition-all duration-500 ease-in-out`}
                        style={{ 
                          height: `${height}px`, 
                          width: '24px',
                          minHeight: '15px'
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
                      {trend.month}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-end justify-between h-32 space-x-2">
              {getPerformanceTrend().map((score, index) => {
                const height = Math.max((score / 100) * 120, 15);
                const barColor = score >= 90 ? 'bg-emerald-500' : 
                                score >= 80 ? 'bg-blue-500' : 
                                score >= 70 ? 'bg-orange-500' : 'bg-red-500';
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    <div className="relative flex flex-col items-center">
                      <span className="text-xs font-medium text-gray-700 mb-1">{score}%</span>
                      <div 
                        className={`${barColor} rounded-t transition-all duration-500 ease-in-out`}
                        style={{ 
                          height: `${height}px`, 
                          width: '24px',
                          minHeight: '15px'
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
                      {['Dec', 'Jan'][index] || 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Performance Insights */}
          {performanceTrends.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Performance Analysis</span>
              </div>
              <p className="text-xs text-blue-800">
                {performanceTrends.length >= 2 && (
                  `Great improvement! Your scores have increased by ${
                    performanceTrends[performanceTrends.length - 1].score - performanceTrends[0].score
                  } points from ${performanceTrends[0].month} to ${performanceTrends[performanceTrends.length - 1].month}. 
                  Keep up the excellent work!`
                )}
              </p>
            </div>
          )}
        </div>

        {/* Recent Exams */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Exams</h3>
            <button 
              onClick={() => setCurrentView('scores')}
              className="text-blue-600 text-sm font-medium hover:text-blue-800"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {examResults.slice(0, 2).map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded">
                    <span className="text-xs font-mono">√²</span>
                  </div>
                  <div>
                    <div className="font-medium">{exam.subject}</div>
                    <div className="text-sm text-gray-600">{exam.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getGradeColor(exam.score)}`}>
                    {exam.score}%
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeVariant(exam.score)}`}>
                    Grade: {exam.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Upcoming Exams</h3>
          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 p-2 rounded">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-medium">{exam.subject}</div>
                    <div className="text-sm text-gray-600">{exam.date} • {exam.time}</div>
                  </div>
                </div>
                <button className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
                  Remind Me
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Board Updates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Board Updates</h3>
            <button 
              onClick={() => setCurrentView('board')}
              className="text-blue-600 text-sm font-medium hover:text-blue-800"
            >
              View Board
            </button>
          </div>
          {announcements.slice(0, 1).map((announcement) => (
            <div key={announcement.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                {announcement.authorInitials}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{announcement.authorName}</div>
                <div className="text-sm text-gray-600">
                  {announcement.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Available Exams */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Available Exams</h3>
            <button 
              onClick={() => setCurrentView('exams')}
              className="text-blue-600 text-sm font-medium hover:text-blue-800"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {/* Active Exam */}
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Algebra II - Final Exam</div>
                  <div className="text-sm text-gray-600">Available now • 60 minutes</div>
                </div>
              </div>
              {completedExams.includes('exam-1') ? (
                <span className="px-3 py-1 text-sm bg-gray-300 text-gray-600 rounded">
                  Completed
                </span>
              ) : (
                <button 
                  onClick={() => setCurrentView('exam-taking')}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Start Exam
                </button>
              )}
            </div>
            
            {/* Scheduled Exam */}
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium">Geometry - Chapter 5 Test</div>
                  <div className="text-sm text-gray-600">Opens Jan 25, 2:00 PM • 45 minutes</div>
                </div>
              </div>
              <button 
                disabled
                className="px-3 py-1 text-sm bg-gray-300 text-gray-500 rounded cursor-not-allowed"
              >
                Not Available
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScoresView = () => (
    <div className="pb-24">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold">All Exam Scores</h2>
        </div>

        <div className="space-y-4">
          {examResults.map((exam) => (
            <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{exam.subject}</div>
                    <div className="text-sm text-gray-600">{exam.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getGradeColor(exam.score)}`}>
                    {exam.score}%
                  </div>
                  <div className="text-sm text-gray-600">{exam.score}/{exam.maxScore}</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeVariant(exam.score)} mt-1`}>
                    Grade: {exam.grade}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBoardView = () => (
    <div className="pb-24">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold">Board</h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBoardTab('announcements')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              boardTab === 'announcements'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => setBoardTab('qa')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              boardTab === 'qa'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Q&A</span>
          </button>
        </div>

        {/* Announcements Tab */}
        {boardTab === 'announcements' && (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-semibold">
                    {announcement.authorInitials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">{announcement.authorName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                    </div>
                    <h3 className="font-medium text-lg mb-2">{announcement.title}</h3>
                    <p className="text-gray-700 mb-3">{announcement.content}</p>
                    <div className="text-xs text-gray-500 mb-3">
                      {new Date(announcement.createdAt).toLocaleString()}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(announcement.id, 'announcement')}
                        className={`flex items-center space-x-1 text-sm ${
                          announcement.isLiked ? 'text-red-600' : 'text-gray-600'
                        } hover:text-red-600`}
                      >
                        <Heart className={`h-4 w-4 ${announcement.isLiked ? 'fill-current' : ''}`} />
                        <span>{announcement.likesCount}</span>
                      </button>
                      <button
                        onClick={() => handleShowComments(announcement.id, 'announcement')}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{announcement.commentsCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Q&A Tab */}
        {boardTab === 'qa' && (
          <div className="space-y-4">
            {qaPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-semibold">
                    {post.authorInitials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">{post.authorName}</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Question
                      </span>
                      {post.isResolved && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Resolved
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-lg mb-2">{post.title}</h3>
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    <div className="text-xs text-gray-500 mb-3">
                      {new Date(post.createdAt).toLocaleString()}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(post.id, 'qa_post')}
                        className={`flex items-center space-x-1 text-sm ${
                          post.isLiked ? 'text-red-600' : 'text-gray-600'
                        } hover:text-red-600`}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likesCount}</span>
                      </button>
                      <button
                        onClick={() => handleShowComments(post.id, 'qa_post')}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.commentsCount}</span>
                      </button>
                    </div>
                    
                    {/* Answers */}
                    {post.answers && post.answers.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <h4 className="font-medium text-sm text-gray-600 mb-2">Answers:</h4>
                        {post.answers.map((answer) => (
                          <div key={answer.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{answer.authorName}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(answer.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{answer.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Question Form */}
      {showNewQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Ask a Question</h3>
              <button
                onClick={() => setShowNewQuestionForm(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title
                </label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's your question about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Details
                </label>
                <textarea
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide more details about your question..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateQuestion}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post Question
                </button>
                <button
                  onClick={() => setShowNewQuestionForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Comments</h3>
              <button
                onClick={() => setShowComments(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 max-h-96">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                        {comment.authorInitials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{comment.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a comment..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const postType = announcements.find(a => a.id === showComments) ? 'announcement' : 'qa_post';
                      handleAddComment(showComments, postType);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const postType = announcements.find(a => a.id === showComments) ? 'announcement' : 'qa_post';
                    handleAddComment(showComments, postType);
                  }}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfileView = () => (
    <div className="pb-24">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold">Profile</h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {profile?.full_name?.charAt(0) || 'S'}
            </div>
            <h3 className="text-xl font-semibold">{profile?.full_name}</h3>
            <p className="text-gray-600">Grade {profile?.grade}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Student ID</span>
              <span className="font-medium">{user?.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Total Exams</span>
              <span className="font-medium">{examResults.length}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Average Score</span>
              <span className={`font-medium ${getGradeColor(getAverageScore())}`}>
                {getAverageScore()}%
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full mt-6 flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderExamsView = () => (
    <div className="pb-24">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold">Available Exams</h2>
        </div>

        <div className="space-y-4">
          {/* Active Exam */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Algebra II - Final Exam</div>
                  <div className="text-sm text-gray-600">Available now • 60 minutes • 15 questions</div>
                  <div className="text-xs text-gray-500 mt-1">Mathematics Department</div>
                </div>
              </div>
              <div className="text-right">
                {completedExams.includes('exam-1') ? (
                  <div className="space-y-2">
                    <span className="inline-flex items-center px-3 py-1 text-sm bg-gray-300 text-gray-600 rounded-full">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </span>
                    <button 
                      onClick={() => {
                        // Find the exam result and show answer sheet
                        const result = examResults.find(r => r.examId === 'exam-1');
                        if (result) {
                          setExamResult(result);
                          setShowAnswerSheet(true);
                        }
                      }}
                      className="block w-full px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      View Results
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={startExam}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Start Exam
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Scheduled Exam */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Geometry - Chapter 5 Test</div>
                  <div className="text-sm text-gray-600">Opens Jan 25, 2:00 PM • 45 minutes • 12 questions</div>
                  <div className="text-xs text-gray-500 mt-1">Mathematics Department</div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 text-sm bg-orange-100 text-orange-600 rounded-full">
                  <Clock className="h-4 w-4 mr-1" />
                  Scheduled
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Exam */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Statistics - Midterm</div>
                  <div className="text-sm text-gray-600">Opens Feb 1, 10:00 AM • 90 minutes • 20 questions</div>
                  <div className="text-xs text-gray-500 mt-1">Mathematics Department</div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full">
                  <Calendar className="h-4 w-4 mr-1" />
                  Upcoming
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExamTakingView = () => {
    if (!currentExam) {
      setCurrentExam(mockExam);
      setExamTimeLeft(mockExam.duration * 60);
    }

    const currentQuestion = currentExam?.questions?.[0] || mockExam.questions[0];
    const currentQuestionIndex = 0;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Exam Header */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">{currentExam?.title || mockExam.title}</h1>
              <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {currentExam?.questions?.length || mockExam.questions.length}</p>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${examTimeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(examTimeLeft)}
              </div>
              <p className="text-xs text-gray-600">Time Remaining</p>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">{currentQuestion.question}</h2>
            
            {/* Multiple Choice Questions */}
            {currentQuestion.type === 'mcq' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option: string, index: number) => (
                  <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={examAnswers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* True/False Questions */}
            {currentQuestion.type === 'true_false' && (
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="true"
                    checked={examAnswers[currentQuestion.id] === 'true'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">True</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="false"
                    checked={examAnswers[currentQuestion.id] === 'false'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">False</span>
                </label>
              </div>
            )}

            {/* Short Answer Questions */}
            {currentQuestion.type === 'short_answer' && (
              <div>
                <input
                  type="text"
                  value={examAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your answer..."
                />
              </div>
            )}
          </div>

          {/* Question Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="font-medium mb-3">Question Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {(currentExam?.questions || mockExam.questions).map((q: any, index: number) => (
                <button
                  key={q.id}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    examAnswers[q.id] 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Answered: {Object.keys(examAnswers).length} of {currentExam?.questions?.length || mockExam.questions.length}
                </p>
              </div>
              <button
                onClick={submitExam}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="font-semibold">MathTrack</span>
          </div>
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5" />
            <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      {currentView === 'home' && renderHomeView()}
      {currentView === 'scores' && renderScoresView()}
      {currentView === 'board' && renderBoardView()}
      {currentView === 'profile' && renderProfileView()}
      {currentView === 'exams' && renderExamsView()}
      {currentView === 'exam-taking' && renderExamTakingView()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around p-4">
          <button 
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center space-y-1 ${currentView === 'home' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </button>
          <button 
            onClick={() => setCurrentView('scores')}
            className={`flex flex-col items-center space-y-1 ${currentView === 'scores' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Scores</span>
          </button>
          <button 
            onClick={() => setCurrentView('board')}
            className={`flex flex-col items-center space-y-1 ${currentView === 'board' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">Board</span>
          </button>
          <button 
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center space-y-1 ${currentView === 'profile' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      {currentView === 'board' && boardTab === 'qa' && (
        <button 
          onClick={() => setShowNewQuestionForm(true)}
          className="fixed bottom-20 right-4 rounded-full h-14 w-14 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg text-white flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Answer Sheet Modal */}
      {showAnswerSheet && examResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Exam Completed!</h3>
                  <p className="text-gray-600">Your answer sheet and results</p>
                </div>
                <button
                  onClick={() => {
                    setShowAnswerSheet(false);
                    setCurrentExam(null);
                    setExamAnswers({});
                    setExamSubmitted(false);
                    setCurrentView('home');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Results Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getGradeColor(examResult.score)}`}>
                    {examResult.score}%
                  </div>
                  <div className="text-lg font-semibold text-gray-800 mb-1">
                    Grade: {examResult.grade}
                  </div>
                  <div className="text-sm text-gray-600">
                    {examResult.correctAnswers} out of {examResult.totalQuestions} questions correct
                  </div>
                </div>
              </div>

              {/* Answer Sheet */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Answer Sheet</h4>
                {mockExam.questions.map((question: any, index: number) => {
                  const userAnswer = examResult.answers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div key={question.id} className={`border rounded-lg p-4 ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {isCorrect ? '✓' : '✗'}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Question {index + 1}: {question.question}
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              <strong>Your Answer:</strong> {userAnswer || 'No answer provided'}
                            </div>
                            {!isCorrect && (
                              <div className="text-green-700">
                                <strong>Correct Answer:</strong> {question.correctAnswer}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAnswerSheet(false);
                    setCurrentExam(null);
                    setExamAnswers({});
                    setExamSubmitted(false);
                    setCurrentView('scores');
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View All Scores
                </button>
                <button
                  onClick={() => {
                    setShowAnswerSheet(false);
                    setCurrentExam(null);
                    setExamAnswers({});
                    setExamSubmitted(false);
                    setCurrentView('home');
                  }}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;