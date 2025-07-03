export interface SurveyQuestion {
  id: string;
  factor: string;
  subFactor?: string;
  question: string;
}

export interface SurveyResponse {
  questionId: string;
  rating: number; // 1-5 scale
}

export interface DemographicResponse {
  department: string;
  country: string;
  yearsAtCompany: string;
  role: string;
  workLocation: string;
}

export interface CompletedSurvey {
  userId: string;
  userEmail: string;
  responses: SurveyResponse[];
  demographics: DemographicResponse;
  completedAt: Date;
  sessionId: string;
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // Happiness
  {
    id: "happiness_1",
    factor: "Happiness",
    question: "I often experience positive emotions when I am working (e.g., happiness, enthusiasm, enjoyment)."
  },
  {
    id: "happiness_2",
    factor: "Happiness",
    question: "I am passionate about the work I do."
  },
  {
    id: "happiness_3",
    factor: "Happiness",
    question: "On most days, time goes by quickly when I'm working."
  },
  {
    id: "happiness_4",
    factor: "Happiness",
    question: "I feel a strong sense of belonging to On."
  },
  {
    id: "happiness_5",
    factor: "Happiness",
    question: "I would recommend On as a great place to work."
  },

  // On's Senior Leadership
  {
    id: "leadership_1",
    factor: "On's Senior Leadership",
    question: "I have confidence in On's Senior Leadership."
  },
  {
    id: "leadership_2",
    factor: "On's Senior Leadership",
    question: "On's Senior Leadership has communicated a vision that motivates me."
  },
  {
    id: "leadership_3",
    factor: "On's Senior Leadership",
    question: "On's Senior Leadership demonstrates that people are important to the company's success."
  },

  // Mission & Purpose
  {
    id: "mission_1",
    factor: "Mission & Purpose",
    question: "I understand On's Mission."
  },
  {
    id: "mission_2",
    factor: "Mission & Purpose",
    question: "On's Mission aligns well with my own purpose and values."
  },
  {
    id: "mission_3",
    factor: "Mission & Purpose",
    question: "I know how my work contributes to the goals of On."
  },
  {
    id: "mission_4",
    factor: "Mission & Purpose",
    question: "On is in a position to succeed over the next 3 years."
  },
  {
    id: "mission_5",
    factor: "Mission & Purpose",
    question: "On's commitment to social responsibility is genuine (e.g. sustainability, social impact etc.)."
  },
  {
    id: "mission_6",
    factor: "Mission & Purpose",
    question: "On's social impact program Right To Run really allows us to make a positive difference."
  },

  // Wellbeing & Switching Off
  {
    id: "wellbeing_1",
    factor: "Wellbeing & Switching Off",
    question: "We are genuinely supported with flexibility in the way we work (hours, time off)."
  },
  {
    id: "wellbeing_2",
    factor: "Wellbeing & Switching Off",
    question: "I believe our team's wellbeing is a priority at On."
  },
  {
    id: "wellbeing_3",
    factor: "Wellbeing & Switching Off",
    question: "The norms on my team are supportive of my personal or family responsibilities."
  },
  {
    id: "wellbeing_4",
    factor: "Wellbeing & Switching Off",
    question: "I am able to effectively switch off from work to make time for other areas in my life."
  },
  {
    id: "wellbeing_manager_1",
    factor: "Wellbeing & Switching Off",
    subFactor: "Direct Manager Effectiveness",
    question: "My manager is checking in regularly enough with how I am doing (not just work related)."
  },
  {
    id: "wellbeing_manager_2",
    factor: "Wellbeing & Switching Off",
    subFactor: "Direct Manager Effectiveness",
    question: "My manager is setting a good example for our wellbeing."
  },

