# Survey Data Structure Documentation

## Overview
The Sonnet Survey application is built around a comprehensive employee engagement survey with 73 questions organized into 15 factors. This document details the complete data structure, calculation methods, and analytics implementation.

## Survey Architecture

### 1. Factor Structure
The survey is organized into 15 engagement factors, each containing multiple questions:

```typescript
// Survey Factors (15 total)
const SURVEY_FACTORS = [
  'Happiness',
  'Leadership', 
  'Mission & Purpose',
  'Wellbeing',
  'Growth',
  'Diversity & Inclusion',
  'Entrepreneurship',
  'Psychological Safety',
  'Team Communication',
  'Rewards',
  'Feedback',
  'Productivity',
  'Compliance',
  'Retention',
  'Excellence'
] as const;

type SurveyFactor = typeof SURVEY_FACTORS[number];
```

### 2. Question Structure
```typescript
interface SurveyQuestion {
  id: string;                    // Unique identifier (e.g., "happiness_1")
  factor: SurveyFactor;          // Which factor this question belongs to
  question: string;              // The question text
  order: number;                 // Order within factor
}

// Example questions
const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "happiness_1",
    factor: "Happiness",
    question: "I am happy working at this organization",
    order: 1
  },
  {
    id: "happiness_2", 
    factor: "Happiness",
    question: "I would recommend this organization as a great place to work",
    order: 2
  },
  // ... 71 more questions
];
```

### 3. Complete Question List by Factor

#### Happiness (6 questions)
```typescript
const HAPPINESS_QUESTIONS = [
  "I am happy working at this organization",
  "I would recommend this organization as a great place to work", 
  "I rarely think about looking for a job at another organization",
  "Overall, I am extremely satisfied with my organization as a place to work",
  "My organization is a fun place to work",
  "I am proud to work for this organization"
];
```

#### Leadership (6 questions)
```typescript
const LEADERSHIP_QUESTIONS = [
  "I have confidence in the leadership team of this organization",
  "The leadership team has communicated a vision that motivates me",
  "The leadership team makes me feel that I am a valuable part of this organization",
  "I trust the leadership team to set the right priorities for this organization",
  "The leadership team treats people fairly and with respect",
  "The leadership team makes decisions based on the values of the organization"
];
```

#### Mission & Purpose (4 questions)
```typescript
const MISSION_PURPOSE_QUESTIONS = [
  "I find real meaning in my work",
  "I understand how my role contributes to the mission of the organization", 
  "The mission/purpose of this organization motivates me",
  "This organization makes a positive impact in the world"
];
```

#### Wellbeing (5 questions)
```typescript
const WELLBEING_QUESTIONS = [
  "This organization supports my physical wellbeing",
  "This organization supports my mental wellbeing",
  "I can maintain a healthy work-life balance",
  "My workload is manageable",
  "I feel energized by my work"
];
```

#### Growth (6 questions)
```typescript
const GROWTH_QUESTIONS = [
  "I see a path for career progression within this organization",
  "This organization invests in my professional development",
  "I have opportunities to learn and grow in my role",
  "My manager supports my career development",
  "I feel challenged by my work in a positive way",
  "I have access to the training I need to do my job well"
];
```

#### Diversity & Inclusion (5 questions)
```typescript
const DIVERSITY_INCLUSION_QUESTIONS = [
  "This organization values diversity and inclusion",
  "I feel like I belong at this organization",
  "People from all backgrounds have equal opportunities to succeed here",
  "I can be myself at work",
  "Different perspectives are valued and heard in this organization"
];
```

#### Entrepreneurship (4 questions)
```typescript
const ENTREPRENEURSHIP_QUESTIONS = [
  "I am encouraged to think creatively and innovate",
  "I have the autonomy to make decisions in my role",
  "This organization embraces change and new ideas",
  "I feel empowered to take initiative"
];
```

#### Psychological Safety (5 questions)
```typescript
const PSYCHOLOGICAL_SAFETY_QUESTIONS = [
  "I feel safe to speak up and voice my opinions",
  "I can admit mistakes without fear of blame or punishment",
  "I feel comfortable asking for help when I need it",
  "People treat each other with respect in this organization",
  "I trust my colleagues to support me"
];
```

