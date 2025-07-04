export interface SurveyQuestion {
  id: string;
  factor: string;
  subFactor?: string;
  question: string;
}

export interface SurveyQuestionTemplate {
  id: string;
  factor: string;
  subFactor?: string;
  questionTemplate: string; // Template with {organization} placeholder
}

export interface SurveyResponse {
  questionId: string;
  rating: number; // Scale depends on survey type
  surveyTypeId?: string; // Optional for backward compatibility
}

export interface DemographicResponse {
  department: string;
  country: string;
  yearsAtCompany: string;
  role: string;
  workLocation: string;
}

// Dynamic demographic response type for organization-specific questions
export type DynamicDemographicResponse = Record<string, string>;

export interface CompletedSurvey {
  id?: string; // Document ID
  userId: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  surveyTypeId?: string; // New field for multi-survey support (optional for backward compatibility)
  responses: SurveyResponse[];
  demographics: DynamicDemographicResponse; // Updated to use dynamic type
  completedAt: Date;
  sessionId: string;
  version?: string; // Survey type version when completed
}

export const SURVEY_QUESTION_TEMPLATES: SurveyQuestionTemplate[] = [
  // Happiness
  {
    id: "happiness_1",
    factor: "Happiness",
    questionTemplate: "I often experience positive emotions when I am working (e.g., happiness, enthusiasm, enjoyment)."
  },
  {
    id: "happiness_2",
    factor: "Happiness",
    questionTemplate: "I am passionate about the work I do."
  },
  {
    id: "happiness_3",
    factor: "Happiness",
    questionTemplate: "On most days, time goes by quickly when I'm working."
  },
  {
    id: "happiness_4",
    factor: "Happiness",
    questionTemplate: "I feel a strong sense of belonging to {organization}."
  },
  {
    id: "happiness_5",
    factor: "Happiness",
    questionTemplate: "I would recommend {organization} as a great place to work."
  },

  // Leadership
  {
    id: "leadership_1",
    factor: "Leadership",
    questionTemplate: "I have confidence in {organization}'s Senior Leadership."
  },
  {
    id: "leadership_2",
    factor: "Leadership",
    questionTemplate: "{organization}'s Senior Leadership has communicated a vision that motivates me."
  },
  {
    id: "leadership_3",
    factor: "Leadership",
    questionTemplate: "{organization}'s Senior Leadership demonstrates that people are important to the company's success."
  },

  // Mission & Purpose
  {
    id: "mission_1",
    factor: "Mission & Purpose",
    questionTemplate: "I understand {organization}'s Mission."
  },
  {
    id: "mission_2",
    factor: "Mission & Purpose",
    questionTemplate: "{organization}'s Mission aligns well with my own purpose and values."
  },
  {
    id: "mission_3",
    factor: "Mission & Purpose",
    questionTemplate: "I know how my work contributes to the goals of {organization}."
  },
  {
    id: "mission_4",
    factor: "Mission & Purpose",
    questionTemplate: "{organization} is in a position to succeed over the next 3 years."
  },
  {
    id: "mission_5",
    factor: "Mission & Purpose",
    questionTemplate: "{organization}'s commitment to social responsibility is genuine (e.g. sustainability, social impact etc.)."
  },
  {
    id: "mission_6",
    factor: "Mission & Purpose",
    questionTemplate: "{organization}'s social impact initiatives really allow us to make a positive difference."
  },

  // Wellbeing & Switching Off
  {
    id: "wellbeing_1",
    factor: "Wellbeing & Switching Off",
    questionTemplate: "We are genuinely supported with flexibility in the way we work (hours, time off)."
  },
  {
    id: "wellbeing_2",
    factor: "Wellbeing & Switching Off",
    questionTemplate: "I believe our team's wellbeing is a priority at {organization}."
  },
  {
    id: "wellbeing_3",
    factor: "Wellbeing & Switching Off",
    questionTemplate: "The norms on my team are supportive of my personal or family responsibilities."
  },
  {
    id: "wellbeing_4",
    factor: "Wellbeing & Switching Off",
    questionTemplate: "I am able to effectively switch off from work to make time for other areas in my life."
  },
  {
    id: "wellbeing_manager_1",
    factor: "Wellbeing & Switching Off",
    subFactor: "Direct Manager Effectiveness",
    questionTemplate: "My manager is checking in regularly enough with how I am doing (not just work related)."
  },
  {
    id: "wellbeing_manager_2",
    factor: "Wellbeing & Switching Off",
    subFactor: "Direct Manager Effectiveness",
    questionTemplate: "My manager is setting a good example for our wellbeing."
  },

  // Growth
  {
    id: "growth_1",
    factor: "Growth",
    questionTemplate: "{organization} is a great company for me to make a contribution to my development."
  },
  {
    id: "growth_2",
    factor: "Growth",
    questionTemplate: "I believe there are good personal growth opportunities for me at {organization}."
  },
  {
    id: "growth_3",
    factor: "Growth",
    questionTemplate: "My performance is evaluated fairly."
  },
  {
    id: "growth_4",
    factor: "Growth",
    questionTemplate: "{organization} is a great company for me to develop my leadership skills."
  },
  {
    id: "growth_5",
    factor: "Growth",
    questionTemplate: "I know what I need to do to be successful in my role."
  },
  {
    id: "growth_manager_1",
    factor: "Growth",
    subFactor: "Direct Manager Effectiveness",
    questionTemplate: "My manager actively supports my personal growth & development."
  },

  // Diversity & Inclusion
  {
    id: "diversity_1",
    factor: "Diversity & Inclusion",
    questionTemplate: "Decisions that affect me are made in a fair and unbiased manner."
  },
  {
    id: "diversity_2",
    factor: "Diversity & Inclusion",
    questionTemplate: "I can be my authentic self at work."
  },
  {
    id: "diversity_3",
    factor: "Diversity & Inclusion",
    questionTemplate: "I feel I am part of a team."
  },
  {
    id: "diversity_4",
    factor: "Diversity & Inclusion",
    questionTemplate: "{organization} values diversity."
  },
  {
    id: "diversity_5",
    factor: "Diversity & Inclusion",
    questionTemplate: "{organization} builds teams that are diverse."
  },
  {
    id: "diversity_6",
    factor: "Diversity & Inclusion",
    questionTemplate: "People from all backgrounds have equal opportunities to succeed at {organization}."
  },
  {
    id: "diversity_7",
    factor: "Diversity & Inclusion",
    questionTemplate: "I am confident on how I can contribute in building a more inclusive culture in my team."
  },
  {
    id: "diversity_manager_1",
    factor: "Diversity & Inclusion",
    subFactor: "Direct Manager Effectiveness",
    questionTemplate: "My manager promotes an inclusive team environment."
  },

  // Entrepreneurship
  {
    id: "entrepreneurship_1",
    factor: "Entrepreneurship",
    questionTemplate: "I am able to use my personal initiative or judgment in carrying out my work."
  },
  {
    id: "entrepreneurship_2",
    factor: "Entrepreneurship",
    questionTemplate: "We are encouraged to be innovative even though some of our initiatives may not succeed."
  },
  {
    id: "entrepreneurship_3",
    factor: "Entrepreneurship",
    questionTemplate: "We have the space to explore creative solutions and take thoughtful risks in our day-to-day work."
  },
  {
    id: "entrepreneurship_4",
    factor: "Entrepreneurship",
    questionTemplate: "We have enough autonomy to perform our jobs effectively."
  },

  // Psychological Safety
  {
    id: "psych_safety_manager_1",
    factor: "Psychological Safety",
    subFactor: "Direct Manager Effectiveness",
    questionTemplate: "My manager is a great role model for our team."
  },
  {
    id: "psych_safety_1",
    factor: "Psychological Safety",
    questionTemplate: "At {organization} there is open and honest two-way communication."
  },
  {
    id: "psych_safety_2",
    factor: "Psychological Safety",
    questionTemplate: "I can voice a contrary opinion without fear of negative consequences."
  },
  {
    id: "psych_safety_3",
    factor: "Psychological Safety",
    questionTemplate: "When I share my opinion, it is valued."
  },
  {
    id: "psych_safety_4",
    factor: "Psychological Safety",
    questionTemplate: "At {organization}, failure is seen as an opportunity for learning and growth."
  },
  {
    id: "psych_safety_manager_2",
    factor: "Psychological Safety",
    subFactor: "Direct Manager Effectiveness",
    questionTemplate: "People are comfortable speaking up when our manager is present."
  },

  // Team Communication & Collaboration
  {
    id: "team_comm_1",
    factor: "Team Communication & Collaboration",
    questionTemplate: "I have access to the information I need to do my job effectively."
  },
  {
    id: "team_comm_2",
    factor: "Team Communication & Collaboration",
    questionTemplate: "Other functions at {organization} collaborate well with our team to get the job done."
  },
  {
    id: "team_comm_3",
    factor: "Team Communication & Collaboration",
    questionTemplate: "Most of the systems and processes here support us getting our work done effectively."
  },
  {
    id: "team_comm_4",
    factor: "Team Communication & Collaboration",
    questionTemplate: "Generally, teams at {organization} work towards common goals."
  },
  {
    id: "team_comm_5",
    factor: "Team Communication & Collaboration",
    questionTemplate: "The way decisions are taken at {organization} supports us getting our work done effectively."
  },
  {
    id: "team_comm_6",
    factor: "Team Communication & Collaboration",
    questionTemplate: "My work is efficiently aligned with other team members."
  },
  {
    id: "team_comm_7",
    factor: "Team Communication & Collaboration",
    questionTemplate: "Where required, we have clearly defined ownership for company priorities, goals and initiatives at {organization}."
  },
  {
    id: "team_comm_8",
    factor: "Team Communication & Collaboration",
    questionTemplate: "I am appropriately involved in decisions that affect my work."
  },

  // Reward & Recognition
  {
    id: "reward_1",
    factor: "Reward & Recognition",
    questionTemplate: "I am fairly compensated for the work I do."
  },
  {
    id: "reward_2",
    factor: "Reward & Recognition",
    questionTemplate: "I receive appropriate recognition for good work at {organization}."
  },
  {
    id: "reward_3",
    factor: "Reward & Recognition",
    questionTemplate: "I feel empowered to appropriately reward and recognize my team."
  },
  {
    id: "reward_4",
    factor: "Reward & Recognition",
    questionTemplate: "Generally, the right people are recognized at {organization}."
  },

  // Psychological Safety (Feedback)
  {
    id: "psych_feedback_1",
    factor: "Psychological Safety (Feedback)",
    questionTemplate: "{organization} takes action on team's feedback."
  },
  {
    id: "psych_feedback_2",
    factor: "Psychological Safety (Feedback)",
    questionTemplate: "Our culture encourages giving candid, honest feedback even when it may be difficult."
  },
  {
    id: "psych_feedback_3",
    factor: "Psychological Safety (Feedback)",
    questionTemplate: "We (team members) regularly give each other candid feedback."
  },
  {
    id: "psych_feedback_manager_1",
    factor: "Psychological Safety (Feedback)",
    subFactor: "Direct Manager Effectiveness",
    questionTemplate: "My manager gives me useful feedback on how I am performing."
  },

  // Individual Focus & Productivity
  {
    id: "productivity_manager_1",
    factor: "Individual Focus & Productivity",
    subFactor: "Direct Manager Effectiveness",
    questionTemplate: "My manager keeps me informed about my team's future direction and goals."
  },
  {
    id: "productivity_manager_2",
    factor: "Individual Focus & Productivity",
    subFactor: "Direct Manager Effectiveness",
    questionTemplate: "My manager provides me with the information I need to do my job effectively."
  },
  {
    id: "productivity_1",
    factor: "Individual Focus & Productivity",
    questionTemplate: "When it is clear that someone is not delivering in their role, we do something about it."
  },
  {
    id: "productivity_2",
    factor: "Individual Focus & Productivity",
    questionTemplate: "I feel equipped to effectively prioritize my workload."
  },
  {
    id: "productivity_3",
    factor: "Individual Focus & Productivity",
    questionTemplate: "Generally, I believe my workload is reasonable for my role."
  },

  // Compliance
  {
    id: "compliance_1",
    factor: "Compliance",
    questionTemplate: "I am aware of and understand {organization}'s Code of Conduct and other compliance guidelines."
  },
  {
    id: "compliance_2",
    factor: "Compliance",
    questionTemplate: "I believe {organization}'s Code of Conduct and other compliance guidelines help team members act in accordance with {organization}'s values."
  },

  // Retention
  {
    id: "retention_1",
    factor: "Retention",
    questionTemplate: "I rarely think about looking for a job at another company."
  },
  {
    id: "retention_2",
    factor: "Retention",
    questionTemplate: "I plan to be working at {organization} a year from now."
  },
  {
    id: "retention_3",
    factor: "Retention",
    questionTemplate: "If I were offered a similar job at another company, I would stay at {organization}."
  },

  // Excellence
  {
    id: "excellence_1",
    factor: "Excellence",
    questionTemplate: "Day-to-day decisions here demonstrate that quality and improvement are top priorities."
  },
  {
    id: "excellence_2",
    factor: "Excellence",
    questionTemplate: "{organization} strives for excellence in all aspects of its operations."
  },
  {
    id: "excellence_3",
    factor: "Excellence",
    questionTemplate: "At {organization}, we are striking a good balance between continuous improvement and launching new projects."
  }
];

