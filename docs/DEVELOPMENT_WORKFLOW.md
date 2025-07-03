# Development Workflow Documentation

## Overview
This document outlines the development standards, practices, and workflows for the Sonnet Survey project.

## Code Style Guidelines

### TypeScript Standards

#### Type Definitions
```typescript
// Always use explicit types for function parameters and returns
function processData(input: string): Promise<ProcessedData> {
  return processAsync(input);
}

// Use interfaces for object shapes
interface UserData {
  id: string;
  email: string;
  isActive: boolean;
}

// Use union types for constrained values
type SurveyStep = 'demographics' | 'survey' | 'complete';

// Use Record for dynamic key-value pairs
type DemographicResponses = Record<string, string>;
```

#### Component Props
```typescript
// Always define prop interfaces
interface ComponentProps {
  // Required props first
  title: string;
  onSubmit: (data: FormData) => void;
  
  // Optional props with default values documented
  isLoading?: boolean; // Default: false
  variant?: 'primary' | 'secondary'; // Default: 'primary'
  
  // Children and className for extensibility
  children?: React.ReactNode;
  className?: string;
}

// Use React.FC with proper typing
const Component: React.FC<ComponentProps> = ({
  title,
  onSubmit,
  isLoading = false,
  variant = 'primary',
  children,
  className
}) => {
  // Component implementation
};
```

### React Patterns

#### State Management
```typescript
// Use useState for component state
const [formData, setFormData] = useState<FormData>({
  field1: '',
  field2: 0
});

// Use useReducer for complex state logic
interface State {
  loading: boolean;
  error: string | null;
  data: any[];
}

type Action = 
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: any[] }
  | { type: 'ERROR'; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { loading: false, error: null, data: action.payload };
    case 'ERROR':
      return { loading: false, error: action.payload, data: [] };
    default:
      return state;
  }
};
```

#### Effect Patterns
```typescript
// Cleanup pattern for subscriptions
useEffect(() => {
  const unsubscribe = subscribeToData((data) => {
    setData(data);
  });

  return () => {
    unsubscribe();
  };
}, []);

// Dependency array best practices
useEffect(() => {
  // Include all dependencies
  fetchData(userId, organizationId);
}, [userId, organizationId]);

// Use useCallback for stable references
const handleSubmit = useCallback(async (data: FormData) => {
  setLoading(true);
  try {
    await submitData(data);
    onSuccess?.();
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
}, [onSuccess]); // Include callback dependencies
```

### Error Handling Standards

#### API Error Handling
```typescript
// Consistent error handling utility
class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Wrapper for API calls
async function apiCall<T>(
  operation: () => Promise<T>,
  errorContext: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorContext}:`, error);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    throw new APIError(
      `Failed to ${errorContext.toLowerCase()}`,
      500,
      'UNKNOWN_ERROR'
    );
  }
}

// Usage in components
const handleAction = async () => {
  try {
    await apiCall(
      () => updateOrganization(orgId, data),
      'Update organization'
    );
    setSuccess(true);
  } catch (error) {
    setError(error.message);
  }
};
```

#### Form Validation
```typescript
// Validation schema pattern
interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

interface ValidationSchema<T> {
  [K in keyof T]?: ValidationRule<T[K]>[];
}

// Usage
const validationSchema: ValidationSchema<FormData> = {
  email: [
    {
      validate: (value) => !!value,
      message: 'Email is required'
    },
    {
      validate: (value) => /\S+@\S+\.\S+/.test(value),
      message: 'Invalid email format'
    }
  ],
  name: [
    {
      validate: (value) => value.length >= 2,
      message: 'Name must be at least 2 characters'
    }
  ]
};

const validateForm = (data: FormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.entries(validationSchema).forEach(([field, rules]) => {
    const value = data[field as keyof FormData];
    const failedRule = rules?.find(rule => !rule.validate(value));
    
    if (failedRule) {
      errors[field] = failedRule.message;
    }
  });
  
  return errors;
};
```

## Testing Strategy

### Unit Testing
```typescript
// Test utilities
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { AuthContext } from '../contexts/AuthContext';

// Component test wrapper
const renderWithProviders = (
  component: React.ReactElement,
  { user = null, organization = null } = {}
) => {
  const mockAuthValue = {
    user,
    loading: false,
    login: jest.fn(),
    logout: jest.fn()
  };

  return render(
    <AuthContext.Provider value={mockAuthValue}>
      <OrganizationContext.Provider value={{ currentOrganization: organization }}>
        {component}
      </OrganizationContext.Provider>
    </AuthContext.Provider>
  );
};

