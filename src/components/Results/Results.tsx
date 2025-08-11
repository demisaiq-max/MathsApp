import React, { useState } from 'react';
import { BarChart3, TrendingUp, Award, FileText, Search, Filter } from 'lucide-react';

const Results: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock results data
  const results = [
    {
      id: '1',
      studentId: 'STU001',
      studentName: 'John Smith',
      examDate: '2025-01-15',
      grade: 9,
      subjectType: 'Math',
      totalQuestions: 25,
      correctAnswers: 20,
      totalScore: 85,
      percentile: 78,
      scaledScore: 520
    },
    {
      id: '2',
      studentId: 'STU002',
      studentName: 'Sarah Johnson',
      examDate: '2025-01-15',
      grade: 9,
      subjectType: 'Math',
      totalQuestions: 25,
      correctAnswers: 23,
      totalScore: 95,
      percentile: 92,
      scaledScore: 580
    },
    {
      id: '3',
      studentId: 'STU003',
      studentName: 'Mike Davis',
      examDate: '2025-01-10',
      grade: 10,
      subjectType: 'Physics',
      totalQuestions: 30,
      correctAnswers: 22,
      totalScore: 78,
      percentile: 65,
      scaledScore: 480
    }
  ];

  const filteredResults = results.filter(result => {
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'high') return result.totalScore >= 90 && matchesSearch;
    if (selectedFilter === 'medium') return result.totalScore >= 70 && result.totalScore < 90 && matchesSearch;
    if (selectedFilter === 'low') return result.totalScore < 70 && matchesSearch;
    
    return matchesSearch;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100';
    if (score >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 90) return <Award className="h-4 w-4 text-emerald-600" />;
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-orange-600" />;
    return <BarChart3 className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Results</h1>
        <p className="text-gray-600">View and analyze student performance and scores</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">47</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">86.2%</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Top Performers</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Improvement Rate</p>
              <p className="text-2xl font-bold text-gray-900">+12.5%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters and Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h3 className="text-lg font-medium text-gray-900">Student Results</h3>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Students</option>
                  <option value="high">High Performers (90%+)</option>
                  <option value="medium">Medium Performers (70-89%)</option>
                  <option value="low">Needs Improvement (&lt;70%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Student
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Exam Details
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Performance
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Score
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Percentile
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Scaled Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getPerformanceIcon(result.totalScore)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{result.studentName}</p>
                        <p className="text-sm text-gray-500">{result.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{result.examDate}</p>
                      <p className="text-sm text-gray-500">Grade {result.grade} • {result.subjectType}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">
                        {result.correctAnswers}/{result.totalQuestions}
                      </p>
                      <p className="text-sm text-gray-500">correct answers</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreColor(result.totalScore)}`}>
                      {result.totalScore}%
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{result.percentile}th</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${result.percentile}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">{result.scaledScore}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;