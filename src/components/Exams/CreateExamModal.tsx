import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, FileText, Settings } from 'lucide-react';
import { filterApiService, Grade, Subject } from '../../services/filterApi';
import { examManagementApi, CreateExamData, ExamQuestion } from '../../services/examManagementApi';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateExamData>({
    title: '',
    grade_id: '',
    subject_id: '',
    duration_minutes: 60,
    start_time: '',
    end_time: '',
    instructions: '',
    requires_submission: true,
    max_attempts: 1,
    questions: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchGrades();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.grade_id) {
      fetchSubjectsForGrade(formData.grade_id);
    }
  }, [formData.grade_id]);

  const fetchGrades = async () => {
    try {
      const gradesData = await filterApiService.getGrades();
      setGrades(gradesData);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchSubjectsForGrade = async (gradeId: string) => {
    try {
      const subjectsData = await filterApiService.getSubjectsForGrade(gradeId);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const addQuestion = () => {
    const newQuestion: ExamQuestion = {
      question_number: formData.questions.length + 1,
      question_type: 'multiple_choice',
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const updateQuestion = (index: number, updates: Partial<ExamQuestion>) => {
    const updatedQuestions = formData.questions.map((q, i) => 
      i === index ? { ...q, ...updates } : q
    );
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    // Renumber questions
    const renumberedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      question_number: i + 1
    }));
    setFormData({ ...formData, questions: renumberedQuestions });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await examManagementApi.createExam(formData);
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      grade_id: '',
      subject_id: '',
      duration_minutes: 60,
      start_time: '',
      end_time: '',
      instructions: '',
      requires_submission: true,
      max_attempts: 1,
      questions: []
    });
    setCurrentStep(1);
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exam Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter exam title"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade *
          </label>
          <select
            value={formData.grade_id}
            onChange={(e) => setFormData({ ...formData, grade_id: e.target.value, subject_id: '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Grade</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <select
            value={formData.subject_id}
            onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!formData.grade_id}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time *
          </label>
          <input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time *
          </label>
          <input
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Attempts
          </label>
          <input
            type="number"
            min="1"
            value={formData.max_attempts}
            onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Enter exam instructions..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="requires_submission"
          checked={formData.requires_submission}
          onChange={(e) => setFormData({ ...formData, requires_submission: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="requires_submission" className="text-sm text-gray-700">
          Require submission (students must submit their answers)
        </label>
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Exam Questions</h4>
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question</span>
        </button>
      </div>

      {formData.questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No questions added yet. Click "Add Question" to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {formData.questions.map((question, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900">Question {question.question_number}</h5>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={question.question_type}
                      onChange={(e) => updateQuestion(index, { 
                        question_type: e.target.value as ExamQuestion['question_type'],
                        options: e.target.value === 'multiple_choice' ? ['', '', '', ''] : undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="essay">Essay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter the question..."
                  />
                </div>

                {question.question_type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-2">
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500 w-6">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(question.options || [])];
                              newOptions[optionIndex] = e.target.value;
                              updateQuestion(index, { options: newOptions });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  {question.question_type === 'multiple_choice' ? (
                    <select
                      value={question.correct_answer}
                      onChange={(e) => updateQuestion(index, { correct_answer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select correct answer</option>
                      {question.options?.map((option, optionIndex) => (
                        <option key={optionIndex} value={String.fromCharCode(65 + optionIndex)}>
                          {String.fromCharCode(65 + optionIndex)} - {option}
                        </option>
                      ))}
                    </select>
                  ) : question.question_type === 'true_false' ? (
                    <select
                      value={question.correct_answer}
                      onChange={(e) => updateQuestion(index, { correct_answer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select correct answer</option>
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  ) : (
                    <textarea
                      value={question.correct_answer}
                      onChange={(e) => updateQuestion(index, { correct_answer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Enter the correct answer or key points..."
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create New Exam</h3>
              <p className="text-sm text-gray-500">
                Step {currentStep} of 2: {currentStep === 1 ? 'Basic Information' : 'Questions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {currentStep === 1 ? renderBasicInfo() : renderQuestions()}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex space-x-2">
            <div className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          </div>

          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < 2 ? (
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!formData.title || !formData.grade_id || !formData.subject_id || !formData.start_time || !formData.end_time}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || formData.questions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Exam'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExamModal;