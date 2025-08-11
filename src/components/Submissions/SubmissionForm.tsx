import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

interface SubmissionFormProps {
  onSubmit: (submission: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    examDate: '',
    grade: 9,
    subjectType: 'Math',
    selectionType: 'Multiple',
    questions: [{ questionNo: 1, answer: '' }]
  });

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { questionNo: formData.questions.length + 1, answer: '' }]
    });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const updateQuestion = (index: number, answer: string) => {
    const updatedQuestions = formData.questions.map((q, i) =>
      i === index ? { ...q, answer } : q
    );
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Submit Student Answers</h3>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter student ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Date
              </label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={formData.subjectType}
                onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Math">Math</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selection Type
              </label>
              <select
                value={formData.selectionType}
                onChange={(e) => setFormData({ ...formData, selectionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Multiple">Multiple Choice</option>
                <option value="Short">Short Answer</option>
                <option value="Essay">Essay</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Student Answers
              </label>
              <button
                type="button"
                onClick={addQuestion}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-3">
              {formData.questions.map((question, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">Q{question.questionNo}</span>
                  </div>
                  <input
                    type="text"
                    value={question.answer}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter answer (A, B, C, D or text)"
                    required
                  />
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Submit Answers'}</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;