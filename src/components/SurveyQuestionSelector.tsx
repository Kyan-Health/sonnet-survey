'use client';

import { useState, useEffect } from 'react';
import { 
  SURVEY_QUESTION_TEMPLATES, 
  SURVEY_FACTORS,
  getQuestionStats,
  SurveyQuestionTemplate 
} from '@/data/surveyData';
import { Organization } from '@/types/organization';
import { updateOrganization } from '@/lib/organizationService';

interface SurveyQuestionSelectorProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrganization: Organization) => void;
}

export default function SurveyQuestionSelector({ 
  organization, 
  isOpen, 
  onClose, 
  onSave 
}: SurveyQuestionSelectorProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (organization) {
      // If no selection exists, default to all questions
      setSelectedQuestions(
        organization.selectedQuestions || 
        SURVEY_QUESTION_TEMPLATES.map(q => q.id)
      );
      // Start with all factors expanded
      setExpandedFactors(new Set(SURVEY_FACTORS));
    }
  }, [organization]);

  const stats = getQuestionStats(selectedQuestions);

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleFactor = (factor: string) => {
    const factorQuestions = SURVEY_QUESTION_TEMPLATES
      .filter(q => q.factor === factor)
      .map(q => q.id);
    
    const allSelected = factorQuestions.every(id => selectedQuestions.includes(id));
    
    if (allSelected) {
      // Deselect all questions in this factor
      setSelectedQuestions(prev => prev.filter(id => !factorQuestions.includes(id)));
    } else {
      // Select all questions in this factor
      setSelectedQuestions(prev => [...new Set([...prev, ...factorQuestions])]);
    }
  };

  const toggleFactorExpansion = (factor: string) => {
    setExpandedFactors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(factor)) {
        newSet.delete(factor);
      } else {
        newSet.add(factor);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedQuestions(SURVEY_QUESTION_TEMPLATES.map(q => q.id));
  };

  const deselectAll = () => {
    setSelectedQuestions([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedOrg = {
        ...organization,
        selectedQuestions,
        questionSetVersion: (organization.questionSetVersion || 0) + 1,
        lastQuestionUpdate: new Date()
      };

      await updateOrganization(organization.id, {
        selectedQuestions,
        questionSetVersion: updatedOrg.questionSetVersion,
        lastQuestionUpdate: updatedOrg.lastQuestionUpdate
      });

      onSave(updatedOrg);
      alert(`Survey questions updated successfully! ${selectedQuestions.length} questions selected.`);
      onClose();
    } catch (error) {
      console.error('Error saving question selection:', error);
      alert('Failed to save question selection');
    } finally {
      setIsSaving(false);
    }
  };

  const getFactorQuestions = (factor: string): SurveyQuestionTemplate[] => {
    return SURVEY_QUESTION_TEMPLATES.filter(q => q.factor === factor);
  };

  const getFactorSelectionStatus = (factor: string) => {
    const factorQuestions = getFactorQuestions(factor);
    const selectedInFactor = factorQuestions.filter(q => selectedQuestions.includes(q.id)).length;
    const totalInFactor = factorQuestions.length;
    
    return {
      selected: selectedInFactor,
      total: totalInFactor,
      allSelected: selectedInFactor === totalInFactor,
      noneSelected: selectedInFactor === 0,
      partiallySelected: selectedInFactor > 0 && selectedInFactor < totalInFactor
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Customize Survey Questions
              </h2>
              <p className="text-gray-600 mt-1">
                Select which questions to include in surveys for {organization.displayName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm"
            >
              Close
            </button>
          </div>
          
          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.selectedCount}</div>
              <div className="text-sm text-blue-600">Selected Questions</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Available</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.selectionPercentage}%</div>
              <div className="text-sm text-green-600">Coverage</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(stats.factorStats).filter(f => f.selected > 0).length}
              </div>
              <div className="text-sm text-purple-600">Active Factors</div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={selectAll}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {SURVEY_FACTORS.map(factor => {
            const factorQuestions = getFactorQuestions(factor);
            const factorStatus = getFactorSelectionStatus(factor);
            const isExpanded = expandedFactors.has(factor);

            return (
              <div key={factor} className="mb-6 border border-gray-200 rounded-lg">
                {/* Factor Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleFactorExpansion(factor)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900">{factor}</h3>
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                        {factorStatus.selected}/{factorStatus.total}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {factorStatus.partiallySelected && (
                        <span className="bg-yellow-100 text-yellow-600 text-xs font-medium px-2 py-1 rounded">
                          Partial
                        </span>
                      )}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={factorStatus.allSelected}
                          onChange={() => toggleFactor(factor)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Select All</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Factor Questions */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {factorQuestions.map(question => (
                      <div key={question.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => toggleQuestion(question.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {question.questionTemplate.replace(/{organization}/g, organization.displayName)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {question.id}
                            {question.subFactor && (
                              <span className="ml-2 bg-blue-100 text-blue-600 px-1 rounded">
                                {question.subFactor}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedQuestions.length} of {stats.totalQuestions} questions selected
              {selectedQuestions.length === 0 && (
                <span className="text-red-600 ml-2">⚠️ No questions selected - surveys will be empty!</span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
              >
                {isSaving ? 'Saving...' : 'Save Question Selection'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}