export const SURVEY_FACTORS = [
  "Happiness",
  "Leadership",
  "Mission & Purpose",
  "Wellbeing & Switching Off",
  "Growth",
  "Diversity & Inclusion",
  "Entrepreneurship",
  "Psychological Safety",
  "Team Communication & Collaboration",
  "Reward & Recognition",
  "Psychological Safety (Feedback)",
  "Individual Focus & Productivity",
  "Compliance",
  "Retention",
  "Excellence"
];

export const RATING_LABELS = {
  1: "Strongly Disagree",
  2: "Disagree", 
  3: "Neutral",
  4: "Agree",
  5: "Strongly Agree"
};

// Helper function to generate dynamic questions based on organization
export function generateSurveyQuestions(organizationName: string): SurveyQuestion[] {
  return SURVEY_QUESTION_TEMPLATES.map(template => ({
    id: template.id,
    factor: template.factor,
    subFactor: template.subFactor,
    question: template.questionTemplate.replace(/{organization}/g, organizationName)
  }));
}

// Generate organization-specific questions based on their selection
export function generateCustomSurveyQuestions(organizationName: string, selectedQuestionIds?: string[]): SurveyQuestion[] {
  // If no selection provided, use all questions
  if (!selectedQuestionIds || selectedQuestionIds.length === 0) {
    return generateSurveyQuestions(organizationName);
  }
  
  // Filter templates to only include selected questions
  const selectedTemplates = SURVEY_QUESTION_TEMPLATES.filter(template => 
    selectedQuestionIds.includes(template.id)
  );
  
  return selectedTemplates.map(template => ({
    id: template.id,
    factor: template.factor,
    subFactor: template.subFactor,
    question: template.questionTemplate.replace(/{organization}/g, organizationName)
  }));
}

