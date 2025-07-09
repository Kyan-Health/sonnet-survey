import { getSurveyResponsesByOrganization, getSurveyResponsesBySurveyType } from './surveyService';
import { getAllSurveyQuestions, getAvailableFactors, getQuestionsByFactor, CompletedSurvey } from '@/data/surveyData';
import { getSurveyType } from './surveyTypeService';
import { SurveyType } from '@/types/surveyType';

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
  demographics: Record<string, DemographicBreakdown>; // Dynamic demographics
  surveyTypeId?: string; // New field for multi-survey analytics
  surveyTypeName?: string; // Human-readable survey type name
  lastUpdated: Date;
}

export interface MultiSurveyAnalytics {
  [surveyTypeId: string]: SurveyAnalytics;
}

function calculateDistribution(responses: number[], minValue: number = 1, maxValue: number = 5): { [rating: number]: number } {
  const distribution: { [rating: number]: number } = {};
  
  // Initialize distribution for the scale range
  for (let i = minValue; i <= maxValue; i++) {
    distribution[i] = 0;
  }
  
  responses.forEach(rating => {
    if (rating >= minValue && rating <= maxValue) {
      distribution[rating] = (distribution[rating] || 0) + 1;
    }
  });
  
  return distribution;
}

function analyzeQuestion(questionId: string, allResponses: CompletedSurvey[], organizationName?: string, selectedQuestionIds?: string[], surveyType?: SurveyType | null): QuestionAnalysis {
  let questionData;
  
  if (surveyType && surveyType.questions) {
    // Use survey type questions if available
    questionData = surveyType.questions.find((q) => q.id === questionId);
    if (questionData) {
      // Convert survey type question format to expected format
      questionData = {
        id: questionData.id,
        factor: questionData.factor,
        subFactor: questionData.subFactor,
        question: questionData.questionTemplate.replace(/{organization}/g, organizationName || 'the organization')
      };
    }
  } else {
    // Fallback to legacy survey questions
    const surveyQuestions = getAllSurveyQuestions(organizationName, selectedQuestionIds);
    questionData = surveyQuestions.find(q => q.id === questionId);
  }
  
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

  // Get rating scale from survey type or use default
  let minValue = 1;
  let maxValue = 5;
  
  if (surveyType) {
    // Check if this question has a custom rating scale
    const surveyQuestion = surveyType.questions?.find((q) => q.id === questionId);
    if (surveyQuestion?.ratingScale) {
      minValue = surveyQuestion.ratingScale.min;
      maxValue = surveyQuestion.ratingScale.max;
    } else if (surveyType.defaultRatingScale) {
      minValue = surveyType.defaultRatingScale.min;
      maxValue = surveyType.defaultRatingScale.max;
    }
  }

  return {
    questionId,
    question: questionData.question,
    averageScore: Math.round(averageScore * 100) / 100,
    responseCount: responses.length,
    distribution: calculateDistribution(responses, minValue, maxValue)
  };
}

