import React, { useState } from 'react';
import { Calculator, PlayCircle, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const AutoGrading: React.FC = () => {
  const [isGrading, setIsGrading] = useState(false);
  const [gradingHistory, setGradingHistory] = useState([
    {
      id: '1',
      examDate: '2025-01-15',
      grade: 9,
      subjectType: 'Math',
      studentsGraded: 45,
      averageScore: 78.5,
      completedAt: '2025-01-15T14:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      examDate: '2025-01-10',
      grade: 10,
      subjectType: 'Physics',
      studentsGraded: 38,
      averageScore: 72.3,
      completedAt: '2025-01-10T16:45:00Z',
      status: 'completed'
    }
  ]);

  const handleStartGrading = async () => {
    setIsGrading(true);
    
    // Simulate grading process
    setTimeout(() => {
      const newGradingResult = {
        id: Date.now().toString(),
        examDate: '2025-01-20',
        grade: 9,
        subjectType: 'Math',
        studentsGraded: 32,
        averageScore: 81.2,
        completedAt: new Date().toISOString(),
        status: 'completed'
      };
      
      setGradingHistory(prev => [newGradingResult, ...prev]);
      setIsGrading(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Auto Grading System</h1>
        <p className="text-gray-600">Automatically grade student submissions and calculate scores</p>
      </div>

      <div className="grid gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start New Grading Session</h3>
              <p className="text-gray-600">Process ungraded submissions automatically</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Pending Submissions</p>
                  <p className="text-2xl font-bold text-blue-900">28</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 mb-1">Answer Sheets Ready</p>
                  <p className="text-2xl font-bold text-emerald-900">5</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Estimated Time</p>
                  <p className="text-2xl font-bold text-orange-900">2.5m</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleStartGrading}
              disabled={isGrading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {isGrading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  <span>Start Auto Grading</span>
                </>
              )}
            </button>

            {isGrading && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>Comparing answers and calculating scores...</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Grading History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Exam Details
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Students
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Average Score
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gradingHistory.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{session.examDate}</p>
                        <p className="text-sm text-gray-500">Grade {session.grade} • {session.subjectType}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900">{session.studentsGraded} students</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{session.averageScore}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${session.averageScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500">
                        {new Date(session.completedAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(session.status)}
                        <span className="text-sm capitalize text-gray-700">{session.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoGrading;