# Anonymous Survey Links System

## Overview

The Anonymous Survey Links system allows organizations to create shareable links that enable employees to take surveys without logging into the system. This feature maintains complete anonymity while still associating survey responses with the correct organization for analytics purposes.

## Features

### Core Functionality
- **Token-based anonymous access** - Each link contains a unique token for security
- **Organization-specific filtering** - Only shows survey types available to the organization
- **Response tracking** - Tracks current response count and optional limits
- **Expiration management** - Links can have optional expiration dates
- **Demographic collection** - Can optionally collect demographic information
- **Mobile-responsive interface** - Works seamlessly on all devices

### Security Features
- **Unique token generation** - Each link uses a UUID-based token
- **Link validation** - Tokens are validated before allowing survey access
- **Anonymous user IDs** - Generates unique anonymous identifiers for responses
- **Organization association** - Responses are properly associated with the organization

## Architecture

### Database Schema

#### SurveyLink Interface
```typescript
interface SurveyLink {
  id: string;
  organizationId: string;
  surveyTypeId: string;
  name: string;
  description?: string;
  token: string;
  isActive: boolean;
  expiresAt?: Date;
  maxResponses?: number;
  currentResponses: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  allowMultipleResponses?: boolean;
  requireDemographics?: boolean;
  customDemographicQuestions?: string[];
}
```

### Service Layer

#### SurveyLinkService (`/src/lib/surveyLinkService.ts`)

**Core Functions:**
- `createSurveyLink()` - Creates a new anonymous survey link
- `getSurveyLinks()` - Retrieves all links for an organization
- `getSurveyLinkByToken()` - Validates and retrieves a link by token
- `updateSurveyLink()` - Updates link properties
- `deleteSurveyLink()` - Removes a survey link
- `validateSurveyLink()` - Validates token and checks availability
- `incrementSurveyLinkResponse()` - Tracks response count

**Example Usage:**
```typescript
// Create a new survey link
const link = await createSurveyLink(
  'org-123',
  'survey-type-456',
  'Q1 2024 Engagement Survey',
  'admin-user-id',
  {
    description: 'Quarterly engagement survey',
    expiresAt: new Date('2024-12-31'),
    maxResponses: 100,
    requireDemographics: true
  }
);

// Validate a survey link
const validation = await validateSurveyLink('token-abc123');
if (validation.isValid) {
  // Allow survey access
}
```

### User Interface Components

#### SurveyLinkManager (`/src/components/SurveyLinkManager.tsx`)

**Features:**
- Create new survey links with full configuration
- Edit existing links
- Toggle link active/inactive status
- Delete links
- Copy survey URLs to clipboard
- View link statistics and status

**Configuration Options:**
- Link name and description
- Survey type selection (filtered by organization)
- Expiration date
- Maximum response limit
- Multiple response settings
- Demographic requirements

#### Anonymous Survey Page (`/src/app/survey/anonymous/page.tsx`)

**Flow:**
1. **Token Validation** - Validates the survey link token
2. **Organization Loading** - Loads organization and survey type data
3. **Demographics Collection** - Optional demographic questions
4. **Survey Questions** - Displays survey questions with rating scales
5. **Response Submission** - Submits anonymous responses
6. **Completion Confirmation** - Shows thank you message

**URL Format:**
```
https://yoursite.com/survey/anonymous?token=fc5960659ffc4421
```

## Implementation Guide

### 1. Creating Survey Links

**Admin Interface:**
1. Go to **Admin Dashboard** → **Organizations**
2. Click **Survey Links** button for the desired organization
3. Click **Create New Survey Link**
4. Fill in the required information:
   - **Link Name**: Human-readable identifier
   - **Survey Type**: Select from available survey types
   - **Expiration Date**: (Optional) When the link expires
   - **Max Responses**: (Optional) Maximum number of responses
   - **Demographics**: Whether to collect demographic information

**Code Example:**
```typescript
// In your admin component
const handleCreateLink = async () => {
  const newLink = await createSurveyLink(
    organizationId,
    surveyTypeId,
    linkName,
    currentUserId,
    {
      description: linkDescription,
      expiresAt: expirationDate,
      maxResponses: maxResponseCount,
      requireDemographics: true
    }
  );
  
  // Link is now available at:
  // https://yoursite.com/survey/anonymous?token=${newLink.token}
};
```

### 2. Survey Link Management

**Viewing Links:**
- All links for an organization are displayed in the Survey Links modal
- Shows current status, response count, and expiration information
- Provides copy-to-clipboard functionality for easy sharing

**Link Status:**
- **Active**: Link is available and accepting responses
- **Inactive**: Link is disabled
- **Expired**: Link has passed its expiration date
- **Full**: Link has reached its maximum response limit

**Actions Available:**
- Edit link settings
- Toggle active/inactive status
- Delete link
- Copy link URL

### 3. Taking Anonymous Surveys

**User Experience:**
1. **Access**: User clicks on the shared survey link
2. **Validation**: System validates the token and checks availability
3. **Demographics**: (If enabled) User fills out demographic questions
4. **Survey**: User completes the survey questions
5. **Submission**: Response is submitted anonymously
6. **Confirmation**: User sees a thank you message

**Error Handling:**
- Invalid or expired tokens show user-friendly error messages
- Inactive links display appropriate status information
- Full links (max responses reached) show completion message