// Get available factors for an organization (only factors with selected questions)
export function getAvailableFactors(selectedQuestionIds?: string[]): string[] {
  if (!selectedQuestionIds || selectedQuestionIds.length === 0) {
    return SURVEY_FACTORS;
  }
  
  // Find which factors have at least one selected question
  const factorsWithQuestions = new Set<string>();
  
  selectedQuestionIds.forEach(questionId => {
    const template = SURVEY_QUESTION_TEMPLATES.find(t => t.id === questionId);
    if (template) {
      factorsWithQuestions.add(template.factor);
    }
  });
  
  // Return factors in original order
  return SURVEY_FACTORS.filter(factor => factorsWithQuestions.has(factor));
}

// Enhanced function - supports custom question selection
export function getQuestionsByFactor(factor: string, organizationName?: string, selectedQuestionIds?: string[]): SurveyQuestion[] {
  const questions = generateCustomSurveyQuestions(organizationName || 'the organization', selectedQuestionIds);
  return questions.filter(q => q.factor === factor);
}

// New function to get all questions for an organization (with custom selection support)
export function getAllSurveyQuestions(organizationName?: string, selectedQuestionIds?: string[]): SurveyQuestion[] {
  return generateCustomSurveyQuestions(organizationName || 'the organization', selectedQuestionIds);
}

