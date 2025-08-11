import React, { useState } from 'react';
import { Send, Plus, FileText, Calendar } from 'lucide-react';
import SubmissionForm from './SubmissionForm';
import { apiService } from '../../services/api';

const Submissions: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const handleSubmitAnswers = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Submit each answer individually
      const promises = data.questions.map((question: any) =>
        apiService.submitStudentAnswer({
          studentId: data.studentId,
          examDate: data.examDate,
          grade: data.grade,
          subjectType: data.subjectType,
          selectionType: data.selectionType,
          questionNo: question.questionNo,
          answer: question.answer
        })
      );

      await Promise.all(promises);
      setShowForm(false);
      
      // Add to local state for display
      setSubmissions(prev => [...prev, {
        id: Date.now().toString(),
        studentId: data.studentId,
        examDate: data.examDate,
        grade: data.grade,
        subjectType: data.subjectType,
        questionCount: data.questions.length,
        submittedAt: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to submit answers:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Submissions</h1>
          <p className="text-gray-600">Manage and review student answer submissions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Submission</span>
        </button>
      </div>

      <div className="grid gap-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Submissions</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Submissions</h3>
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-500 mb-6">Start by submitting your first student answers</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Submission</span>
            </button>
          </div>
        ) : (
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
                    Questions
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{submission.studentId}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{submission.examDate}</p>
                        <p className="text-sm text-gray-500">Grade {submission.grade} • {submission.subjectType}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900">{submission.questionCount} questions</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Submitted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <SubmissionForm
          onSubmit={handleSubmitAnswers}
          onCancel={() => setShowForm(false)}
          loading={isSubmitting}
        />
      )}
    </div>
  );
};

export default Submissions;