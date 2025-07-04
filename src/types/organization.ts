export interface DemographicQuestion {
  id: string;
  label: string;
  type: 'select' | 'text' | 'number';
  required: boolean;
  options?: string[]; // For select type
  placeholder?: string; // For text/number type
  order: number; // Display order
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  displayName: string;
  settings: {
    primaryColor?: string;
    logo?: string;
    customBranding?: boolean;
  };
  demographicQuestions?: DemographicQuestion[]; // Custom demographic questions
  selectedQuestions?: string[]; // Array of survey question IDs this organization uses (deprecated - use surveyTypes)
  questionSetVersion?: number; // Version tracking for question changes
  lastQuestionUpdate?: Date; // When questions were last modified
  // Multi-survey type support
  availableSurveyTypes?: string[]; // Array of survey type IDs this organization can use
  defaultSurveyType?: string; // Default survey type ID for new surveys
  activeSurveyTypes?: { [surveyTypeId: string]: OrganizationSurveyConfig }; // Configuration per survey type
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  createdBy: string; // UID of admin who created it
}

// Configuration for how an organization uses a specific survey type
export interface OrganizationSurveyConfig {
  surveyTypeId: string;
  selectedQuestionIds?: string[]; // Custom question selection for this survey type
  isActive: boolean;
  lastConfigured?: Date;
  customRatingScale?: unknown; // Override default rating scale
  schedule?: {
    frequency?: 'monthly' | 'quarterly' | 'annually' | 'custom';
    nextScheduled?: Date;
    lastCompleted?: Date;
  };
}

export interface OrganizationUser {
  uid: string;
  email: string;
  organizationId: string;
  role: 'admin' | 'user';
  joinedAt: Date;
}

// Default demographic questions that can be used as templates
export const DEFAULT_DEMOGRAPHIC_QUESTIONS: DemographicQuestion[] = [
  {
    id: 'department',
    label: 'What department do you work in?',
    type: 'select',
    required: true,
    options: [
      'Engineering',
      'Product',
      'Design',
      'Marketing',
      'Sales',
      'Customer Success',
      'People & Culture',
      'Finance',
      'Operations',
      'Legal',
      'Data & Analytics',
      'Other'
    ],
    order: 1
  },
  {
    id: 'country',
    label: 'What country are you based in?',
    type: 'select',
    required: true,
    options: [
      'United States',
      'Canada',
      'United Kingdom',
      'Germany',
      'France',
      'Netherlands',
      'Switzerland',
      'Australia',
      'Singapore',
      'Japan',
      'Other'
    ],
    order: 2
  },
  {
    id: 'yearsAtCompany',
    label: 'How long have you been with the company?',
    type: 'select',
    required: true,
    options: [
      'Less than 6 months',
      '6 months - 1 year',
      '1 - 2 years',
      '2 - 3 years',
      '3 - 5 years',
      '5+ years'
    ],
    order: 3
  },
  {
    id: 'role',
    label: 'What is your role level?',
    type: 'select',
    required: true,
    options: [
      'Individual Contributor',
      'Senior Individual Contributor',
      'Team Lead',
      'Manager',
      'Senior Manager',
      'Director',
      'VP or above',
      'C-Level'
    ],
    order: 4
  },
  {
    id: 'workLocation',
    label: 'What is your primary work location?',
    type: 'select',
    required: true,
    options: [
      'Fully Remote',
      'Hybrid (Office + Remote)',
      'Mostly Office-based',
      'Fully Office-based'
    ],
    order: 5
  }
];

// For backward compatibility during migration
export const DEFAULT_ORGANIZATIONS: Organization[] = [
  {
    id: 'kyan-health',
    name: 'Kyan Health',
    domain: 'kyanhealth.com',
    displayName: 'Kyan Health',
    settings: {
      primaryColor: '#3B82F6',
      customBranding: true,
    },
    demographicQuestions: DEFAULT_DEMOGRAPHIC_QUESTIONS,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    createdBy: 'system'
  }
];