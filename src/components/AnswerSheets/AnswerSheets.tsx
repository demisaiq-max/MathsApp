import React, { useState } from 'react';
import { Plus, FileText, Trash2, Calendar, User } from 'lucide-react';
import { useAnswerSheets } from '../../hooks/useApi';
import AnswerSheetForm from './AnswerSheetForm';

const AnswerSheets: React.FC = () => {
  const { answerSheets, loading, createAnswerSheet, deleteAnswerSheet } = useAnswerSheets();
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAnswerSheet = async (data: any) => {
    try {
      setIsCreating(true);
      await createAnswerSheet(data);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create answer sheet:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this answer sheet?')) {
      try {
        await deleteAnswerSheet(id);
      } catch (error) {
        console.error('Failed to delete answer sheet:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Answer Sheets</h1>
          <p className="text-gray-600">Manage exam answer sheets and correct answers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Answer Sheet</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Registered Answer Sheets</h3>
        </div>

        {answerSheets.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No answer sheets yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first answer sheet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Answer Sheet</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Exam Details
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Question
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Correct Answer
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm uppercase tracking-wider">
                    Weight
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
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{sheet.examDate}</p>
                          <p className="text-sm text-gray-500">Grade {sheet.grade} • {sheet.subjectType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">Question {sheet.questionNo}</p>
                        <p className="text-sm text-gray-500">{sheet.selectionType}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {sheet.correctAnswer}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900">{sheet.weight} points</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(sheet.id)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete answer sheet"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <AnswerSheetForm
          onSubmit={handleCreateAnswerSheet}
          onCancel={() => setShowForm(false)}
          loading={isCreating}
        />
      )}
    </div>
  );
};

export default AnswerSheets;