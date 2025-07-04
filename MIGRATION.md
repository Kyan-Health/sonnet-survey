# Migration Guide

This document covers migration utilities and procedures for the Sonnet Survey platform.

## Overview

The migration system (`src/lib/migrationUtils.ts`) provides utilities for transitioning from single-survey to multi-survey architecture and managing survey type deployments across organizations.

## Migration Functions

### Core Migration

#### `migrateToMultiSurveySystem()`
Migrates the entire platform from single-survey to multi-survey architecture.

**Process:**
1. Creates all system default survey types
2. Updates existing organizations to use Employee Engagement as default
3. Preserves existing question selections
4. Sets up `activeSurveyTypes` configuration

**Usage:**
```typescript
import { migrateToMultiSurveySystem } from '@/lib/migrationUtils';

await migrateToMultiSurveySystem();
```

**Side Effects:**
- Creates survey type documents in Firestore
- Updates all organization documents
- Preserves existing `selectedQuestions` arrays

#### `needsMigration()`
Checks if organizations require migration to multi-survey system.

**Returns:** `boolean` - `true` if any organization lacks `availableSurveyTypes`

```typescript
const requiresMigration = await needsMigration();
if (requiresMigration) {
  await migrateToMultiSurveySystem();
}
```

### Survey Type Management

#### `addSurveyTypeToOrganizations(surveyTypeId, organizationIds?)`
Adds a survey type to organizations (all or specified subset).

**Parameters:**
- `surveyTypeId: string` - ID of survey type to add
- `organizationIds?: string[]` - Optional array of organization IDs (default: all)

**Behavior:**
- Adds survey type to `availableSurveyTypes` array
- Creates inactive `activeSurveyTypes` entry
- Organizations must manually activate the survey type

```typescript
// Add COPSOC II Short to all organizations
await addSurveyTypeToOrganizations('copsoc-ii-short');

// Add to specific organizations
await addSurveyTypeToOrganizations('mbi-burnout', ['org1', 'org2']);
```

#### `updateOrganizationSurveyTypeStatus(organizationId, surveyTypeId, isActive, selectedQuestionIds?)`
Updates survey type activation and question selection for an organization.

**Parameters:**
- `organizationId: string` - Target organization ID
- `surveyTypeId: string` - Survey type to update
- `isActive: boolean` - Activation status
- `selectedQuestionIds?: string[]` - Optional custom question selection

**Behavior:**
- Updates `activeSurveyTypes` configuration
- If first active survey type, sets as `defaultSurveyType`
- Timestamps changes with `lastConfigured`

```typescript
// Activate COPSOC II Short for Kyan Health
await updateOrganizationSurveyTypeStatus(
  'kyan-health', 
  'copsoc-ii-short', 
  true, 
  ['quantitative-demands-1', 'work-pace-1', ...]
);
```

## Migration Best Practices

### Pre-Migration Checklist
- [ ] Backup Firestore database
- [ ] Verify all survey types are defined in `SYSTEM_SURVEY_TYPES`
- [ ] Test migration on development environment
- [ ] Ensure admin users have proper permissions

### Post-Migration Verification
- [ ] Check all organizations have `availableSurveyTypes`
- [ ] Verify `defaultSurveyType` is set correctly
- [ ] Test survey type selection interface
- [ ] Confirm existing surveys still work

### Rollback Procedures
If migration fails:

1. **Restore Database:**
   ```bash
   # Restore from backup
   firebase firestore:restore gs://backup-bucket/backup-file
   ```

2. **Manual Cleanup:**
   ```typescript
   // Remove multi-survey fields if needed
   const organizations = await getAllOrganizations();
   for (const org of organizations) {
     await updateOrganization(org.id, {
       availableSurveyTypes: null,
       defaultSurveyType: null,
       activeSurveyTypes: null
     });
   }
   ```

## Deployment Migration

### New Survey Type Deployment
When adding new survey types to production:

```typescript
// 1. Deploy code with new survey type
// 2. Run migration to add to organizations
await addSurveyTypeToOrganizations('new-survey-type-id');

// 3. Organizations can then activate via admin interface
```

### Admin Interface Integration
The admin interface (`/admin/survey-types`) includes:
- **"Sync System Defaults"** button - Runs `migrateToMultiSurveySystem()`
- Automatic detection of missing survey types
- Status reporting for successful/failed creations

## Error Handling

### Common Migration Errors

**"Survey type already exists"**
- Expected during repeated migrations
- Non-fatal - existing survey types are skipped

**"Organization not found"** 
- Check organization ID exists in Firestore
- Verify organization collection permissions

**"Permission denied"**
- Ensure service account has Firestore write permissions
- Check Firestore security rules allow admin operations

### Recovery Strategies

```typescript
// Retry failed migrations
try {
  await migrateToMultiSurveySystem();
} catch (error) {
  console.error('Migration failed:', error);
  
  // Retry specific organizations
  const failedOrgs = await getOrganizationsNeedingMigration();
  for (const org of failedOrgs) {
    try {
      await updateOrganizationSurveyTypeStatus(
        org.id, 
        'employee-engagement', 
        true
      );
    } catch (retryError) {
      console.error(`Failed to migrate ${org.id}:`, retryError);
    }
  }
}
```

## Monitoring

### Migration Logs
All migration functions include comprehensive logging:
- Survey type creation success/failure
- Organization update status  
- Error details for debugging

### Health Checks
Implement post-migration verification:

```typescript
async function verifyMigration() {
  const orgs = await getAllOrganizations();
  
  for (const org of orgs) {
    if (!org.availableSurveyTypes?.length) {
      console.warn(`Organization ${org.id} missing survey types`);
    }
    
    if (!org.defaultSurveyType) {
      console.warn(`Organization ${org.id} missing default survey type`);
    }
  }
}
```

## API Integration

### Admin API Endpoints
- `POST /api/admin/migrate` - Trigger migration (to be implemented)
- `GET /api/admin/migration-status` - Check migration status (to be implemented)

### Manual Migration Triggers
Current migration triggers:
- Admin interface "Sync System Defaults" button
- Programmatic calls in deployment scripts
- Console-based migration utilities

---

*For production migrations, always coordinate with the development team and schedule appropriate maintenance windows.*