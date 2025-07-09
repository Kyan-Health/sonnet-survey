'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { 
  SurveyResponse,
  DynamicDemographicResponse 
} from '@/data/surveyData';
import { submitSurvey, hasUserCompletedSurvey } from '@/lib/surveyService';
import { getSurveyType } from '@/lib/surveyTypeService';
import { SurveyType, RatingScale } from '@/types/surveyType';
import DemographicForm from '@/components/DemographicForm';
import { DEFAULT_DEMOGRAPHIC_QUESTIONS } from '@/types/organization';

export default function SurveyPage() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [currentStep, setCurrentStep] = useState<'survey-selection' | 'demographics' | 'survey'>('survey-selection');
  const [currentFactor, setCurrentFactor] = useState(0);
  const [responses, setResponses] = useState<{ [questionId: string]: number }>({});
  const [demographics, setDemographics] = useState<DynamicDemographicResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSurveyType, setCurrentSurveyType] = useState<SurveyType | null>(null);
  const [availableSurveyTypes, setAvailableSurveyTypes] = useState<SurveyType[]>([]);
  const [availableFactors, setAvailableFactors] = useState<string[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Array<{
    id: string;
    factor: string;
    subFactor?: string;
    question: string;
    ratingScale?: RatingScale;
  }>>([]);
  const [completedSurveyTypes, setCompletedSurveyTypes] = useState<string[]>([]);

  useEffect(() => {
    const initializeSurvey = async () => {
      if (user && currentOrganization) {
        try {
          // Get the organization's available survey types
          const availableSurveyTypeIds = currentOrganization.availableSurveyTypes || [];
          
          if (availableSurveyTypeIds.length === 0) {
            console.error('No survey types configured for organization');
            setIsLoading(false);
            return;
          }

          // Load all available survey types
          const surveyTypesPromises = availableSurveyTypeIds.map(id => getSurveyType(id));
          const surveyTypesResults = await Promise.all(surveyTypesPromises);
          const validSurveyTypes = surveyTypesResults.filter(st => st !== null) as SurveyType[];
          
          setAvailableSurveyTypes(validSurveyTypes);

          // Check completion status for each survey type
          const completionPromises = validSurveyTypes.map(st => 
            hasUserCompletedSurvey(user.uid, st.id)
          );
          const completionResults = await Promise.all(completionPromises);
          
          const completedTypes = validSurveyTypes
            .filter((_, index) => completionResults[index])
            .map(st => st.id);
          
          setCompletedSurveyTypes(completedTypes);

          // If only one survey type is available, skip selection step
          if (validSurveyTypes.length === 1) {
            const surveyType = validSurveyTypes[0];
            const isCompleted = completionResults[0];
            
            if (isCompleted) {
              setHasCompleted(true);
            } else {
              setCurrentSurveyType(surveyType);
              setAvailableFactors(surveyType.factors);
              setCurrentStep('demographics');
            }
          }

        } catch (error) {
          console.error('Error initializing survey:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeSurvey();
  }, [user, currentOrganization]);

  // Load questions for current factor when survey type or factor changes
  useEffect(() => {
    if (currentSurveyType && availableFactors.length > 0) {
      const currentFactorName = availableFactors[currentFactor];
      const factorQuestions = currentSurveyType.questions
        .filter(q => q.factor === currentFactorName)
        .map(q => ({
          id: q.id,
          factor: q.factor,
          subFactor: q.subFactor,
          question: q.questionTemplate.replace(/{organization}/g, currentOrganization?.displayName || 'the organization'),
          ratingScale: q.ratingScale || currentSurveyType.defaultRatingScale
        }))
        .sort((a, b) => {
          const orderA = currentSurveyType.questions.find(q => q.id === a.id)?.order || 0;
          const orderB = currentSurveyType.questions.find(q => q.id === b.id)?.order || 0;
          return orderA - orderB;
        });
      
      setCurrentQuestions(factorQuestions);
    }
  }, [currentSurveyType, currentFactor, availableFactors, currentOrganization]);

  const handleSurveyTypeSelect = async (surveyType: SurveyType) => {
    setCurrentSurveyType(surveyType);
    setAvailableFactors(surveyType.factors);
    setCurrentStep('demographics');
  };

  const handleBackToSurveySelection = () => {
    setCurrentStep('survey-selection');
    setCurrentSurveyType(null);
    setCurrentFactor(0);
    setResponses({});
    setDemographics(null);
  };

  const handleDemographicsComplete = (demographicResponses: DynamicDemographicResponse) => {
    setDemographics(demographicResponses);
    setCurrentStep('survey');
  };

  const handleBackToDemographics = () => {
    // If multiple survey types are available, go back to survey selection
    if (availableSurveyTypes.length > 1) {
      handleBackToSurveySelection();
    } else {
      setCurrentStep('demographics');
      setCurrentFactor(0);
    }
  };

  const handleSubmit = async () => {
    if (!user || !demographics || !currentOrganization || !currentSurveyType) return;
    
    setIsSubmitting(true);
    
    try {
      const surveyResponses: SurveyResponse[] = Object.entries(responses).map(([questionId, rating]) => ({
        questionId,
        rating,
        surveyTypeId: currentSurveyType.id
      }));

      await submitSurvey(
        user.uid, 
        user.email!, 
        surveyResponses, 
        demographics,
        currentOrganization.id,
        currentOrganization.name,
        currentSurveyType.id
      );
      setHasCompleted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to take the survey.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (hasCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center bg-white rounded-lg shadow-sm p-6 sm:p-8 w-full max-w-md mx-auto">
          <div className="text-green-600 text-5xl sm:text-6xl mb-4">✓</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Survey Completed</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Thank you for your feedback! You have already completed this survey.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm sm:text-base touch-manipulation w-full sm:w-auto"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show survey type selection if multiple types are available
  if (currentStep === 'survey-selection') {
    const availableTypes = availableSurveyTypes.filter(st => !completedSurveyTypes.includes(st.id));
    
    if (availableTypes.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
          <div className="text-center bg-white rounded-lg shadow-sm p-6 sm:p-8 w-full max-w-md mx-auto">
            <div className="text-green-600 text-5xl sm:text-6xl mb-4">✓</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">All Surveys Completed</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              You have completed all available surveys for your organization.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm sm:text-base touch-manipulation w-full sm:w-auto"
            >
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Choose Survey Type</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Select which survey you would like to take for {currentOrganization?.displayName}
            </p>
            {completedSurveyTypes.length > 0 && (
              <p className="text-xs sm:text-sm text-green-600 mt-2">
                ✓ You have completed {completedSurveyTypes.length} survey{completedSurveyTypes.length !== 1 ? 's' : ''} already
              </p>
            )}
          </div>

          {/* Survey Type Cards */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {availableTypes.map((surveyType) => (
              <div 
                key={surveyType.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer active:bg-gray-50"
                onClick={() => handleSurveyTypeSelect(surveyType)}
              >
                <div className="p-4 sm:p-6">
                  <div className="mb-4">
                    <div className="mb-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        {surveyType.metadata.displayName}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                        surveyType.metadata.category === 'engagement' ? 'bg-blue-100 text-blue-800' :
                        surveyType.metadata.category === 'burnout' ? 'bg-red-100 text-red-800' :
                        surveyType.metadata.category === 'wellbeing' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {surveyType.metadata.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    {surveyType.metadata.description}
                  </p>
                  
                  {surveyType.metadata.researchBasis && (
                    <p className="text-blue-600 text-xs sm:text-sm mb-4">
                      📊 Based on: {surveyType.metadata.researchBasis}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs sm:text-sm text-gray-500 mb-4">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">{surveyType.questions.length}</div>
                      <div className="text-xs sm:text-sm">Questions</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">{surveyType.factors.length}</div>
                      <div className="text-xs sm:text-sm">Factors</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">
                        ~{surveyType.metadata.estimatedTime || 10} min
                      </div>
                      <div className="text-xs sm:text-sm">Duration</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSurveyTypeSelect(surveyType)}
                    className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base touch-manipulation"
                  >
                    Start Survey
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Completed Surveys */}
          {completedSurveyTypes.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Completed Surveys</h2>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {availableSurveyTypes
                  .filter(st => completedSurveyTypes.includes(st.id))
                  .map((surveyType) => (
                    <div key={surveyType.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{surveyType.metadata.displayName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">Completed</p>
                        </div>
                        <div className="text-green-600 text-lg sm:text-xl">✓</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show demographics form first
  if (currentStep === 'demographics') {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {currentSurveyType?.metadata.displayName || 'Survey'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Step 1 of 2: Tell us about yourself</p>
            {currentSurveyType?.metadata.description && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {currentSurveyType.metadata.description}
              </p>
            )}
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                <span>Step 1: Demographics</span>
                <span>25% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '25%' }}
                ></div>
              </div>
            </div>
            
            {/* Back to Survey Selection */}
            {availableSurveyTypes.length > 1 && (
              <div className="mt-4">
                <button
                  onClick={handleBackToSurveySelection}
                  className="text-blue-600 hover:text-blue-800 active:text-blue-900 text-xs sm:text-sm font-medium touch-manipulation"
                >
                  ← Back to Survey Selection
                </button>
              </div>
            )}
          </div>

          <DemographicForm 
            questions={currentOrganization?.demographicQuestions || DEFAULT_DEMOGRAPHIC_QUESTIONS}
            onComplete={handleDemographicsComplete} 
          />
        </div>
      </div>
    );
  }

  // Survey questions flow - use current survey type
  if (!currentSurveyType || availableFactors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">No survey configured for this organization</div>
          <Link href="/" className="text-blue-500 hover:underline mt-2 block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentFactorName = availableFactors[currentFactor];
  const totalFactors = availableFactors.length;
  const surveyProgressPercentage = ((currentFactor + 1) / totalFactors) * 75; // 75% for survey portion
  const totalProgressPercentage = 25 + surveyProgressPercentage; // 25% for demographics + survey progress

  const handleRatingChange = (questionId: string, rating: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };

  const canProceed = () => {
    return currentQuestions.every(q => responses[q.id] !== undefined);
  };

  const handleNext = () => {
    if (currentFactor < totalFactors - 1) {
      setCurrentFactor(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentFactor > 0) {
      setCurrentFactor(prev => prev - 1);
    }
  };

  const RatingScale = ({ 
    questionId, 
    currentRating, 
    ratingScale 
  }: { 
    questionId: string; 
    currentRating?: number; 
    ratingScale: RatingScale;
  }) => {
    const scaleValues = [];
    for (let i = ratingScale.min; i <= ratingScale.max; i++) {
      scaleValues.push(i);
    }

    return (
      <div className="flex justify-center gap-1 sm:gap-2 mt-4 px-2">
        {scaleValues.map((rating) => (
          <button
            key={rating}
            onClick={() => handleRatingChange(questionId, rating)}
            className={`min-w-[40px] sm:min-w-[44px] px-1 sm:px-2 py-2 sm:py-3 rounded-lg border-2 transition-colors text-sm sm:text-base font-medium touch-manipulation ${
              currentRating === rating
                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 active:border-blue-400 hover:shadow-sm'
            }`}
            title={ratingScale.labels[rating] || `${rating}`}
          >
            {rating}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {currentSurveyType?.metadata.displayName || 'Survey'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Step 2 of 2: Survey Questions</p>
          {currentSurveyType?.metadata.description && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {currentSurveyType.metadata.description}
            </p>
          )}
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
              <span>Section {currentFactor + 1} of {totalFactors}</span>
              <span>{Math.round(totalProgressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalProgressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">{currentFactorName}</h2>
          
          <div className="space-y-6 sm:space-y-8">
            {currentQuestions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-4 sm:pb-6 last:border-b-0">
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 leading-relaxed">
                    {index + 1}. {question.question}
                  </h3>
                  {question.subFactor && (
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">
                      {question.subFactor}
                    </p>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
                    <span className="text-left">{question.ratingScale?.labels[question.ratingScale.min] || 'Low'}</span>
                    <span className="text-right">{question.ratingScale?.labels[question.ratingScale.max] || 'High'}</span>
                  </div>
                  <RatingScale 
                    questionId={question.id} 
                    currentRating={responses[question.id]}
                    ratingScale={question.ratingScale || currentSurveyType.defaultRatingScale}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={currentFactor === 0 ? handleBackToDemographics : handlePrevious}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400 transition-colors text-sm sm:text-base touch-manipulation"
            >
              {currentFactor === 0 ? 
                (availableSurveyTypes.length > 1 ? 'Back to Survey Selection' : 'Back to Demographics') 
                : 'Previous'}
            </button>

            <div className="text-xs sm:text-sm text-gray-600 text-center order-first sm:order-none">
              {currentQuestions.filter(q => responses[q.id] !== undefined).length} of {currentQuestions.length} questions answered
            </div>

            {currentFactor === totalFactors - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base touch-manipulation ${
                  canProceed() && !isSubmitting
                    ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Survey'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base touch-manipulation ${
                  canProceed()
                    ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next Section
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}