// Get question statistics for organization customization
export function getQuestionStats(selectedQuestionIds?: string[]) {
  const totalQuestions = SURVEY_QUESTION_TEMPLATES.length;
  const selectedCount = selectedQuestionIds?.length || totalQuestions;
  
  const factorStats: Record<string, { total: number; selected: number }> = {};
  
  SURVEY_FACTORS.forEach(factor => {
    const factorQuestions = SURVEY_QUESTION_TEMPLATES.filter(t => t.factor === factor);
    const selectedInFactor = selectedQuestionIds 
      ? factorQuestions.filter(t => selectedQuestionIds.includes(t.id)).length
      : factorQuestions.length;
    
    factorStats[factor] = {
      total: factorQuestions.length,
      selected: selectedInFactor
    };
  });
  
  return {
    totalQuestions,
    selectedCount,
    factorStats,
    selectionPercentage: Math.round((selectedCount / totalQuestions) * 100)
  };
}

// Backward compatibility - keeping the old SURVEY_QUESTIONS export
export const SURVEY_QUESTIONS: SurveyQuestion[] = SURVEY_QUESTION_TEMPLATES.map(template => ({
  id: template.id,
  factor: template.factor,
  subFactor: template.subFactor,
  question: template.questionTemplate.replace(/{organization}/g, 'the organization')
}));

