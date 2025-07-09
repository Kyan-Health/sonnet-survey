'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateSurveyLink, incrementSurveyLinkResponse } from '@/lib/surveyLinkService';
import { getSurveyType } from '@/lib/surveyTypeService';
import { getOrganization } from '@/lib/organizationService';
import { SurveyLink, Organization } from '@/types/organization';
import { SurveyType } from '@/types/surveyType';
import { submitSurvey } from '@/lib/surveyService';
import { v4 as uuidv4 } from 'uuid';

function AnonymousSurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get token from URL path or search params
  const [token, setToken] = useState<string | null>(null);
  const [surveyLink, setSurveyLink] = useState<SurveyLink | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [surveyType, setSurveyType] = useState<SurveyType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Survey state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{ [questionId: string]: number }>({});
  const [demographics, setDemographics] = useState<{ [key: string]: string }>({});
  const [showDemographics, setShowDemographics] = useState(false);

  useEffect(() => {
    // Get token from URL (supporting both formats)
    const currentPath = window.location.pathname;
    const pathToken = currentPath.split('/').pop();
    const paramToken = searchParams.get('token');
    
    const surveyToken = pathToken && pathToken !== 'anonymous' ? pathToken : paramToken;
    
    if (surveyToken) {
      setToken(surveyToken);
    } else {
      setError('No survey token provided');
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (token) {
      loadSurveyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadSurveyData = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading survey data for token:', token);
      
      // Validate survey link
      const validation = await validateSurveyLink(token);
      console.log('Survey validation result:', validation);
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid survey link');
        return;
      }
      
      const link = validation.link!;
      setSurveyLink(link);
      console.log('Survey link loaded:', link);
      
      // Load organization and survey type
      const [orgData, surveyTypeData] = await Promise.all([
        getOrganization(link.organizationId),
        getSurveyType(link.surveyTypeId)
      ]);
      
      console.log('Organization data:', orgData);
      console.log('Survey type data:', surveyTypeData);
      
      if (!orgData) {
        setError('Organization not found');
        return;
      }
      
      if (!surveyTypeData) {
        setError('Survey type not found');
        return;
      }
      
      setOrganization(orgData);
      setSurveyType(surveyTypeData);
      
      // Show demographics first if required
      if (link.requireDemographics) {
        setShowDemographics(true);
      }
      
    } catch (error) {
      console.error('Error loading survey data:', error);
      setError(`Failed to load survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemographicSubmit = (demographicData: { [key: string]: string }) => {
    setDemographics(demographicData);
    setShowDemographics(false);
  };

  const handleQuestionResponse = (questionId: string, rating: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };

  const handleNext = () => {
    if (surveyType && currentQuestionIndex < surveyType.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!surveyLink || !organization || !surveyType) return;
    
    setIsSubmitting(true);
    try {
      // Generate anonymous user ID
      const anonymousUserId = `anonymous_${uuidv4()}`;
      const anonymousEmail = `anonymous_${uuidv4()}@anonymous.survey`;
      
      // Format responses
      const formattedResponses = Object.entries(responses).map(([questionId, rating]) => ({
        questionId,
        rating,
        surveyTypeId: surveyType.id
      }));
      
      // Submit survey response
      await submitSurvey(
        anonymousUserId,
        anonymousEmail,
        formattedResponses,
        demographics,
        organization.id,
        organization.displayName,
        surveyType.id
      );
      
      // Increment survey link response count
      await incrementSurveyLinkResponse(surveyLink.id);
      
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Error submitting survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading survey...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Survey Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Survey Completed</h2>
          <p className="text-gray-600 mb-6">
            Thank you for participating in our survey. Your feedback is valuable to us.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (showDemographics) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {surveyType?.metadata.displayName} - {organization?.displayName}
              </h1>
              <p className="text-gray-600">
                Please provide some demographic information to help us understand your responses better.
              </p>
            </div>
            
            <DemographicForm
              questions={organization?.demographicQuestions || []}
              onSubmit={handleDemographicSubmit}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!surveyType || !organization) {
    return null;
  }

  const currentQuestion = surveyType.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / surveyType.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === surveyType.questions.length - 1;
  const currentResponse = responses[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {surveyType.metadata.displayName} - {organization.displayName}
            </h1>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {surveyType.questions.length}
            </p>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {currentQuestion.questionTemplate.replace(/{organization}/g, organization.displayName)}
            </h2>
            
            {/* Rating Scale */}
            <div className="space-y-3">
              {/* Check if this is the eNPS question */}
              {currentQuestion.ratingScale?.type === 'custom' && currentQuestion.ratingScale?.max === 10 ? (
                // eNPS 0-10 scale
                <div className="grid grid-cols-11 gap-2">
                  {Array.from({ length: 11 }, (_, i) => {
                    const value = i;
                    const isSelected = currentResponse === value;
                    return (
                      <button
                        key={value}
                        onClick={() => handleQuestionResponse(currentQuestion.id, value)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Standard 0-5 scale
                <div className="grid grid-cols-1 gap-3">
                  {Array.from({ length: 6 }, (_, i) => {
                    const value = i;
                    const scale = currentQuestion.ratingScale || surveyType.defaultRatingScale;
                    const label = scale.labels[value] || `${value}`;
                    const isSelected = currentResponse === value;
                    
                    return (
                      <button
                        key={value}
                        onClick={() => handleQuestionResponse(currentQuestion.id, value)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{label}</span>
                          <span className="text-sm text-gray-500">{value}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
            >
              Previous
            </button>
            
            <div className="text-sm text-gray-600">
              {currentResponse !== undefined ? (
                isLastQuestion ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Next
                  </button>
                )
              ) : (
                <span className="text-gray-400">Please select an answer</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple demographic form component
function DemographicForm({ 
  questions, 
  onSubmit
}: { 
  questions: Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>, 
  onSubmit: (data: { [key: string]: string }) => void
}) {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (questionId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question) => (
        <div key={question.id}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {question.type === 'select' ? (
            <select
              required={question.required}
              value={formData[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an option</option>
              {question.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={question.type}
              required={question.required}
              value={formData[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>
      ))}
      
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
      >
        Continue to Survey
      </button>
    </form>
  );
}

export default function AnonymousSurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading survey...</div>
      </div>
    }>
      <AnonymousSurveyContent />
    </Suspense>
  );
}