## Security Considerations

### Token Generation
- Uses UUID v4 for cryptographically secure token generation
- Tokens are 16 characters long (UUID with hyphens removed)
- Each token is unique and unpredictable

### Anonymous User Handling
```typescript
// Anonymous user ID generation
const anonymousUserId = `anonymous_${uuidv4()}`;
const anonymousEmail = `anonymous_${uuidv4()}@anonymous.survey`;

// Survey submission with anonymous data
await submitSurvey(
  anonymousUserId,
  anonymousEmail,
  responses,
  demographics,
  organizationId,
  organizationName,
  surveyTypeId
);
```

### Data Privacy
- No personal information is collected or stored
- Anonymous user IDs are generated per response
- Responses are associated with organization but not individual users
- IP addresses and browser information are not tracked

## Database Configuration

### Firestore Security Rules
```javascript
// Survey links collection
match /surveyLinks/{linkId} {
  // Admins can read, create, update, and delete survey links
  allow read, write: if isAdmin();
  
  // Allow anonymous access to validate tokens
  allow read: if true;
}
```

### Required Indexes
```json
{
  "collectionGroup": "surveyLinks",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "organizationId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

## Analytics Integration

### Response Tracking
- Anonymous responses are included in organization analytics
- Responses are tagged with `isAnonymous: true` flag
- Analytics maintain organization-level insights without user identification

### Data Structure
```typescript
// Anonymous survey response
{
  userId: "anonymous_uuid",
  userEmail: "anonymous_uuid@anonymous.survey",
  organizationId: "org-123",
  organizationName: "Company Name",
  surveyTypeId: "survey-type-456",
  responses: [...],
  demographics: {...},
  isAnonymous: true,
  completedAt: new Date()
}
```

## Error Handling

### Common Error Scenarios

**Invalid Token:**
```typescript
{
  isValid: false,
  error: "Survey link not found or has expired"
}
```

**Link Expired:**
```typescript
{
  isValid: false,
  error: "Survey link has expired"
}
```

**Maximum Responses Reached:**
```typescript
{
  isValid: false,
  error: "Survey link has reached maximum responses"
}
```

### User-Friendly Error Messages
- Clear, non-technical language
- Actionable information when possible
- Consistent styling with the rest of the application

## Testing

### Manual Testing Checklist
- [ ] Create survey link successfully
- [ ] Copy link URL to clipboard
- [ ] Access survey via anonymous link
- [ ] Complete survey with demographics
- [ ] Complete survey without demographics
- [ ] Test link expiration
- [ ] Test maximum response limit
- [ ] Test inactive link handling
- [ ] Verify responses appear in analytics
- [ ] Test mobile responsiveness

### Automated Testing
```typescript
// Example test case
describe('Anonymous Survey Links', () => {
  it('should create valid survey link', async () => {
    const link = await createSurveyLink(
      'org-123',
      'survey-type-456',
      'Test Survey',
      'admin-id'
    );
    
    expect(link.token).toBeDefined();
    expect(link.isActive).toBe(true);
    expect(link.currentResponses).toBe(0);
  });
  
  it('should validate active link', async () => {
    const validation = await validateSurveyLink('valid-token');
    expect(validation.isValid).toBe(true);
  });
});
```

## Deployment

### Required Environment Variables
No additional environment variables are required for anonymous survey links.

### Build Configuration
The system is compatible with Next.js static export:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};
```

### Firebase Deployment
```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy hosting
firebase deploy --only hosting
```

## Monitoring

### Key Metrics to Track
- Number of active survey links per organization
- Response rates per link
- Link creation and usage patterns
- Error rates for invalid tokens
- Mobile vs desktop usage

### Analytics Queries
```typescript
// Get link statistics
const stats = await getSurveyLinkStats(linkId);
console.log('Total responses:', stats.totalResponses);
console.log('Response rate:', stats.responseRate);
console.log('Days remaining:', stats.daysRemaining);
```

## Troubleshooting

### Common Issues

**Survey Link Not Loading:**
1. Check if link is active
2. Verify token format is correct
3. Ensure Firestore rules are deployed
4. Check link expiration date

**Responses Not Appearing in Analytics:**
1. Verify survey was submitted successfully
2. Check organization association
3. Ensure analytics are filtering correctly
4. Verify survey type configuration

**Permission Errors:**
1. Check Firestore security rules
2. Verify admin permissions
3. Ensure required indexes exist

### Debug Commands
```bash
# Check Firestore rules
firebase firestore:rules

# Verify indexes
firebase firestore:indexes

# Check build output
npm run build
```

## Future Enhancements

### Potential Improvements
- **Bulk link creation** - Create multiple links at once
- **Link analytics** - Detailed statistics per link
- **Custom branding** - Organization-specific styling
- **Link templates** - Reusable link configurations
- **Automated reminders** - Send follow-up notifications
- **Response quotas** - Demographic-based limits
- **Link scheduling** - Automatic activation/deactivation

### Technical Debt
- Consider implementing proper TypeScript interfaces for all components
- Add comprehensive error boundary handling
- Implement rate limiting for link creation
- Add audit logging for link management actions

---

This documentation covers the complete anonymous survey links system implementation. For additional questions or support, please refer to the main project documentation or contact the development team.