function analyzeFactor(factor: string, allResponses: CompletedSurvey[], organizationName?: string, selectedQuestionIds?: string[], surveyType?: SurveyType | null): FactorAnalysis {
  let factorQuestions;
  
  if (surveyType && surveyType.questions) {
    // Use survey type questions if available
    factorQuestions = surveyType.questions
      .filter((q) => q.factor === factor)
      .map((q) => ({
        id: q.id,
        factor: q.factor,
        subFactor: q.subFactor,
        question: q.questionTemplate ? 
          q.questionTemplate.replace(/{organization}/g, organizationName || 'the organization') :
          q.questionTemplate
      }));
  } else {
    // Fallback to legacy survey questions
    factorQuestions = getQuestionsByFactor(factor, organizationName, selectedQuestionIds);
  }
  
  const questionAnalyses = factorQuestions.map((q) => analyzeQuestion(q.id, allResponses, organizationName, selectedQuestionIds, surveyType));
  
  // Special handling for eNPS factor - don't average the raw scores
  if (factor === "Employee Net Promoter Score") {
    const enpsResponses: number[] = [];
    
    allResponses.forEach(survey => {
      factorQuestions.forEach((question) => {
        const response = survey.responses.find(r => r.questionId === question.id);
        if (response) {
          enpsResponses.push(response.rating);
        }
      });
    });

    // Calculate eNPS properly: (% Promoters - % Detractors)
    if (enpsResponses.length > 0) {
      const promoters = enpsResponses.filter(score => score >= 9).length;
      const detractors = enpsResponses.filter(score => score <= 6).length;
      const enpsScore = Math.round(((promoters - detractors) / enpsResponses.length) * 100);
      
      return {
        factor,
        averageScore: enpsScore,
        responseCount: enpsResponses.length,
        questions: questionAnalyses
      };
    }
  }
  
  // Standard factor analysis for non-eNPS factors
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
  const demographics: Record<string, DemographicBreakdown> = {};

  // Get all unique demographic keys from responses
  const demographicKeys = new Set<string>();
  allResponses.forEach(survey => {
    if (survey.demographics) {
      Object.keys(survey.demographics).forEach(key => demographicKeys.add(key));
    }
  });

  // Initialize demographics breakdown for all found keys
  demographicKeys.forEach(key => {
    demographics[key] = {};
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
      if (demographics[key] && value && value.trim() !== '') {
        if (!demographics[key][value]) {
          demographics[key][value] = {
            count: 0,
            averageScore: 0,
            percentage: 0
          };
        }
        
        const current = demographics[key][value];
        // Update running average
        const newCount = current.count + 1;
        const newAverage = (current.averageScore * current.count + userAverage) / newCount;
        
        demographics[key][value] = {
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
    Object.keys(demographics[key]).forEach(value => {
      demographics[key][value].percentage = Math.round(
        (demographics[key][value].count / totalResponses) * 100
      );
    });
  });

  return demographics;
}

export async function getSurveyAnalytics(
  organizationId?: string, 
  organizationName?: string, 
  selectedQuestionIds?: string[],
  surveyTypeId?: string
): Promise<SurveyAnalytics> {
  try {
    // Get responses - either by survey type or all responses
    const allResponses = surveyTypeId 
      ? await getSurveyResponsesBySurveyType(surveyTypeId, organizationId)
      : await getSurveyResponsesByOrganization(organizationId);
    
    // Filter out responses that don't have the new demographic structure
    const validResponses = allResponses.filter(response => 
      response.demographics && typeof response.demographics === 'object'
    );
    
    if (allResponses.length === 0) {
      // Get survey type information for empty state
      let surveyType = null;
      if (surveyTypeId) {
        surveyType = await getSurveyType(surveyTypeId);
      }
      
      let minValue = 1;
      let maxValue = 5;
      if (surveyType?.defaultRatingScale) {
        minValue = surveyType.defaultRatingScale.min;
        maxValue = surveyType.defaultRatingScale.max;
      }
      
      const emptyDistribution: { [rating: number]: number } = {};
      for (let i = minValue; i <= maxValue; i++) {
        emptyDistribution[i] = 0;
      }
      
      return {
        totalResponses: 0,
        overallAverageScore: 0,
        factorAnalysis: [],
        completionRate: 0,
        responseDistribution: emptyDistribution,
        demographics: {
          department: {},
          country: {},
          yearsAtCompany: {},
          role: {},
          workLocation: {}
        },
        surveyTypeId,
        surveyTypeName: surveyType?.metadata.displayName,
        lastUpdated: new Date()
      };
    }

    // Get survey type information if provided
    let surveyType = null;
    if (surveyTypeId) {
      surveyType = await getSurveyType(surveyTypeId);
    }

    // Use all responses for factor analysis
    let availableFactors;
    
    if (surveyType && surveyType.factors) {
      // Use survey type factors if available
      availableFactors = surveyType.factors;
    } else if (surveyType && surveyType.questions) {
      // Extract factors from questions if factors array not available
      availableFactors = [...new Set(surveyType.questions.map((q) => q.factor))];
    } else {
      // Fallback to legacy factors
      availableFactors = getAvailableFactors(selectedQuestionIds);
    }
    
    const factorAnalysis = availableFactors.map(factor => analyzeFactor(factor, allResponses, organizationName, selectedQuestionIds, surveyType));
    
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

    // Calculate response distribution using the survey type's rating scale
    let minValue = 1;
    let maxValue = 5;
    if (surveyType?.defaultRatingScale) {
      minValue = surveyType.defaultRatingScale.min;
      maxValue = surveyType.defaultRatingScale.max;
    }
    const responseDistribution = calculateDistribution(allRatings, minValue, maxValue);

    // Calculate completion rate (assuming we have a way to track total invited users)
    let totalQuestions;
    if (surveyType && surveyType.questions) {
      totalQuestions = surveyType.questions.length;
    } else {
      const surveyQuestions = getAllSurveyQuestions(organizationName, selectedQuestionIds);
      totalQuestions = surveyQuestions.length;
    }
    const expectedTotalResponses = allResponses.length * totalQuestions;
    const actualTotalResponses = allRatings.length;
    const completionRate = expectedTotalResponses > 0 
      ? (actualTotalResponses / expectedTotalResponses) * 100 
      : 0;

    // Get survey type information if provided
    let surveyTypeName: string | undefined;
    if (surveyTypeId) {
      const surveyType = await getSurveyType(surveyTypeId);
      surveyTypeName = surveyType?.metadata.displayName;
    }

    // Analyze demographics using only valid responses
    const demographics = analyzeDemographics(validResponses);

    return {
      totalResponses: allResponses.length,
      overallAverageScore: Math.round(overallAverageScore * 100) / 100,
      factorAnalysis,
      completionRate: Math.round(completionRate * 100) / 100,
      responseDistribution,
      demographics,
      surveyTypeId,
      surveyTypeName,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error generating survey analytics:', error);
    throw new Error('Failed to generate survey analytics');
  }
}

// Get analytics for multiple survey types
export async function getMultiSurveyAnalytics(
  surveyTypeIds: string[],
  organizationId?: string,
  organizationName?: string
): Promise<MultiSurveyAnalytics> {
  try {
    const analytics: MultiSurveyAnalytics = {};

    for (const surveyTypeId of surveyTypeIds) {
      try {
        const surveyAnalytics = await getSurveyAnalytics(
          organizationId,
          organizationName,
          undefined, // selectedQuestionIds - use survey type defaults
          surveyTypeId
        );
        analytics[surveyTypeId] = surveyAnalytics;
      } catch (error) {
        console.error(`Error getting analytics for survey type ${surveyTypeId}:`, error);
        // Continue with other survey types if one fails
      }
    }

    return analytics;
  } catch (error) {
    console.error('Error generating multi-survey analytics:', error);
    throw new Error('Failed to generate multi-survey analytics');
  }
}

// Get burnout-specific analytics (for MBI survey type)
export async function getBurnoutAnalytics(
  organizationId?: string
): Promise<{
  exhaustionScore: number;
  cynicismScore: number;
  efficacyScore: number;
  overallBurnoutRisk: 'Low' | 'Moderate' | 'High';
  analytics: SurveyAnalytics;
}> {
  try {
    const analytics = await getSurveyAnalytics(
      organizationId,
      undefined,
      undefined,
      'mbi-burnout'
    );

    // Calculate dimension scores for MBI
    const exhaustionFactors = analytics.factorAnalysis.filter(f => f.factor === 'Exhaustion');
    const cynicismFactors = analytics.factorAnalysis.filter(f => f.factor === 'Cynicism');
    const efficacyFactors = analytics.factorAnalysis.filter(f => f.factor === 'Professional Efficacy');

    const exhaustionScore = exhaustionFactors.length > 0 ? exhaustionFactors[0].averageScore : 0;
    const cynicismScore = cynicismFactors.length > 0 ? cynicismFactors[0].averageScore : 0;
    const efficacyScore = efficacyFactors.length > 0 ? efficacyFactors[0].averageScore : 0;

    // Calculate overall burnout risk (simplified algorithm)
    let overallBurnoutRisk: 'Low' | 'Moderate' | 'High' = 'Low';
    
    if (exhaustionScore >= 4 || cynicismScore >= 4) {
      overallBurnoutRisk = 'High';
    } else if (exhaustionScore >= 3 || cynicismScore >= 3 || efficacyScore <= 2) {
      overallBurnoutRisk = 'Moderate';
    }

    return {
      exhaustionScore,
      cynicismScore,
      efficacyScore,
      overallBurnoutRisk,
      analytics
    };
  } catch (error) {
    console.error('Error generating burnout analytics:', error);
    throw new Error('Failed to generate burnout analytics');
  }
}

// Dynamic rating scale support for analytics
export function calculateDynamicDistribution(
  responses: number[],
  minValue: number = 1,
  maxValue: number = 5
): { [rating: number]: number } {
  const distribution: { [rating: number]: number } = {};
  
  // Initialize distribution for the scale range
  for (let i = minValue; i <= maxValue; i++) {
    distribution[i] = 0;
  }
  
  responses.forEach(rating => {
    if (rating >= minValue && rating <= maxValue) {
      distribution[rating] = (distribution[rating] || 0) + 1;
    }
  });
  
  return distribution;
}

export function getScoreCategory(score: number, scaleMax: number = 5): { category: string; color: string } {
  // Normalize score to 0-1 range
  const normalizedScore = score / scaleMax;
  
  if (normalizedScore >= 0.9) return { category: 'Excellent', color: 'text-green-600' };
  if (normalizedScore >= 0.8) return { category: 'Good', color: 'text-blue-600' };
  if (normalizedScore >= 0.7) return { category: 'Average', color: 'text-yellow-600' };
  if (normalizedScore >= 0.6) return { category: 'Below Average', color: 'text-orange-600' };
  return { category: 'Poor', color: 'text-red-600' };
}

// Special scoring for eNPS (Employee Net Promoter Score)
export function getENPSCategory(enpsScore: number): { category: string; color: string } {
  if (enpsScore >= 50) return { category: 'Excellent', color: 'text-green-600' };
  if (enpsScore >= 30) return { category: 'Good', color: 'text-blue-600' };
  if (enpsScore >= 0) return { category: 'Average', color: 'text-yellow-600' };
  if (enpsScore >= -30) return { category: 'Poor', color: 'text-orange-600' };
  return { category: 'Critical', color: 'text-red-600' };
}

// Get Kyan Engagement specific analytics with proper eNPS calculation
export async function getKyanEngagementAnalytics(
  organizationId?: string,
  organizationName?: string
): Promise<SurveyAnalytics & { enpsScore: number; enpsCategory: string }> {
  try {
    const analytics = await getSurveyAnalytics(
      organizationId,
      organizationName,
      undefined, // selectedQuestionIds
      'kyan-engagement'
    );

    // Calculate eNPS score from the Employee Net Promoter Score factor
    let enpsScore = 0;
    let enpsCategory = 'No Data';
    
    const enpsResponses = await getSurveyResponsesBySurveyType('kyan-engagement', organizationId);
    const enpsQuestionResponses: number[] = [];
    
    enpsResponses.forEach(survey => {
      // Find the eNPS question - look for the Employee Net Promoter Score factor or question 40
      const enpsResponse = survey.responses.find(r => {
        // Try to match by question ID patterns
        const lowerQuestionId = r.questionId.toLowerCase();
        return lowerQuestionId.includes('kyan-engagement_q40') || 
               lowerQuestionId.includes('enps') || 
               lowerQuestionId.includes('employee_net_promoter') ||
               lowerQuestionId.includes('net_promoter') ||
               r.questionId.endsWith('_q40') ||
               r.questionId.endsWith('40');
      });
      if (enpsResponse) {
        enpsQuestionResponses.push(enpsResponse.rating);
      }
    });

    if (enpsQuestionResponses.length > 0) {
      const promoters = enpsQuestionResponses.filter(score => score >= 9).length;
      const detractors = enpsQuestionResponses.filter(score => score <= 6).length;
      enpsScore = Math.round(((promoters - detractors) / enpsQuestionResponses.length) * 100);
      
      if (enpsScore >= 50) enpsCategory = 'Excellent';
      else if (enpsScore >= 30) enpsCategory = 'Good'; 
      else if (enpsScore >= 0) enpsCategory = 'Average';
      else if (enpsScore >= -30) enpsCategory = 'Poor';
      else enpsCategory = 'Critical';
    }

    return {
      ...analytics,
      enpsScore,
      enpsCategory
    };
  } catch (error) {
    console.error('Error generating Kyan Engagement analytics:', error);
    throw new Error('Failed to generate Kyan Engagement analytics');
  }
}