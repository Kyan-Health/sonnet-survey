import { getSurveyResponsesByOrganization } from './surveyService';
import { SURVEY_QUESTIONS, SURVEY_FACTORS, getQuestionsByFactor, CompletedSurvey, DEMOGRAPHIC_QUESTIONS } from '@/data/surveyData';

export interface FactorAnalysis {
  factor: string;
  averageScore: number;
  responseCount: number;
  questions: QuestionAnalysis[];
}

export interface QuestionAnalysis {
  questionId: string;
  question: string;
  averageScore: number;
  responseCount: number;
  distribution: { [rating: number]: number };
}

export interface DemographicBreakdown {
  [key: string]: {
    count: number;
    averageScore: number;
    percentage: number;
  };
}

export interface SurveyAnalytics {
  totalResponses: number;
  overallAverageScore: number;
  factorAnalysis: FactorAnalysis[];
  completionRate: number;
  responseDistribution: { [rating: number]: number };
  demographics: {
    department: DemographicBreakdown;
    country: DemographicBreakdown;
    yearsAtCompany: DemographicBreakdown;
    role: DemographicBreakdown;
    workLocation: DemographicBreakdown;
  };
  lastUpdated: Date;
}

function calculateDistribution(responses: number[]): { [rating: number]: number } {
  const distribution: { [rating: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  responses.forEach(rating => {
    if (rating >= 1 && rating <= 5) {
      distribution[rating] = (distribution[rating] || 0) + 1;
    }
  });
  return distribution;
}

function analyzeQuestion(questionId: string, allResponses: CompletedSurvey[]): QuestionAnalysis {
  const questionData = SURVEY_QUESTIONS.find(q => q.id === questionId);
  if (!questionData) {
    throw new Error(`Question not found: ${questionId}`);
  }

  const responses: number[] = [];
  
  allResponses.forEach(survey => {
    const response = survey.responses.find(r => r.questionId === questionId);
    if (response) {
      responses.push(response.rating);
    }
  });

  const averageScore = responses.length > 0 
    ? responses.reduce((sum, rating) => sum + rating, 0) / responses.length 
    : 0;

  return {
    questionId,
    question: questionData.question,
    averageScore: Math.round(averageScore * 100) / 100,
    responseCount: responses.length,
    distribution: calculateDistribution(responses)
  };
}

function analyzeFactor(factor: string, allResponses: CompletedSurvey[]): FactorAnalysis {
  const factorQuestions = getQuestionsByFactor(factor);
  const questionAnalyses = factorQuestions.map(q => analyzeQuestion(q.id, allResponses));
  
  const totalScore = questionAnalyses.reduce((sum, qa) => sum + (qa.averageScore * qa.responseCount), 0);
  const totalResponses = questionAnalyses.reduce((sum, qa) => sum + qa.responseCount, 0);
  const averageScore = totalResponses > 0 ? totalScore / totalResponses : 0;

  return {
    factor,
    averageScore: Math.round(averageScore * 100) / 100,
    responseCount: Math.max(...questionAnalyses.map(qa => qa.responseCount), 0),
    questions: questionAnalyses
  };
}

function analyzeDemographics(allResponses: CompletedSurvey[]): SurveyAnalytics['demographics'] {
  const demographics: SurveyAnalytics['demographics'] = {
    department: {},
    country: {},
    yearsAtCompany: {},
    role: {},
    workLocation: {}
  };

  // Initialize demographics breakdown
  Object.keys(DEMOGRAPHIC_QUESTIONS).forEach(key => {
    const demographicKey = key as keyof typeof DEMOGRAPHIC_QUESTIONS;
    demographics[demographicKey] = {};
  });

  // Process each survey response
  allResponses.forEach(survey => {
    // Skip if no demographics data
    if (!survey.demographics) {
      return;
    }

    // Calculate average score for this user
    const userAverage = survey.responses.reduce((sum, response) => sum + response.rating, 0) / survey.responses.length;

    // Update demographic breakdowns
    Object.entries(survey.demographics).forEach(([key, value]) => {
      const demographicKey = key as keyof typeof demographics;
      if (demographics[demographicKey] && value && value.trim() !== '') {
        if (!demographics[demographicKey][value]) {
          demographics[demographicKey][value] = {
            count: 0,
            averageScore: 0,
            percentage: 0
          };
        }
        
        const current = demographics[demographicKey][value];
        // Update running average
        const newCount = current.count + 1;
        const newAverage = (current.averageScore * current.count + userAverage) / newCount;
        
        demographics[demographicKey][value] = {
          count: newCount,
          averageScore: Math.round(newAverage * 100) / 100,
          percentage: 0 // Will be calculated later
        };
      }
    });
  });

  // Calculate percentages
  const totalResponses = allResponses.length;
  Object.keys(demographics).forEach(key => {
    const demographicKey = key as keyof typeof demographics;
    Object.keys(demographics[demographicKey]).forEach(value => {
      demographics[demographicKey][value].percentage = Math.round(
        (demographics[demographicKey][value].count / totalResponses) * 100
      );
    });
  });

  return demographics;
}

export async function getSurveyAnalytics(organizationId?: string): Promise<SurveyAnalytics> {
  try {
    const allResponses = await getSurveyResponsesByOrganization(organizationId);
    
    // Filter out responses that don't have the new demographic structure
    const validResponses = allResponses.filter(response => 
      response.demographics && typeof response.demographics === 'object'
    );
    
    if (allResponses.length === 0) {
      return {
        totalResponses: 0,
        overallAverageScore: 0,
        factorAnalysis: [],
        completionRate: 0,
        responseDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        demographics: {
          department: {},
          country: {},
          yearsAtCompany: {},
          role: {},
          workLocation: {}
        },
        lastUpdated: new Date()
      };
    }

    // Use all responses for factor analysis (backward compatibility)
    const factorAnalysis = SURVEY_FACTORS.map(factor => analyzeFactor(factor, allResponses));
    
    // Calculate overall metrics using all responses
    const allRatings: number[] = [];
    allResponses.forEach(survey => {
      survey.responses.forEach(response => {
        allRatings.push(response.rating);
      });
    });

    const overallAverageScore = allRatings.length > 0 
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
      : 0;

    const responseDistribution = calculateDistribution(allRatings);

    // Calculate completion rate (assuming we have a way to track total invited users)
    const totalQuestions = SURVEY_QUESTIONS.length;
    const expectedTotalResponses = allResponses.length * totalQuestions;
    const actualTotalResponses = allRatings.length;
    const completionRate = expectedTotalResponses > 0 
      ? (actualTotalResponses / expectedTotalResponses) * 100 
      : 0;

    // Analyze demographics using only valid responses
    const demographics = analyzeDemographics(validResponses);

    return {
      totalResponses: allResponses.length,
      overallAverageScore: Math.round(overallAverageScore * 100) / 100,
      factorAnalysis,
      completionRate: Math.round(completionRate * 100) / 100,
      responseDistribution,
      demographics,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error generating survey analytics:', error);
    throw new Error('Failed to generate survey analytics');
  }
}

export function getScoreCategory(score: number): { category: string; color: string } {
  if (score >= 4.5) return { category: 'Excellent', color: 'text-green-600' };
  if (score >= 4.0) return { category: 'Good', color: 'text-blue-600' };
  if (score >= 3.5) return { category: 'Average', color: 'text-yellow-600' };
  if (score >= 3.0) return { category: 'Below Average', color: 'text-orange-600' };
  return { category: 'Poor', color: 'text-red-600' };
}