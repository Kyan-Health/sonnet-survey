import { createSurveyType } from './surveyTypeService';
import { SYSTEM_SURVEY_TYPES } from '@/data/surveyTypes';
import { getAllOrganizations, updateOrganization } from './organizationService';
import { Organization } from '@/types/organization';

// Migration utility to create system default survey types
export async function migrateToMultiSurveySystem(): Promise<void> {
  try {
    console.log('Starting migration to multi-survey system...');

    // Step 1: Create system default survey types
    const createdSurveyTypes: { [key: string]: string } = {};
    
    for (const surveyTypeConfig of SYSTEM_SURVEY_TYPES) {
      try {
        const surveyTypeId = await createSurveyType(surveyTypeConfig, 'system');
        createdSurveyTypes[surveyTypeConfig.id] = surveyTypeId;
        console.log(`Created survey type: ${surveyTypeConfig.metadata.displayName} (${surveyTypeId})`);
      } catch (error) {
        console.error(`Error creating survey type ${surveyTypeConfig.id}:`, error);
      }
    }

    // Step 2: Update organizations to use Employee Engagement as default
    const employeeEngagementId = createdSurveyTypes['employee-engagement'];
    
    if (employeeEngagementId) {
      const organizations = await getAllOrganizations();
      
      for (const org of organizations) {
        try {
          // Set Employee Engagement as the default survey type
          const updateData: Partial<Organization> = {
            availableSurveyTypes: [employeeEngagementId],
            defaultSurveyType: employeeEngagementId,
            activeSurveyTypes: {
              [employeeEngagementId]: {
                surveyTypeId: employeeEngagementId,
                selectedQuestionIds: org.selectedQuestions || undefined, // Preserve existing selections
                isActive: true,
                lastConfigured: new Date()
              }
            }
          };

          await updateOrganization(org.id, updateData);
          console.log(`Updated organization: ${org.displayName}`);
        } catch (error) {
          console.error(`Error updating organization ${org.id}:`, error);
        }
      }
    }

    console.log('Migration to multi-survey system completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw new Error('Migration failed');
  }
}

// Utility to add additional survey types to organizations
export async function addSurveyTypeToOrganizations(
  surveyTypeId: string, 
  organizationIds?: string[]
): Promise<void> {
  try {
    const organizations = organizationIds 
      ? await Promise.all(organizationIds.map(async (id) => {
          const orgs = await getAllOrganizations();
          return orgs.find(org => org.id === id);
        }))
      : await getAllOrganizations();

    for (const org of organizations) {
      if (!org) continue;

      const currentSurveyTypes = org.availableSurveyTypes || [];
      
      if (!currentSurveyTypes.includes(surveyTypeId)) {
        const updateData: Partial<Organization> = {
          availableSurveyTypes: [...currentSurveyTypes, surveyTypeId],
          activeSurveyTypes: {
            ...org.activeSurveyTypes,
            [surveyTypeId]: {
              surveyTypeId,
              isActive: false, // Inactive by default, org can enable it
              lastConfigured: new Date()
            }
          }
        };

        await updateOrganization(org.id, updateData);
        console.log(`Added survey type ${surveyTypeId} to organization: ${org.displayName}`);
      }
    }
  } catch (error) {
    console.error('Error adding survey type to organizations:', error);
    throw new Error('Failed to add survey type to organizations');
  }
}

// Utility to enable/disable survey types for organizations
export async function updateOrganizationSurveyTypeStatus(
  organizationId: string,
  surveyTypeId: string,
  isActive: boolean,
  selectedQuestionIds?: string[]
): Promise<void> {
  try {
    const organizations = await getAllOrganizations();
    const org = organizations.find(o => o.id === organizationId);
    
    if (!org) {
      throw new Error('Organization not found');
    }

    const activeSurveyTypes = org.activeSurveyTypes || {};
    
    const updateData: Partial<Organization> = {
      activeSurveyTypes: {
        ...activeSurveyTypes,
        [surveyTypeId]: {
          surveyTypeId,
          selectedQuestionIds,
          isActive,
          lastConfigured: new Date()
        }
      }
    };

    // If this is the first active survey type, make it the default
    if (isActive && !org.defaultSurveyType) {
      updateData.defaultSurveyType = surveyTypeId;
    }

    await updateOrganization(organizationId, updateData);
  } catch (error) {
    console.error('Error updating organization survey type status:', error);
    throw new Error('Failed to update survey type status');
  }
}

// Check if migration is needed
export async function needsMigration(): Promise<boolean> {
  try {
    const organizations = await getAllOrganizations();
    return organizations.some(org => !org.availableSurveyTypes || org.availableSurveyTypes.length === 0);
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}