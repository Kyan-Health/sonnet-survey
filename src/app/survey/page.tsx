'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { 
  SURVEY_FACTORS, 
  RATING_LABELS, 
  getQuestionsByFactor,
  SurveyResponse,
  DynamicDemographicResponse 
} from '@/data/surveyData';
import { submitSurvey, hasUserCompletedSurvey } from '@/lib/surveyService';
import DemographicForm from '@/components/DemographicForm';
import { DEFAULT_DEMOGRAPHIC_QUESTIONS } from '@/types/organization';

export default function SurveyPage() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [currentStep, setCurrentStep] = useState<'demographics' | 'survey'>('demographics');
  const [currentFactor, setCurrentFactor] = useState(0);
  const [responses, setResponses] = useState<{ [questionId: string]: number }>({});
  const [demographics, setDemographics] = useState<DynamicDemographicResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCompletion = async () => {
      if (user) {
        try {
          const completed = await hasUserCompletedSurvey(user.uid);
          setHasCompleted(completed);
        } catch (error) {
          console.error('Error checking survey completion:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkCompletion();
  }, [user]);

  const handleDemographicsComplete = (demographicResponses: DynamicDemographicResponse) => {
    setDemographics(demographicResponses);
    setCurrentStep('survey');
  };

  const handleBackToDemographics = () => {
    setCurrentStep('demographics');
    setCurrentFactor(0);
  };

  const handleSubmit = async () => {
    if (!user || !demographics || !currentOrganization) return;
    
    setIsSubmitting(true);
    
    try {
      const surveyResponses: SurveyResponse[] = Object.entries(responses).map(([questionId, rating]) => ({
        questionId,
        rating
      }));

      await submitSurvey(
        user.uid, 
        user.email!, 
        surveyResponses, 
        demographics,
        currentOrganization.id,
        currentOrganization.name
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Survey Completed</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your feedback! You have already completed this survey.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show demographics form first
  if (currentStep === 'demographics') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Experience Survey</h1>
            <p className="text-gray-600">Step 1 of 2: Tell us about yourself</p>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
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
          </div>

          <DemographicForm 
            questions={currentOrganization?.demographicQuestions || DEFAULT_DEMOGRAPHIC_QUESTIONS}
            onComplete={handleDemographicsComplete} 
          />
        </div>
      </div>
    );
  }

  // Survey questions flow
  const currentFactorName = SURVEY_FACTORS[currentFactor];
  const currentQuestions = getQuestionsByFactor(currentFactorName);
  const totalFactors = SURVEY_FACTORS.length;
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

  const RatingScale = ({ questionId, currentRating }: { questionId: string; currentRating?: number }) => (
    <div className="flex justify-center space-x-2 mt-4">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          onClick={() => handleRatingChange(questionId, rating)}
          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
            currentRating === rating
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
          }`}
          title={RATING_LABELS[rating as keyof typeof RATING_LABELS]}
        >
          {rating}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Experience Survey</h1>
          <p className="text-gray-600">Step 2 of 2: Survey Questions</p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">{currentFactorName}</h2>
          
          <div className="space-y-8">
            {currentQuestions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {index + 1}. {question.question}
                  </h3>
                  {question.subFactor && (
                    <p className="text-sm text-blue-600 font-medium">
                      {question.subFactor}
                    </p>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>
                  <RatingScale 
                    questionId={question.id} 
                    currentRating={responses[question.id]}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={currentFactor === 0 ? handleBackToDemographics : handlePrevious}
              className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {currentFactor === 0 ? 'Back to Demographics' : 'Previous'}
            </button>

            <div className="text-sm text-gray-600">
              {currentQuestions.filter(q => responses[q.id] !== undefined).length} of {currentQuestions.length} questions answered
            </div>

            {currentFactor === totalFactors - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className={`px-6 py-2 rounded-lg font-medium ${
                  canProceed() && !isSubmitting
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Survey'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-6 py-2 rounded-lg font-medium ${
                  canProceed()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
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