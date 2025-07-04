export interface RatingScale {
  min: number;
  max: number;
  labels: { [value: number]: string };
  type: 'likert' | 'frequency' | 'agreement' | 'custom';
}

export interface SurveyQuestionTemplate {
  id: string;
  factor: string;
  subFactor?: string;
  questionTemplate: string; // Template with {organization} placeholder
  order: number;
  required: boolean;
  ratingScale?: RatingScale; // Override default scale for this question
}

export interface SurveyTypeMetadata {
  name: string;
  displayName: string;
  description: string;
  version: string;
  researchBasis?: string; // e.g., "Maslach Burnout Inventory", "COPSOC"
  recommendedFrequency?: string; // e.g., "Quarterly", "Annually"
  estimatedTime?: number; // minutes to complete
  category: 'wellbeing' | 'engagement' | 'culture' | 'burnout' | 'custom';
}

export interface SurveyType {
  id: string;
  metadata: SurveyTypeMetadata;
  defaultRatingScale: RatingScale;
  questions: SurveyQuestionTemplate[];
  factors: string[]; // Available factors in this survey type
  isActive: boolean;
  isSystemDefault: boolean; // Cannot be deleted, managed by system
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin who created it
}

// Standard rating scales
export const RATING_SCALES: Record<string, RatingScale> = {
  FIVE_POINT_LIKERT: {
    min: 1,
    max: 5,
    type: 'likert',
    labels: {
      1: "Strongly Disagree",
      2: "Disagree",
      3: "Neutral",
      4: "Agree",
      5: "Strongly Agree"
    }
  },
  SEVEN_POINT_LIKERT: {
    min: 1,
    max: 7,
    type: 'likert',
    labels: {
      1: "Strongly Disagree",
      2: "Disagree",
      3: "Somewhat Disagree",
      4: "Neutral",
      5: "Somewhat Agree",
      6: "Agree",
      7: "Strongly Agree"
    }
  },
  FREQUENCY_SCALE: {
    min: 1,
    max: 5,
    type: 'frequency',
    labels: {
      1: "Never",
      2: "Rarely",
      3: "Sometimes",
      4: "Often",
      5: "Always"
    }
  },
  MBI_FREQUENCY: {
    min: 0,
    max: 6,
    type: 'frequency',
    labels: {
      0: "Never",
      1: "A few times a year or less",
      2: "Once a month or less",
      3: "A few times a month",
      4: "Once a week",
      5: "A few times a week",
      6: "Every day"
    }
  }
};

// Survey type factory interface
export interface SurveyTypeConfig {
  id: string;
  metadata: SurveyTypeMetadata;
  defaultRatingScale: RatingScale;
  questionTemplates: Omit<SurveyQuestionTemplate, 'id'>[];
}

// Response types for multi-survey system
export interface SurveyResponse {
  questionId: string;
  rating: number;
  surveyTypeId: string;
}

export interface CompletedSurvey {
  id: string;
  userId: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  surveyTypeId: string; // New field for multi-survey support
  responses: SurveyResponse[];
  demographics: Record<string, string>; // Dynamic demographics
  completedAt: Date;
  sessionId: string;
  version?: string; // Survey type version when completed
}