'use client';

import { useState, useEffect } from 'react';
import { 
  Organization, 
  DemographicQuestion, 
  DEFAULT_DEMOGRAPHIC_QUESTIONS 
} from '@/types/organization';
import { updateOrganization } from '@/lib/organizationService';

interface DemographicManagementModalProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrganization: Organization) => void;
}

export default function DemographicManagementModal({ 
  organization, 
  isOpen, 
  onClose, 
  onSave 
}: DemographicManagementModalProps) {
  const [demographicQuestions, setDemographicQuestions] = useState<DemographicQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<DemographicQuestion | null>(null);

  // Form state for new/editing questions
  const [formData, setFormData] = useState({
    id: '',
    label: '',
    type: 'select' as 'select' | 'text' | 'number',
    required: true,
    options: [''],
    placeholder: '',
    order: 1
  });

  useEffect(() => {
    if (organization) {
      setDemographicQuestions(organization.demographicQuestions || []);
    }
  }, [organization]);

  const resetForm = () => {
    setFormData({
      id: '',
      label: '',
      type: 'select',
      required: true,
      options: [''],
      placeholder: '',
      order: Math.max(...demographicQuestions.map(q => q.order), 0) + 1
    });
    setEditingQuestion(null);
    setShowAddForm(false);
  };

  const handleAddQuestion = () => {
    setShowAddForm(true);
    // Reset form data without hiding the form
    setFormData({
      id: '',
      label: '',
      type: 'select',
      required: true,
      options: [''],
      placeholder: '',
      order: Math.max(...demographicQuestions.map(q => q.order), 0) + 1
    });
    setEditingQuestion(null);
    // Scroll to the form after it's rendered
    setTimeout(() => {
      const formElement = document.querySelector('.add-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleEditQuestion = (question: DemographicQuestion) => {
    setEditingQuestion(question);
    setFormData({
      id: question.id,
      label: question.label,
      type: question.type,
      required: question.required,
      options: question.options || [''],
      placeholder: question.placeholder || '',
      order: question.order
    });
    setShowAddForm(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!confirm('Are you sure you want to delete this demographic question?')) {
      return;
    }

    const updatedQuestions = demographicQuestions.filter(q => q.id !== questionId);
    setDemographicQuestions(updatedQuestions);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label.trim()) {
      alert('Please enter a question label');
      return;
    }

    if (formData.type === 'select' && formData.options.filter(opt => opt.trim()).length === 0) {
      alert('Please add at least one option for select questions');
      return;
    }

    const questionData: DemographicQuestion = {
      id: formData.id || `custom_${Date.now()}`,
      label: formData.label,
      type: formData.type,
      required: formData.required,
      order: formData.order,
      ...(formData.type === 'select' && { 
        options: formData.options.filter(opt => opt.trim()) 
      }),
      ...(formData.type !== 'select' && formData.placeholder && { 
        placeholder: formData.placeholder 
      })
    };

    let updatedQuestions;
    if (editingQuestion) {
      // Update existing question
      updatedQuestions = demographicQuestions.map(q => 
        q.id === editingQuestion.id ? questionData : q
      );
    } else {
      // Add new question
      updatedQuestions = [...demographicQuestions, questionData];
    }

    // Sort by order
    updatedQuestions.sort((a, b) => a.order - b.order);
    setDemographicQuestions(updatedQuestions);
    resetForm();
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateOrganization(organization.id, {
        demographicQuestions: demographicQuestions
      });
      
      const updatedOrg = {
        ...organization,
        demographicQuestions: demographicQuestions
      };
      
      onSave(updatedOrg);
      alert('Demographic questions updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving demographic questions:', error);
      alert('Failed to save demographic questions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDefaults = () => {
    if (!confirm('This will replace all current demographic questions with the default set. Are you sure?')) {
      return;
    }
    setDemographicQuestions(DEFAULT_DEMOGRAPHIC_QUESTIONS);
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Demographic Questions
              </h2>
              <p className="text-gray-600 mt-1">
                Manage demographic questions for {organization.displayName}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleLoadDefaults}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Load Defaults
              </button>
              <button
                onClick={handleAddQuestion}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Add Question
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 add-form-container">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              <form onSubmit={handleSaveQuestion}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., What department do you work in?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'select' | 'text' | 'number' })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="select">Multiple Choice</option>
                      <option value="text">Text Input</option>
                      <option value="number">Number Input</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {formData.type !== 'select' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placeholder Text
                      </label>
                      <input
                        type="text"
                        value={formData.placeholder}
                        onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Enter your job title..."
                      />
                    </div>
                  )}

                  {formData.type === 'select' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options *
                      </label>
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Option ${index + 1}`}
                          />
                          {formData.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
                      >
                        Add Option
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.required}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Required question</span>
                  </label>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    {editingQuestion ? 'Update' : 'Add'} Question
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Questions List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Questions ({demographicQuestions.length})
            </h3>
            
            {demographicQuestions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No demographic questions configured.</p>
                <button
                  onClick={handleLoadDefaults}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Load Default Questions
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {demographicQuestions
                  .sort((a, b) => a.order - b.order)
                  .map((question) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                              Order: {question.order}
                            </span>
                            <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded">
                              {question.type}
                            </span>
                            {question.required && (
                              <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            {question.label}
                          </h4>
                          {question.options && (
                            <div className="text-sm text-gray-600">
                              <strong>Options:</strong> {question.options.join(', ')}
                            </div>
                          )}
                          {question.placeholder && (
                            <div className="text-sm text-gray-600">
                              <strong>Placeholder:</strong> {question.placeholder}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {demographicQuestions.length} question(s) configured
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}