#### Team Communication (5 questions)
```typescript
const TEAM_COMMUNICATION_QUESTIONS = [
  "Communication within my team is clear and effective",
  "I feel well-informed about what's happening in the organization",
  "My team collaborates effectively to achieve our goals",
  "Meetings in this organization are productive and valuable",
  "Information flows freely between different levels of the organization"
];
```

#### Rewards (4 questions)
```typescript
const REWARDS_QUESTIONS = [
  "I am fairly compensated for my work",
  "This organization recognizes and rewards good performance",
  "The benefits offered by this organization meet my needs",
  "I feel valued for my contributions"
];
```

#### Feedback (5 questions)
```typescript
const FEEDBACK_QUESTIONS = [
  "I receive regular feedback on my performance",
  "The feedback I receive helps me improve",
  "My manager is effective at giving constructive feedback",
  "I feel comfortable giving feedback to my manager",
  "This organization has effective performance review processes"
];
```

#### Productivity (5 questions)
```typescript
const PRODUCTIVITY_QUESTIONS = [
  "I have the tools and resources I need to do my job effectively",
  "My workspace enables me to be productive",
  "Processes and procedures in this organization help me work efficiently",
  "I can focus on my work without unnecessary distractions",
  "Technology and systems support my productivity"
];
```

#### Compliance (4 questions)
```typescript
const COMPLIANCE_QUESTIONS = [
  "This organization operates with high ethical standards",
  "I feel comfortable reporting unethical behavior if I observe it",
  "This organization follows appropriate laws and regulations",
  "Leadership models ethical behavior"
];
```

#### Retention (4 questions)
```typescript
const RETENTION_QUESTIONS = [
  "I plan to be working for this organization one year from now",
  "It would take a lot for me to leave this organization",
  "This organization makes me want to do my best work",
  "I would choose to work for this organization again"
];
```

#### Excellence (5 questions)
```typescript
const EXCELLENCE_QUESTIONS = [
  "This organization sets high standards for quality",
  "People in this organization take pride in their work",
  "This organization strives for continuous improvement",
  "We deliver excellent results for our customers/stakeholders",
  "This organization has a culture of excellence"
];
```

## Response Structure

### 1. Rating Scale
```typescript
// 5-point Likert scale
const RATING_SCALE = {
  1: "Strongly Disagree",
  2: "Disagree", 
  3: "Neutral",
  4: "Agree",
  5: "Strongly Agree"
} as const;

type Rating = 1 | 2 | 3 | 4 | 5;

const RATING_LABELS: Record<Rating, string> = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neutral", 
  4: "Agree",
  5: "Strongly Agree"
};
```

### 2. Survey Response Data Structure
```typescript
interface SurveyResponse {
  id: string;                           // Document ID
  userId: string;                       // Firebase UID
  organizationId: string;               // User's organization
  responses: Record<string, Rating>;    // Question ID -> Rating
  demographics: DynamicDemographicResponse; // Dynamic demographics
  submittedAt: Timestamp;               // Submission time
  version: number;                      // Survey version
}

// Example response data
const exampleResponse: SurveyResponse = {
  id: "abc123",
  userId: "user123",
  organizationId: "kyan-health",
  responses: {
    "happiness_1": 4,
    "happiness_2": 5,
    "leadership_1": 3,
    // ... all 73 questions
  },
  demographics: {
    "department": "Engineering",
    "yearsAtCompany": "2-5 years",
    "workLocation": "Remote",
    "roleLevel": "Individual Contributor"
  },
  submittedAt: new Date(),
  version: 1
};
```

## Demographics System

### 1. Dynamic Demographics Structure
```typescript
interface DemographicQuestion {
  id: string;                           // Unique question ID
  label: string;                        // Question text
  type: 'select' | 'text' | 'number';   // Input type
  required: boolean;                    // Required field
  order: number;                        // Display order
  options?: string[];                   // Options for select type
  placeholder?: string;                 // Placeholder text
}

// Dynamic response type
type DynamicDemographicResponse = Record<string, string>;
```