  // Growth
  {
    id: "growth_1",
    factor: "Growth",
    question: "On is a great company for me to make a contribution to my development."
  },
  {
    id: "growth_2",
    factor: "Growth",
    question: "I believe there are good personal growth opportunities for me at On."
  },
  {
    id: "growth_3",
    factor: "Growth",
    question: "My performance is evaluated fairly."
  },
  {
    id: "growth_4",
    factor: "Growth",
    question: "On is a great company for me to develop my leadership skills."
  },
  {
    id: "growth_5",
    factor: "Growth",
    question: "I know what I need to do to be successful in my role."
  },
  {
    id: "growth_manager_1",
    factor: "Growth",
    subFactor: "Direct Manager Effectiveness",
    question: "My manager actively supports my personal growth & development."
  },

  // Diversity & Inclusion
  {
    id: "diversity_1",
    factor: "Diversity & Inclusion",
    question: "Decisions that affect me are made in a fair and unbiased manner."
  },
  {
    id: "diversity_2",
    factor: "Diversity & Inclusion",
    question: "I can be my authentic self at work."
  },
  {
    id: "diversity_3",
    factor: "Diversity & Inclusion",
    question: "I feel I am part of a team."
  },
  {
    id: "diversity_4",
    factor: "Diversity & Inclusion",
    question: "On values diversity."
  },
  {
    id: "diversity_5",
    factor: "Diversity & Inclusion",
    question: "On builds teams that are diverse."
  },
  {
    id: "diversity_6",
    factor: "Diversity & Inclusion",
    question: "People from all backgrounds have equal opportunities to succeed at On."
  },
  {
    id: "diversity_7",
    factor: "Diversity & Inclusion",
    question: "I am confident on how I can contribute in building a more inclusive culture in my team."
  },
  {
    id: "diversity_manager_1",
    factor: "Diversity & Inclusion",
    subFactor: "Direct Manager Effectiveness",
    question: "My manager promotes an inclusive team environment."
  },

  // Entrepreneurship
  {
    id: "entrepreneurship_1",
    factor: "Entrepreneurship",
    question: "I am able to use my personal initiative or judgment in carrying out my work."
  },
  {
    id: "entrepreneurship_2",
    factor: "Entrepreneurship",
    question: "We are encouraged to be innovative even though some of our initiatives may not succeed."
  },
  {
    id: "entrepreneurship_3",
    factor: "Entrepreneurship",
    question: "We have the space to explore creative solutions and take thoughtful risks in our day-to-day work."
  },
  {
    id: "entrepreneurship_4",
    factor: "Entrepreneurship",
    question: "We have enough autonomy to perform our jobs effectively."
  },

  // Psychological Safety
  {
    id: "psych_safety_manager_1",
    factor: "Psychological Safety",
    subFactor: "Direct Manager Effectiveness",
    question: "My manager is a great role model for our team."
  },
  {
    id: "psych_safety_1",
    factor: "Psychological Safety",
    question: "At On there is open and honest two-way communication."
  },
  {
    id: "psych_safety_2",
    factor: "Psychological Safety",
    question: "I can voice a contrary opinion without fear of negative consequences."
  },
  {
    id: "psych_safety_3",
    factor: "Psychological Safety",
    question: "When I share my opinion, it is valued."
  },
  {
    id: "psych_safety_4",
    factor: "Psychological Safety",
    question: "At On, failure is seen as an opportunity for learning and growth."
  },
  {
    id: "psych_safety_manager_2",
    factor: "Psychological Safety",
    subFactor: "Direct Manager Effectiveness",
    question: "People are comfortable speaking up when our manager is present."
  },

  // Team Communication & Collaboration
  {
    id: "team_comm_1",
    factor: "Team Communication & Collaboration",
    question: "I have access to the information I need to do my job effectively."
  },
  {
    id: "team_comm_2",
    factor: "Team Communication & Collaboration",
    question: "Other functions at On collaborate well with our team to get the job done."
  },
  {
    id: "team_comm_3",
    factor: "Team Communication & Collaboration",
    question: "Most of the systems and processes here support us getting our work done effectively."
  },
  {
    id: "team_comm_4",
    factor: "Team Communication & Collaboration",
    question: "Generally, teams at On work towards common goals."
  },
  {
    id: "team_comm_5",
    factor: "Team Communication & Collaboration",
    question: "The way decisions are taken at On supports us getting our work done effectively."
  },
  {
    id: "team_comm_6",
    factor: "Team Communication & Collaboration",
    question: "My work is efficiently aligned with other team members."
  },
  {
    id: "team_comm_7",
    factor: "Team Communication & Collaboration",
    question: "Where required, we have clearly defined ownership for company priorities, goals and initiatives at On."
  },
  {
    id: "team_comm_8",
    factor: "Team Communication & Collaboration",
    question: "I am appropriately involved in decisions that affect my work."
  },

