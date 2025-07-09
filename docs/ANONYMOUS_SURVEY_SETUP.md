# Anonymous Survey Links - Setup Guide

## Quick Start

### 1. Deploy Required Infrastructure

**Firestore Rules:**
```bash
firebase deploy --only firestore:rules
```

**Firestore Indexes:**
```bash
firebase deploy --only firestore:indexes
```

### 2. Create Your First Anonymous Survey Link

1. **Access Admin Interface**
   - Go to `/admin/organizations`
   - Click "Survey Links" for your organization

2. **Create New Link**
   - Click "Create New Survey Link"
   - Fill in required fields:
     - **Link Name**: "Q1 2024 Employee Survey"
     - **Survey Type**: Select from available types
     - **Expiration Date**: (Optional) Set end date
     - **Max Responses**: (Optional) Set response limit

3. **Configure Options**
   - ✅ **Require demographic questions** - Collects employee demographics
   - ❌ **Allow multiple responses** - Prevent duplicate responses

4. **Generate Link**
   - Click "Create"
   - Copy the generated URL
   - Share with your team

### 3. Test the Survey Link

1. **Open Anonymous Link**
   ```
   https://yoursite.com/survey/anonymous?token=abc123def456
   ```

2. **Complete Survey Flow**
   - Fill out demographic questions (if enabled)
   - Answer all survey questions
   - Submit response

3. **Verify Analytics**
   - Go to `/admin/analytics`
   - Check that responses appear in organization analytics

## Configuration Options

### Link Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Name** | Human-readable identifier | Required |
| **Survey Type** | Which survey to use | Required |
| **Description** | Internal notes | Optional |
| **Expires On** | When link becomes invalid | No expiration |
| **Max Responses** | Response limit | Unlimited |
| **Multiple Responses** | Allow same user to respond multiple times | Disabled |
| **Require Demographics** | Collect demographic information | Enabled |

### Survey Types

Available survey types depend on your organization's configuration:
- **Employee Engagement** - 73 questions across 15 factors
- **MBI Burnout** - 22 questions measuring burnout levels
- **COPSOC Workplace** - 40+ psychosocial risk questions
- **COPSOC II Short** - 36 questions across 19 factors

### Link Status

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| **Active** | Link is live and accepting responses | Edit, Deactivate, Delete |
| **Inactive** | Link is disabled by admin | Edit, Activate, Delete |
| **Expired** | Link has passed expiration date | Edit, Delete |
| **Full** | Maximum responses reached | Edit, Delete |

## Management Tasks

### Edit Survey Link
1. Go to Organization → Survey Links
2. Click "Edit" on the desired link
3. Modify settings as needed
4. Click "Update"

### Deactivate Link
1. Find the link in Survey Links list
2. Click "Deactivate"
3. Link becomes inaccessible to users

### Copy Link URL
1. Click "Copy" button next to the link
2. URL is copied to clipboard
3. Share via email, Slack, etc.

### Monitor Responses
- View current response count
- Check days remaining until expiration
- Monitor link status

## Troubleshooting

### Common Issues

**"Survey Unavailable" Error:**
- Check if link is active
- Verify expiration date hasn't passed
- Ensure max responses not reached

**No Survey Types Available:**
- Verify organization has survey types configured
- Check admin permissions
- Ensure survey types are active

**Responses Not in Analytics:**
- Verify survey was submitted successfully
- Check organization filter in analytics
- Ensure proper survey type association

### Debug Steps

1. **Check Link Status**
   ```
   Status: Active ✅
   Expires: 2024-12-31
   Responses: 45/100
   ```

2. **Verify Token**
   - Token should be 16 characters
   - Format: `abc123def456ghi7`
   - No spaces or special characters

3. **Test Link Access**
   - Open link in incognito/private browsing
   - Verify survey loads correctly
   - Complete a test response

## Security Best Practices

### Link Management
- ✅ Set expiration dates for time-sensitive surveys
- ✅ Use descriptive names for easy identification
- ✅ Monitor response counts regularly
- ✅ Deactivate links when no longer needed

### Token Security
- ✅ Tokens are cryptographically secure (UUID-based)
- ✅ Each link has a unique, unpredictable token
- ✅ No personal information in tokens
- ✅ Tokens expire with link expiration

### Data Privacy
- ✅ Anonymous responses cannot be traced to individuals
- ✅ Demographic data is aggregated only
- ✅ No IP addresses or browser fingerprinting
- ✅ Organization association maintained for analytics

## Advanced Configuration

### Custom Demographics
```typescript
// Add custom demographic questions
const customQuestions = [
  {
    id: 'team_size',
    label: 'What is your team size?',
    type: 'select',
    options: ['1-5', '6-10', '11-20', '20+'],
    required: true,
    order: 1
  }
];
```

### Bulk Link Creation
```typescript
// Create multiple links programmatically
const surveyTypes = ['engagement', 'burnout', 'wellbeing'];
const links = await Promise.all(
  surveyTypes.map(type => 
    createSurveyLink(orgId, type, `${type} Survey`, adminId)
  )
);
```

### Response Webhooks
```typescript
// Optional: Set up webhooks for new responses
const onNewResponse = (response) => {
  // Send notification
  // Update external systems
  // Trigger analytics refresh
};
```

## API Reference

### Create Survey Link
```typescript
await createSurveyLink(
  organizationId: string,
  surveyTypeId: string,
  name: string,
  createdBy: string,
  options?: {
    description?: string;
    expiresAt?: Date;
    maxResponses?: number;
    allowMultipleResponses?: boolean;
    requireDemographics?: boolean;
  }
);
```

### Validate Survey Link
```typescript
const validation = await validateSurveyLink(token: string);
// Returns: { isValid: boolean, link?: SurveyLink, error?: string }
```

### Get Link Statistics
```typescript
const stats = await getSurveyLinkStats(linkId: string);
// Returns: { totalResponses, responseRate, isActive, daysRemaining }
```

## Support

For additional help:
- Check the main documentation: `/docs/ANONYMOUS_SURVEY_LINKS.md`
- Review Firestore security rules: `/firestore.rules`
- Examine implementation: `/src/lib/surveyLinkService.ts`
- Test with sample data: Use development environment first

---

*Last updated: 2024-12-20*