### 2. Default Demographics Questions
```typescript
const DEFAULT_DEMOGRAPHIC_QUESTIONS: DemographicQuestion[] = [
  {
    id: "department",
    label: "What department do you work in?",
    type: "select",
    required: true,
    order: 1,
    options: [
      "Engineering",
      "Product", 
      "Marketing",
      "Sales",
      "Operations",
      "HR",
      "Finance",
      "Executive",
      "Other"
    ]
  },
  {
    id: "yearsAtCompany", 
    label: "How long have you been with the company?",
    type: "select",
    required: true,
    order: 2,
    options: [
      "Less than 6 months",
      "6 months - 1 year", 
      "1-2 years",
      "2-5 years",
      "5-10 years",
      "More than 10 years"
    ]
  },
  {
    id: "roleLevel",
    label: "What is your role level?", 
    type: "select",
    required: true,
    order: 3,
    options: [
      "Individual Contributor",
      "Team Lead",
      "Manager", 
      "Senior Manager",
      "Director",
      "VP/Executive"
    ]
  },
  {
    id: "workLocation",
    label: "What is your primary work location?",
    type: "select", 
    required: true,
    order: 4,
    options: [
      "Office",
      "Remote",
      "Hybrid"
    ]
  },
  {
    id: "country",
    label: "Which country are you based in?",
    type: "select",
    required: false,
    order: 5,
    options: [
      "United States",
      "Canada", 
      "United Kingdom",
      "Germany",
      "Other"
    ]
  }
];
```

## Analytics Calculations

### 1. Factor Score Calculation
```typescript
// Calculate average score for a factor
const calculateFactorScore = (
  responses: Record<string, Rating>,
  factor: SurveyFactor
): number => {
  const factorQuestions = getQuestionsByFactor(factor);
  const factorResponses = factorQuestions
    .map(q => responses[q.id])
    .filter(response => response !== undefined);

  if (factorResponses.length === 0) return 0;

  const sum = factorResponses.reduce((acc, rating) => acc + rating, 0);
  return sum / factorResponses.length;
};

// Calculate all factor scores
const calculateAllFactorScores = (responses: Record<string, Rating>) => {
  const scores: Record<SurveyFactor, number> = {} as any;
  
  SURVEY_FACTORS.forEach(factor => {
    scores[factor] = calculateFactorScore(responses, factor);
  });
  
  return scores;
};
```

### 2. Overall Engagement Score
```typescript
const calculateOverallEngagement = (responses: Record<string, Rating>): number => {
  const allRatings = Object.values(responses);
  
  if (allRatings.length === 0) return 0;
  
  const sum = allRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / allRatings.length;
};
```

### 3. Analytics Data Structure
```typescript
interface SurveyAnalytics {
  totalResponses: number;
  completionRate: number;
  overallEngagement: number;
  factorScores: Record<SurveyFactor, number>;
  demographics: Record<string, DemographicBreakdown>;
  responseDistribution: Record<Rating, number>;
  trendData?: TrendAnalysis;
}

interface DemographicBreakdown {
  [value: string]: {
    count: number;
    averageScore: number;
    factorScores: Record<SurveyFactor, number>;
  };
}

interface TrendAnalysis {
  timeRanges: string[];
  engagementTrend: number[];
  factorTrends: Record<SurveyFactor, number[]>;
}
```

### 4. Analytics Implementation
```typescript
// lib/analytics.ts
export function analyzeSurveyData(responses: SurveyResponse[]): SurveyAnalytics {
  if (responses.length === 0) {
    return {
      totalResponses: 0,
      completionRate: 0,
      overallEngagement: 0,
      factorScores: {} as Record<SurveyFactor, number>,
      demographics: {},
      responseDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  // Calculate overall metrics
  const totalResponses = responses.length;
  const overallEngagement = calculateAverageEngagement(responses);
  const factorScores = calculateAverageFactorScores(responses);
  
  // Analyze demographics dynamically
  const demographics = analyzeDemographics(responses);
  
  // Calculate response distribution
  const responseDistribution = calculateResponseDistribution(responses);

  return {
    totalResponses,
    completionRate: 100, // Assuming only completed responses
    overallEngagement,
    factorScores,
    demographics,
    responseDistribution
  };
}

const calculateAverageEngagement = (responses: SurveyResponse[]): number => {
  const allEngagementScores = responses.map(response => 
    calculateOverallEngagement(response.responses)
  );
  
  return allEngagementScores.reduce((sum, score) => sum + score, 0) / allEngagementScores.length;
};

const calculateAverageFactorScores = (responses: SurveyResponse[]): Record<SurveyFactor, number> => {
  const factorScores: Record<SurveyFactor, number> = {} as any;
  
  SURVEY_FACTORS.forEach(factor => {
    const factorAvgs = responses.map(response => 
      calculateFactorScore(response.responses, factor)
    );
    
    factorScores[factor] = factorAvgs.reduce((sum, avg) => sum + avg, 0) / factorAvgs.length;
  });
  
  return factorScores;
};

const analyzeDemographics = (responses: SurveyResponse[]): Record<string, DemographicBreakdown> => {
  const demographics: Record<string, DemographicBreakdown> = {};
  
  // Dynamically discover demographic fields
  const demographicFields = new Set<string>();
  responses.forEach(response => {
    Object.keys(response.demographics).forEach(field => {
      demographicFields.add(field);
    });
  });
  
  // Analyze each demographic field
  demographicFields.forEach(field => {
    demographics[field] = {};
    
    // Group responses by demographic value
    const groups: Record<string, SurveyResponse[]> = {};
    responses.forEach(response => {
      const value = response.demographics[field] || 'Not specified';
      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push(response);
    });
    
    // Calculate metrics for each group
    Object.entries(groups).forEach(([value, groupResponses]) => {
      const averageScore = calculateAverageEngagement(groupResponses);
      const factorScores = calculateAverageFactorScores(groupResponses);
      
      demographics[field][value] = {
        count: groupResponses.length,
        averageScore,
        factorScores
      };
    });
  });
  
  return demographics;
};
```

