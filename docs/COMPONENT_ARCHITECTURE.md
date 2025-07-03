# Component Architecture Documentation

## Overview
The Sonnet Survey application follows a modern React architecture with Next.js App Router, TypeScript, and component-based design patterns.

## Component Hierarchy

```
App (layout.tsx)
├── AuthProvider (contexts/AuthContext.tsx)
├── OrganizationProvider (contexts/OrganizationContext.tsx)
└── Page Components
    ├── Home (app/page.tsx)
    ├── Survey (app/survey/page.tsx)
    └── Admin Dashboard (app/admin/*)
        ├── Admin Home (app/admin/page.tsx)
        ├── Users Management (app/admin/users/page.tsx)
        └── Organizations Management (app/admin/organizations/page.tsx)
```

## Core Components

### 1. Authentication Components

#### LoginButton
**Location**: `src/components/LoginButton.tsx`
**Purpose**: Handles Google OAuth login flow

```typescript
interface LoginButtonProps {
  className?: string;
}

// Usage
<LoginButton className="custom-styles" />
```

**State Management**: None (stateless)
**Dependencies**: Firebase Auth, AuthContext

#### AuthContext Provider
**Location**: `src/contexts/AuthContext.tsx`
**Purpose**: Global authentication state management

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

// Usage
const { user, loading, login, logout } = useAuth();
```

**State**: 
- `user`: Current Firebase user object
- `loading`: Authentication loading state

### 2. Organization Components

#### OrganizationSelector
**Location**: `src/components/OrganizationSelector.tsx`
**Purpose**: Displays current organization and handles organization detection

```typescript
interface OrganizationSelectorProps {
  onOrganizationChange?: (org: Organization | null) => void;
}

// Usage
<OrganizationSelector onOrganizationChange={handleOrgChange} />
```

**State Management**: 
- Internal state for organization loading
- Uses OrganizationContext for global organization state

#### OrganizationContext Provider
**Location**: `src/contexts/OrganizationContext.tsx` 
**Purpose**: Global organization state and user organization detection

```typescript
interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  refreshOrganizations: () => Promise<void>;
}

// Usage
const { currentOrganization, organizations } = useOrganization();
```

### 3. Survey Components

#### DemographicForm
**Location**: `src/components/DemographicForm.tsx`
**Purpose**: Dynamic demographic questionnaire based on organization configuration

```typescript
interface DemographicFormProps {
  questions: DemographicQuestion[];
  onComplete: (demographics: DynamicDemographicResponse) => void;
  onBack?: () => void;
}

type DynamicDemographicResponse = Record<string, string>;

// Usage
<DemographicForm 
  questions={organization.demographicQuestions || DEFAULT_QUESTIONS}
  onComplete={handleDemographicsComplete}
/>
```

**Features**:
- Dynamic form generation based on question configuration
- Support for select, text, and number input types
- Form validation and error handling
- Responsive design

**State Management**:
- `responses`: Current form responses
- `errors`: Validation error state

#### Survey Page
**Location**: `src/app/survey/page.tsx`
**Purpose**: Main survey flow coordinator

**State Management**:
- `currentStep`: 'demographics' | 'survey'
- `currentFactor`: Current factor index (0-14)
- `responses`: Survey question responses
- `demographics`: Demographic form responses
- `isSubmitting`: Submission loading state

**Flow**:
1. Check completion status
2. Collect demographics
3. Present survey questions by factor
4. Submit combined data

### 4. Admin Components

#### DemographicManagementModal
**Location**: `src/components/DemographicManagementModal.tsx`
**Purpose**: CRUD interface for organization demographic questions

```typescript
interface DemographicManagementModalProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrganization: Organization) => void;
}

// Usage
<DemographicManagementModal
  organization={selectedOrg}
  isOpen={showModal}
  onClose={closeModal}
  onSave={handleSave}
/>
```

**Features**:
- Add/edit/delete demographic questions
- Support for multiple question types
- Question ordering and validation
- Load default questions
- Form state management

**State Management**:
- `demographicQuestions`: Current question list
- `showAddForm`: Form visibility state
- `editingQuestion`: Currently editing question
- `formData`: Form input state

## State Management Patterns

### 1. Context Providers
- **AuthContext**: Global authentication state
- **OrganizationContext**: Global organization data
- Located in `src/contexts/`

### 2. Component State
- **useState**: Local component state for forms and UI
- **useEffect**: Side effects for data fetching and cleanup

### 3. Data Flow
```
User Action -> Component State Update -> Context Update -> API Call -> Database Update
```

## Component Communication Patterns

### 1. Props Down, Events Up
```typescript
// Parent passes data down via props
<ChildComponent data={parentData} onEvent={handleEvent} />

// Child emits events up via callbacks
const handleSubmit = () => {
  onEvent(formData);
}
```

### 2. Context for Global State
```typescript
// Provider at app level
<AuthProvider>
  <OrganizationProvider>
    <App />
  </OrganizationProvider>
</AuthProvider>

// Consumers anywhere in tree
const { user } = useAuth();
const { currentOrganization } = useOrganization();
```

### 3. Custom Hooks for Logic
```typescript
// Custom hooks for reusable logic
const useAdminCheck = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check admin status
  }, [user]);
  
  return isAdmin;
};
```

## Error Handling Patterns

### 1. Error Boundaries
```typescript
// Wrap sensitive components
<ErrorBoundary fallback={<ErrorFallback />}>
  <SurveyForm />
</ErrorBoundary>
```

### 2. Form Validation
```typescript
// Field-level validation
const validateForm = () => {
  const errors: Record<string, string> = {};
  
  if (!formData.field) {
    errors.field = 'Required field';
  }
  
  return errors;
};
```

### 3. API Error Handling
```typescript
// Consistent error handling
try {
  await apiCall();
} catch (error) {
  console.error('Operation failed:', error);
  setError(error.message);
}
```

## Component Best Practices

### 1. TypeScript Props
```typescript
// Always define prop interfaces
interface ComponentProps {
  required: string;
  optional?: number;
  callback: (data: any) => void;
}

const Component: React.FC<ComponentProps> = ({ required, optional, callback }) => {
  // Component implementation
};
```

### 2. Conditional Rendering
```typescript
// Use explicit conditional rendering
{isLoading ? (
  <LoadingSpinner />
) : hasError ? (
  <ErrorMessage error={error} />
) : (
  <MainContent data={data} />
)}
```

### 3. Event Handling
```typescript
// Use useCallback for event handlers
const handleSubmit = useCallback(async (data: FormData) => {
  setLoading(true);
  try {
    await submitData(data);
    onSuccess();
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}, [onSuccess]);
```

## Performance Considerations

### 1. Memoization
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => 
  computeExpensiveValue(data), [data]
);

// Memoize components with React.memo
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexRender data={data} />;
});
```

### 2. Code Splitting
```typescript
// Lazy load heavy components
const AdminDashboard = lazy(() => import('./AdminDashboard'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <AdminDashboard />
</Suspense>
```

### 3. State Updates
```typescript
// Batch state updates when possible
const updateMultipleStates = useCallback(() => {
  setLoading(true);
  setError(null);
  setData(newData);
}, [newData]);
```