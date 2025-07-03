# Database Schema Documentation

## Overview
Sonnet Survey uses Firebase Firestore as its database. The schema is designed for scalability and security with organization-based data isolation.

## Collections Structure

### organizations
Stores organization configuration and demographic questions.

**Document ID**: Custom string (e.g., 'kyan-health', 'example-org')

**Schema**:
```typescript
interface Organization {
  id: string;                           // Document ID
  name: string;                         // Internal name
  displayName: string;                  // Public display name  
  domain: string;                       // Email domain (e.g., 'kyanhealth.com')
  isActive: boolean;                    // Organization status
  settings: {
    primaryColor: string;               // Hex color for branding
    customBranding: boolean;            // Enable custom styling
  };
  demographicQuestions?: DemographicQuestion[]; // Custom demographic questions
  createdAt: Timestamp;                 // Creation timestamp
  updatedAt: Timestamp;                 // Last update timestamp
  createdBy: string;                    // Firebase UID of creator
}

interface DemographicQuestion {
  id: string;                           // Unique question ID
  label: string;                        // Question text
  type: 'select' | 'text' | 'number';   // Input type
  required: boolean;                    // Is required field
  order: number;                        // Display order
  options?: string[];                   // Options for select type
  placeholder?: string;                 // Placeholder for text/number
}
```

**Indexes**:
- `domain` (single field)
- `isActive` (single field)  
- `domain + isActive` (composite)
- `isActive + name` (composite)

**Example Document**:
```json
{
  "id": "kyan-health",
  "name": "kyan-health",
  "displayName": "Kyan Health",
  "domain": "kyanhealth.com",
  "isActive": true,
  "settings": {
    "primaryColor": "#3B82F6",
    "customBranding": true
  },
  "demographicQuestions": [
    {
      "id": "department",
      "label": "What department do you work in?",
      "type": "select",
      "required": true,
      "order": 1,
      "options": ["Engineering", "Product", "Marketing", "Sales"]
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "createdBy": "system"
}
```

### surveys
Stores individual survey responses.

**Document ID**: Auto-generated Firestore ID

**Schema**:
```typescript
interface SurveyResponse {
  id: string;                           // Document ID  
  userId: string;                       // Firebase UID of respondent
  organizationId: string;               // Organization ID
  responses: Record<string, number>;    // Question ID -> Rating (1-5)
  demographics: Record<string, string>; // Dynamic demographic responses
  submittedAt: Timestamp;               // Submission timestamp
  version: number;                      // Survey version (for future changes)
}
```

**Indexes**:
- `userId` (single field)
- `organizationId` (single field)
- `submittedAt` (single field)
- `organizationId + submittedAt` (composite)

**Example Document**:
```json
{
  "id": "abc123def456",
  "userId": "firebase-uid-123",
  "organizationId": "kyan-health", 
  "responses": {
    "happiness_1": 4,
    "happiness_2": 5,
    "leadership_1": 3
  },
  "demographics": {
    "department": "Engineering",
    "yearsAtCompany": "2-5 years",
    "workLocation": "Remote"
  },
  "submittedAt": "2024-01-15T10:30:00Z",
  "version": 1
}
```

### userSurveyStatus
Tracks user survey completion status to prevent duplicate submissions.

**Document ID**: Firebase UID

**Schema**:
```typescript
interface UserSurveyStatus {
  userId: string;                       // Firebase UID (document ID)
  hasCompleted: boolean;                // Completion status
  completedAt?: Timestamp;              // Completion timestamp
  organizationId: string;               // User's organization
  lastAttemptAt: Timestamp;             // Last access timestamp
}
```

**Indexes**:
- `organizationId` (single field)
- `hasCompleted` (single field)

**Example Document**:
```json
{
  "userId": "firebase-uid-123",
  "hasCompleted": true,
  "completedAt": "2024-01-15T10:30:00Z",
  "organizationId": "kyan-health",
  "lastAttemptAt": "2024-01-15T10:30:00Z"
}
```

## Security Rules

### Read Permissions
- **organizations**: Public read (needed for domain validation)
- **surveys**: Admin only
- **userSurveyStatus**: User can read own, admin can read all

### Write Permissions  
- **organizations**: Admin only
- **surveys**: User can create own response only
- **userSurveyStatus**: User can write own, admin can read all

### Validation Rules
- Survey responses must match authenticated user ID
- Demographics must match organization's question structure
- Organizations require valid domain format
- Ratings must be between 1-5

## Data Relationships

```
Organization (1) -> (Many) SurveyResponse
Organization (1) -> (Many) UserSurveyStatus  
User (1) -> (1) UserSurveyStatus
User (1) -> (0-1) SurveyResponse per organization
```

## Query Patterns

### Common Queries
```typescript
// Get organization by domain
organizations.where('domain', '==', 'kyanhealth.com').where('isActive', '==', true)

// Get all responses for organization  
surveys.where('organizationId', '==', 'kyan-health')

// Check user completion status
userSurveyStatus.doc(userId)

// Get recent responses
surveys.where('organizationId', '==', 'kyan-health').orderBy('submittedAt', 'desc').limit(100)
```

### Analytics Queries
```typescript
// Responses by department
surveys.where('organizationId', '==', 'kyan-health')
  .where('demographics.department', '==', 'Engineering')

// Responses in date range
surveys.where('organizationId', '==', 'kyan-health')
  .where('submittedAt', '>=', startDate)
  .where('submittedAt', '<=', endDate)
```

## Migration Considerations

### Schema Evolution
- Survey version field allows for question changes
- Demographic questions are organization-specific and flexible
- Old responses preserved even if questions change

### Data Retention
- Survey responses: Indefinite (for trend analysis)
- User status: Updated on each access
- Organizations: Managed by admins

## Performance Optimization

### Best Practices
- Use composite indexes for complex queries
- Paginate large result sets
- Cache organization data in application
- Aggregate analytics data for dashboards