## Data Export Format

### 1. CSV Export Structure
```typescript
interface SurveyExportRow {
  // Response metadata
  responseId: string;
  userId: string;
  organizationId: string;
  submittedAt: string;
  
  // Demographics (dynamic columns)
  [demographicField: string]: string;
  
  // Factor scores
  happinessScore: number;
  leadershipScore: number;
  missionPurposeScore: number;
  // ... all 15 factors
  
  // Overall metrics
  overallEngagement: number;
  
  // Individual question responses
  happiness_1: Rating;
  happiness_2: Rating;
  // ... all 73 questions
}
```

### 2. JSON Export Structure
```typescript
interface SurveyExport {
  metadata: {
    exportDate: string;
    organizationId: string;
    totalResponses: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  analytics: SurveyAnalytics;
  responses: SurveyResponse[];
  questionMetadata: {
    factors: SurveyFactor[];
    questions: SurveyQuestion[];
    ratingScale: typeof RATING_SCALE;
  };
}
```

## Data Validation

### 1. Response Validation
```typescript
const validateSurveyResponse = (response: any): SurveyResponse => {
  // Validate required fields
  if (!response.userId || !response.organizationId) {
    throw new Error('Missing required fields');
  }
  
  // Validate all questions answered
  const requiredQuestions = SURVEY_QUESTIONS.map(q => q.id);
  const answeredQuestions = Object.keys(response.responses);
  
  const missingQuestions = requiredQuestions.filter(q => 
    !answeredQuestions.includes(q)
  );
  
  if (missingQuestions.length > 0) {
    throw new Error(`Missing responses for questions: ${missingQuestions.join(', ')}`);
  }
  
  // Validate rating values
  Object.entries(response.responses).forEach(([questionId, rating]) => {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error(`Invalid rating for question ${questionId}: ${rating}`);
    }
  });
  
  return response as SurveyResponse;
};
```

### 2. Demographics Validation
```typescript
const validateDemographics = (
  demographics: any, 
  questions: DemographicQuestion[]
): DynamicDemographicResponse => {
  const validated: DynamicDemographicResponse = {};
  
  questions.forEach(question => {
    const value = demographics[question.id];
    
    // Check required fields
    if (question.required && (!value || value.trim() === '')) {
      throw new Error(`Required demographic field missing: ${question.label}`);
    }
    
    // Validate select options
    if (question.type === 'select' && value && question.options) {
      if (!question.options.includes(value)) {
        throw new Error(`Invalid option for ${question.label}: ${value}`);
      }
    }
    
    // Validate number fields
    if (question.type === 'number' && value) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        throw new Error(`Invalid number for ${question.label}: ${value}`);
      }
    }
    
    if (value) {
      validated[question.id] = value.toString().trim();
    }
  });
  
  return validated;
};
```

This comprehensive documentation provides everything needed to understand how the survey data flows through the system, from question structure to analytics calculations. Any developer or AI tool can use this to understand the complete survey architecture and implement new features or modifications.