// Example component test
describe('DemographicForm', () => {
  const mockQuestions = [
    {
      id: 'dept',
      label: 'Department',
      type: 'select' as const,
      required: true,
      order: 1,
      options: ['Engineering', 'Product']
    }
  ];

  it('renders questions correctly', () => {
    const onComplete = jest.fn();
    
    renderWithProviders(
      <DemographicForm questions={mockQuestions} onComplete={onComplete} />
    );
    
    expect(screen.getByLabelText('Department')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const onComplete = jest.fn();
    
    renderWithProviders(
      <DemographicForm questions={mockQuestions} onComplete={onComplete} />
    );
    
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'Engineering' }
    });
    
    fireEvent.click(screen.getByText('Continue'));
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({ dept: 'Engineering' });
    });
  });
});
```

### Integration Testing
```typescript
// API integration tests
describe('Survey Submission', () => {
  it('submits survey with demographics', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@kyanhealth.com' };
    
    renderWithProviders(<SurveyPage />, { user: mockUser });
    
    // Fill demographics
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'Engineering' }
    });
    
    fireEvent.click(screen.getByText('Continue'));
    
    // Fill survey questions
    const ratingButtons = screen.getAllByRole('button', { name: /rate/i });
    fireEvent.click(ratingButtons[0]); // Rate first question
    
    // Submit
    fireEvent.click(screen.getByText('Submit Survey'));
    
    await waitFor(() => {
      expect(screen.getByText('Thank you')).toBeInTheDocument();
    });
  });
});
```

### End-to-End Testing
```typescript
// Cypress E2E tests
describe('Survey Flow', () => {
  beforeEach(() => {
    // Mock authentication
    cy.mockAuth('test@kyanhealth.com');
    cy.visit('/survey');
  });

  it('completes full survey flow', () => {
    // Demographics step
    cy.get('[data-testid="demographic-form"]').should('be.visible');
    cy.get('select[name="department"]').select('Engineering');
    cy.get('button[type="submit"]').click();

    // Survey questions
    cy.get('[data-testid="survey-form"]').should('be.visible');
    cy.get('[data-testid="rating-5"]').first().click();
    cy.get('button[data-testid="next-factor"]').click();

    // Complete survey
    cy.get('button[data-testid="submit-survey"]').click();
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

## Git Workflow

### Branch Naming
```
feature/add-custom-demographics
bugfix/fix-modal-rendering
hotfix/security-patch
chore/update-dependencies
docs/api-documentation
```

### Commit Message Format
```
type(scope): short description

Longer description if needed explaining what and why.

- List specific changes
- Include breaking changes
- Reference issues: Fixes #123

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Pre-commit Checklist
- [ ] TypeScript compilation passes (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] No console.log statements in production code
- [ ] Documentation updated if needed
- [ ] Environment variables documented

### Code Review Guidelines

#### Review Checklist
- [ ] Code follows established patterns
- [ ] Type safety maintained
- [ ] Error handling implemented
- [ ] Performance considerations addressed
- [ ] Security implications reviewed
- [ ] Tests included for new functionality
- [ ] Documentation updated

#### Review Comments Format
```
// Suggestion: Extract this logic into a custom hook
// Issue: Missing error handling for API call
// Nitpick: Consider using more descriptive variable name
// Question: Should this be memoized for performance?
```

## Development Environment

### Required Tools
- Node.js 18+
- npm/yarn
- VS Code (recommended)
- Firebase CLI
- Git

### VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "firebase.vscode-firebase-explorer"
  ]
}
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "cypress run",
    "firebase:emulators": "firebase emulators:start",
    "deploy": "npm run build && firebase deploy"
  }
}
```

## Performance Guidelines

### Code Splitting
```typescript
// Lazy load heavy components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### Memoization
```typescript
// Memoize expensive computations
const analyticsData = useMemo(() => {
  return processAnalytics(surveyResponses);
}, [surveyResponses]);

// Memoize components that receive complex props
const SurveyQuestion = React.memo(({ question, response, onChange }) => {
  return (
    <div>
      {/* Question UI */}
    </div>
  );
});
```

### Bundle Optimization
```typescript
// Tree-shake imports
import { specific } from 'library/specific';

// Avoid importing entire libraries
// ❌ import * as _ from 'lodash';
// ✅ import { debounce } from 'lodash/debounce';
```

## Security Considerations

### Input Validation
```typescript
// Always validate and sanitize user input
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Validate on both client and server
const validateSurveyResponse = (response: any): SurveyResponse => {
  if (!response.userId || typeof response.userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  
  // Additional validation...
  return response as SurveyResponse;
};
```

### Environment Variables
```typescript
// Never commit secrets
// Use environment variables for sensitive data
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ...
};

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```