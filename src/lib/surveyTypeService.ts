import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { SurveyType, SurveyTypeConfig, RATING_SCALES } from '@/types/surveyType';

const SURVEY_TYPES_COLLECTION = 'surveyTypes';

export async function createSurveyType(config: SurveyTypeConfig, createdBy: string): Promise<string> {
  try {
    const surveyType: Omit<SurveyType, 'id'> = {
      metadata: config.metadata,
      defaultRatingScale: config.defaultRatingScale,
      questions: config.questionTemplates.map((template, index) => ({
        id: `${config.id}_q${index + 1}`,
        ...template
      })),
      factors: [...new Set(config.questionTemplates.map(q => q.factor))],
      isActive: true,
      isSystemDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    };

    const docRef = await addDoc(collection(db, SURVEY_TYPES_COLLECTION), {
      ...surveyType,
      createdAt: Timestamp.fromDate(surveyType.createdAt),
      updatedAt: Timestamp.fromDate(surveyType.updatedAt)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating survey type:', error);
    throw new Error('Failed to create survey type');
  }
}

export async function getSurveyType(id: string): Promise<SurveyType | null> {
  try {
    const docRef = doc(db, SURVEY_TYPES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as SurveyType;
    }

    return null;
  } catch (error) {
    console.error('Error getting survey type:', error);
    throw new Error('Failed to get survey type');
  }
}

export async function getAllSurveyTypes(): Promise<SurveyType[]> {
  try {
    const q = query(
      collection(db, SURVEY_TYPES_COLLECTION),
      orderBy('metadata.displayName', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as SurveyType;
    });
  } catch (error) {
    console.error('Error getting all survey types:', error);
    throw new Error('Failed to get survey types');
  }
}

export async function getActiveSurveyTypes(): Promise<SurveyType[]> {
  try {
    const q = query(
      collection(db, SURVEY_TYPES_COLLECTION),
      where('isActive', '==', true),
      orderBy('metadata.displayName', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as SurveyType;
    });
  } catch (error) {
    console.error('Error getting active survey types:', error);
    throw new Error('Failed to get active survey types');
  }
}

export async function updateSurveyType(id: string, updates: Partial<SurveyType>): Promise<void> {
  try {
    const docRef = doc(db, SURVEY_TYPES_COLLECTION, id);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
      ...(updates.createdAt && { createdAt: Timestamp.fromDate(updates.createdAt) })
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating survey type:', error);
    throw new Error('Failed to update survey type');
  }
}

export async function deleteSurveyType(id: string): Promise<void> {
  try {
    const surveyType = await getSurveyType(id);
    
    if (!surveyType) {
      throw new Error('Survey type not found');
    }

    if (surveyType.isSystemDefault) {
      throw new Error('Cannot delete system default survey types');
    }

    const docRef = doc(db, SURVEY_TYPES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting survey type:', error);
    throw new Error('Failed to delete survey type');
  }
}

export async function toggleSurveyTypeStatus(id: string): Promise<void> {
  try {
    const surveyType = await getSurveyType(id);
    
    if (!surveyType) {
      throw new Error('Survey type not found');
    }

    await updateSurveyType(id, {
      isActive: !surveyType.isActive
    });
  } catch (error) {
    console.error('Error toggling survey type status:', error);
    throw new Error('Failed to toggle survey type status');
  }
}

// Helper function to create system default survey types
export async function createSystemDefaultSurveyTypes(): Promise<void> {
  try {
    // Check if system defaults already exist
    const existing = await getAllSurveyTypes();
    const hasSystemDefaults = existing.some(st => st.isSystemDefault);
    
    if (hasSystemDefaults) {
      console.log('System default survey types already exist');
      return;
    }

    // Note: Employee Engagement survey type will be created in migration

    // This will be implemented in the migration step
    console.log('System default survey types creation initiated');
  } catch (error) {
    console.error('Error creating system default survey types:', error);
    throw new Error('Failed to create system default survey types');
  }
}

// Factory function for creating survey types
export function createSurveyTypeFromTemplate(
  templateName: string, 
  customConfig?: Partial<SurveyTypeConfig>
): SurveyTypeConfig {
  const baseTemplates = {
    'employee-engagement': {
      id: 'employee-engagement',
      metadata: {
        name: 'employee-engagement',
        displayName: 'Employee Engagement',
        description: 'Comprehensive employee engagement survey',
        version: '1.0',
        category: 'engagement' as const,
        recommendedFrequency: 'Quarterly',
        estimatedTime: 15
      },
      defaultRatingScale: RATING_SCALES.FIVE_POINT_LIKERT,
      questionTemplates: []
    },
    'burnout-assessment': {
      id: 'burnout-assessment', 
      metadata: {
        name: 'burnout-assessment',
        displayName: 'Burnout Assessment (MBI)',
        description: 'Maslach Burnout Inventory for measuring workplace burnout',
        version: '1.0',
        researchBasis: 'Maslach Burnout Inventory',
        category: 'burnout' as const,
        recommendedFrequency: 'Quarterly',
        estimatedTime: 10
      },
      defaultRatingScale: RATING_SCALES.MBI_FREQUENCY,
      questionTemplates: []
    }
  };

  const template = baseTemplates[templateName as keyof typeof baseTemplates];
  if (!template) {
    throw new Error(`Unknown survey type template: ${templateName}`);
  }

  return {
    ...template,
    ...customConfig
  };
}