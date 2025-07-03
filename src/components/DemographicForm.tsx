'use client';

import { useState } from 'react';
import { DemographicQuestion } from '@/types/organization';

// Dynamic demographic response type
export type DynamicDemographicResponse = Record<string, string>;

interface DemographicFormProps {
  questions: DemographicQuestion[];
  onComplete: (demographics: DynamicDemographicResponse) => void;
  onBack?: () => void;
}

export default function DemographicForm({ questions, onComplete, onBack }: DemographicFormProps) {
  const [responses, setResponses] = useState<DynamicDemographicResponse>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error when user selects a value
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Check all required fields
    questions.forEach((question) => {
      if (question.required && !responses[question.id]) {
        newErrors[question.id] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onComplete(responses);
    }
  };

  const requiredQuestions = questions.filter(q => q.required);
  const answeredRequired = requiredQuestions.filter(q => responses[q.id]).length;
  const canProceed = answeredRequired === requiredQuestions.length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          About You
        </h2>
        <p className="text-gray-600">
          Help us understand our team better. This information will be kept confidential and used only for analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions
          .sort((a, b) => a.order - b.order)
          .map((question) => {
            const hasError = !!errors[question.id];
            
            return (
              <div key={question.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {question.type === 'select' && (
                  <select
                    value={responses[question.id] || ''}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasError 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Please select...</option>
                    {question.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                
                {question.type === 'text' && (
                  <input
                    type="text"
                    value={responses[question.id] || ''}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    placeholder={question.placeholder || ''}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasError 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                  />
                )}
                
                {question.type === 'number' && (
                  <input
                    type="number"
                    value={responses[question.id] || ''}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    placeholder={question.placeholder || ''}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasError 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                  />
                )}
                
                {hasError && (
                  <p className="mt-1 text-sm text-red-600">{errors[question.id]}</p>
                )}
              </div>
            );
          })}

        <div className="flex justify-between items-center pt-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          <div className="text-sm text-gray-600">
            {Object.values(responses).filter(Boolean).length} of {questions.length} questions answered
          </div>

          <button
            type="submit"
            disabled={!canProceed}
            className={`px-6 py-2 rounded-lg font-medium ${
              canProceed
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue to Survey
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-600 text-sm">
            <strong>Privacy Note:</strong> Your demographic information will be used only for 
            aggregate analysis and reporting. Individual responses remain confidential and 
            will not be linked to your identity in any reports.
          </div>
        </div>
      </div>
    </div>
  );
}