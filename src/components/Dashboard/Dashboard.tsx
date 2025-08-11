import React from 'react';
import { FileText, Users, Send, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';
import { useExamStats } from '../../hooks/useApi';

const Dashboard: React.FC = () => {
  const { stats, loading } = useExamStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your math score management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Exams"
          value={stats?.totalExams || 0}
          icon={FileText}
          color="bg-blue-500"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          color="bg-emerald-500"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Submissions"
          value={stats?.totalSubmissions || 0}
          icon={Send}
          color="bg-purple-500"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Average Score"
          value={`${stats?.averageScore || 0}%`}
          icon={TrendingUp}
          color="bg-orange-500"
          trend={{ value: 3.2, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">New answer sheet registered</p>
                <p className="text-xs text-gray-500">Grade 9 Math - Multiple Choice</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
              <Send className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Batch grading completed</p>
                <p className="text-xs text-gray-500">45 submissions processed</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">New students registered</p>
                <p className="text-xs text-gray-500">12 students added to system</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Database</span>
              </div>
              <span className="text-xs text-emerald-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">API Services</span>
              </div>
              <span className="text-xs text-emerald-600 font-medium">Running</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Auto Grading</span>
              </div>
              <span className="text-xs text-emerald-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;