// Demographic Questions Configuration
export const DEMOGRAPHIC_QUESTIONS = {
  department: {
    label: "What department do you work in?",
    type: "select" as const,
    required: true,
    options: [
      "Engineering",
      "Product",
      "Design",
      "Marketing",
      "Sales",
      "Customer Success",
      "People & Culture",
      "Finance",
      "Operations",
      "Legal",
      "Data & Analytics",
      "Other"
    ]
  },
  country: {
    label: "What country are you based in?",
    type: "select" as const,
    required: true,
    options: [
      "United States",
      "Canada",
      "United Kingdom",
      "Germany",
      "France",
      "Netherlands",
      "Switzerland",
      "Australia",
      "Singapore",
      "Japan",
      "Other"
    ]
  },
  yearsAtCompany: {
    label: "How long have you been with the company?",
    type: "select" as const,
    required: true,
    options: [
      "Less than 6 months",
      "6 months - 1 year",
      "1 - 2 years",
      "2 - 3 years",
      "3 - 5 years",
      "5+ years"
    ]
  },
  role: {
    label: "What is your role level?",
    type: "select" as const,
    required: true,
    options: [
      "Individual Contributor",
      "Senior Individual Contributor",
      "Team Lead",
      "Manager",
      "Senior Manager",
      "Director",
      "VP or above",
      "C-Level"
    ]
  },
  workLocation: {
    label: "What is your primary work location?",
    type: "select" as const,
    required: true,
    options: [
      "Fully Remote",
      "Hybrid (Office + Remote)",
      "Mostly Office-based",
      "Fully Office-based"
    ]
  }
} as const;

export type DemographicQuestionKey = keyof typeof DEMOGRAPHIC_QUESTIONS;