  // Reward & Recognition
  {
    id: "reward_1",
    factor: "Reward & Recognition",
    question: "I am fairly compensated for the work I do."
  },
  {
    id: "reward_2",
    factor: "Reward & Recognition",
    question: "I receive appropriate recognition for good work at On."
  },
  {
    id: "reward_3",
    factor: "Reward & Recognition",
    question: "I feel empowered to appropriately reward and recognize my team."
  },
  {
    id: "reward_4",
    factor: "Reward & Recognition",
    question: "Generally, the right people are recognized at On."
  },

  // Psychological Safety (Feedback)
  {
    id: "psych_feedback_1",
    factor: "Psychological Safety (Feedback)",
    question: "On takes action on team's feedback."
  },
  {
    id: "psych_feedback_2",
    factor: "Psychological Safety (Feedback)",
    question: "Our culture encourages giving candid, honest feedback even when it may be difficult."
  },
  {
    id: "psych_feedback_3",
    factor: "Psychological Safety (Feedback)",
    question: "We (team members) regularly give each other candid feedback."
  },
  {
    id: "psych_feedback_manager_1",
    factor: "Psychological Safety (Feedback)",
    subFactor: "Direct Manager Effectiveness",
    question: "My manager gives me useful feedback on how I am performing."
  },

  // Individual Focus & Productivity
  {
    id: "productivity_manager_1",
    factor: "Individual Focus & Productivity",
    subFactor: "Direct Manager Effectiveness",
    question: "My manager keeps me informed about my team's future direction and goals."
  },
  {
    id: "productivity_manager_2",
    factor: "Individual Focus & Productivity",
    subFactor: "Direct Manager Effectiveness",
    question: "My manager provides me with the information I need to do my job effectively."
  },
  {
    id: "productivity_1",
    factor: "Individual Focus & Productivity",
    question: "When it is clear that someone is not delivering in their role, we do something about it."
  },
  {
    id: "productivity_2",
    factor: "Individual Focus & Productivity",
    question: "I feel equipped to effectively prioritize my workload."
  },
  {
    id: "productivity_3",
    factor: "Individual Focus & Productivity",
    question: "Generally, I believe my workload is reasonable for my role."
  },

  // Compliance
  {
    id: "compliance_1",
    factor: "Compliance",
    question: "I am aware of and understand On's Code of Conduct and other compliance guidelines."
  },
  {
    id: "compliance_2",
    factor: "Compliance",
    question: "I believe On's Code of Conduct and other compliance guidelines help team members act in accordance with On's values."
  },

  // Retention
  {
    id: "retention_1",
    factor: "Retention",
    question: "I rarely think about looking for a job at another company."
  },
  {
    id: "retention_2",
    factor: "Retention",
    question: "I plan to be working at On a year from now."
  },
  {
    id: "retention_3",
    factor: "Retention",
    question: "If I were offered a similar job at another company, I would stay at On."
  },

  // Excellence
  {
    id: "excellence_1",
    factor: "Excellence",
    question: "Day-to-day decisions here demonstrate that quality and improvement are top priorities."
  },
  {
    id: "excellence_2",
    factor: "Excellence",
    question: "On strives for excellence in all aspects of its operations."
  },
  {
    id: "excellence_3",
    factor: "Excellence",
    question: "At On, we are striking a good balance between continuous improvement and launching new projects."
  }
];

export const SURVEY_FACTORS = [
  "Happiness",
  "On's Senior Leadership",
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

export function getQuestionsByFactor(factor: string): SurveyQuestion[] {
  return SURVEY_QUESTIONS.filter(q => q.factor === factor);
}

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