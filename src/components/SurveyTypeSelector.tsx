'use client';

import { useState, useEffect } from 'react';
import { Organization, OrganizationSurveyConfig } from '@/types/organization';
import { SurveyType } from '@/types/surveyType';
import { getActiveSurveyTypes } from '@/lib/surveyTypeService';
import { updateOrganization } from '@/lib/organizationService';

interface SurveyTypeSelectorProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrganization: Organization) => void;
}

export default function SurveyTypeSelector({ 
  organization, 
  isOpen, 
  onClose, 
  onSave 
}: SurveyTypeSelectorProps) {
  const [availableSurveyTypes, setAvailableSurveyTypes] = useState<SurveyType[]>([]);
  const [selectedSurveyTypes, setSelectedSurveyTypes] = useState<string[]>([]);
  const [defaultSurveyType, setDefaultSurveyType] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSurveyTypes = async () => {
      try {
        const surveyTypes = await getActiveSurveyTypes();
        setAvailableSurveyTypes(surveyTypes);
        
        // Set current organization selections
        setSelectedSurveyTypes(organization.availableSurveyTypes || []);
        setDefaultSurveyType(organization.defaultSurveyType || '');
      } catch (error) {
        console.error('Error loading survey types:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadSurveyTypes();
    }
  }, [isOpen, organization]);

  const handleSurveyTypeToggle = (surveyTypeId: string) => {
    setSelectedSurveyTypes(prev => {
      const newSelection = prev.includes(surveyTypeId)
        ? prev.filter(id => id !== surveyTypeId)
        : [...prev, surveyTypeId];
      
      // If we're removing the default survey type, clear the default
      if (!newSelection.includes(defaultSurveyType)) {
        setDefaultSurveyType(newSelection[0] || '');
      }
      
      return newSelection;
    });
  };

  const handleSetDefault = (surveyTypeId: string) => {
    // Ensure the survey type is selected before setting as default
    if (!selectedSurveyTypes.includes(surveyTypeId)) {
      setSelectedSurveyTypes(prev => [...prev, surveyTypeId]);
    }
    setDefaultSurveyType(surveyTypeId);
  };

  const handleSave = async () => {
    if (selectedSurveyTypes.length === 0) {
      alert('Please select at least one survey type');
      return;
    }

    setIsSaving(true);
    try {
      // Create active survey types configuration
      const activeSurveyTypes: { [key: string]: OrganizationSurveyConfig } = {};
      
      selectedSurveyTypes.forEach(surveyTypeId => {
        activeSurveyTypes[surveyTypeId] = {
          surveyTypeId,
          isActive: true,
          lastConfigured: new Date(),
          // Preserve existing configuration if it exists
          ...organization.activeSurveyTypes?.[surveyTypeId]
        };
      });

      const updatedOrg: Organization = {
        ...organization,
        availableSurveyTypes: selectedSurveyTypes,
        defaultSurveyType: defaultSurveyType || selectedSurveyTypes[0],
        activeSurveyTypes
      };

      await updateOrganization(organization.id, {
        availableSurveyTypes: selectedSurveyTypes,
        defaultSurveyType: defaultSurveyType || selectedSurveyTypes[0],
        activeSurveyTypes
      });

      onSave(updatedOrg);
      alert(`Survey types updated successfully! ${selectedSurveyTypes.length} survey types enabled.`);
      onClose();
    } catch (error) {
      console.error('Error saving survey types:', error);
      alert('Failed to save survey type configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Configure Survey Types
              </h2>
              <p className="text-gray-600 mt-1">
                Select which survey types are available for {organization.displayName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading survey types...</div>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedSurveyTypes.length}
                  </div>
                  <div className="text-sm text-blue-600">Selected Types</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {availableSurveyTypes.length}
                  </div>
                  <div className="text-sm text-gray-600">Available Types</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-bold text-green-600">
                    {defaultSurveyType ? 
                      availableSurveyTypes.find(st => st.id === defaultSurveyType)?.metadata.displayName 
                      : 'None'
                    }
                  </div>
                  <div className="text-sm text-green-600">Default Type</div>
                </div>
              </div>

              {/* Survey Types */}
              <div className="space-y-4">
                {availableSurveyTypes.map((surveyType) => {
                  const isSelected = selectedSurveyTypes.includes(surveyType.id);
                  const isDefault = defaultSurveyType === surveyType.id;
                  
                  return (
                    <div 
                      key={surveyType.id} 
                      className={`border rounded-lg p-4 ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSurveyTypeToggle(surveyType.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {surveyType.metadata.displayName}
                              </h3>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                surveyType.metadata.category === 'engagement' ? 'bg-blue-100 text-blue-800' :
                                surveyType.metadata.category === 'burnout' ? 'bg-red-100 text-red-800' :
                                surveyType.metadata.category === 'wellbeing' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {surveyType.metadata.category}
                              </span>
                              {isDefault && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mt-1">
                              {surveyType.metadata.description}
                            </p>
                            {surveyType.metadata.researchBasis && (
                              <p className="text-blue-600 text-sm mt-1">
                                Based on: {surveyType.metadata.researchBasis}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>{surveyType.questions.length} questions</span>
                              <span>{surveyType.factors.length} factors</span>
                              {surveyType.metadata.estimatedTime && (
                                <span>~{surveyType.metadata.estimatedTime} min</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {isSelected && (
                            <button
                              onClick={() => handleSetDefault(surveyType.id)}
                              disabled={isDefault}
                              className={`text-xs font-bold py-1 px-2 rounded ${
                                isDefault 
                                  ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              }`}
                            >
                              {isDefault ? 'Default' : 'Set Default'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedSurveyTypes.length} of {availableSurveyTypes.length} survey types selected
              {selectedSurveyTypes.length === 0 && (
                <span className="text-red-600 ml-2">⚠️ At least one survey type must be selected</span>
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
                disabled={isSaving || selectedSurveyTypes.length === 0}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}