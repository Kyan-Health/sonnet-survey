import { collection, addDoc, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CompletedSurvey, SurveyResponse, DynamicDemographicResponse } from '@/data/surveyData';
import { getSurveyType } from './surveyTypeService';

export async function submitSurvey(
  userId: string,
  userEmail: string,
  responses: SurveyResponse[],
  demographics: DynamicDemographicResponse,
  organizationId: string,
  organizationName: string,
  surveyTypeId?: string
): Promise<string> {
  try {
    // Get survey type version if provided
    let version: string | undefined;
    if (surveyTypeId) {
      const surveyType = await getSurveyType(surveyTypeId);
      version = surveyType?.metadata.version;
    }

    const completedSurvey: Omit<CompletedSurvey, 'sessionId'> = {
      userId,
      userEmail,
      organizationId,
      organizationName,
      surveyTypeId: surveyTypeId || 'employee-engagement', // Default for backward compatibility
      responses,
      demographics,
      completedAt: new Date(),
      version
    };

    const docRef = await addDoc(collection(db, 'surveys'), completedSurvey);
    
    // Store user completion status with survey type info
    await setDoc(doc(db, 'userSurveyStatus', userId), {
      userId,
      userEmail,
      hasCompleted: true,
      completedAt: new Date(),
      surveyId: docRef.id,
      surveyTypeId: surveyTypeId || 'employee-engagement'
    });

    return docRef.id;
  } catch (error) {
    console.error('Error submitting survey:', error);
    throw new Error('Failed to submit survey. Please try again.');
  }
}

export async function hasUserCompletedSurvey(userId: string, surveyTypeId?: string): Promise<boolean> {
  try {
    const userStatusDoc = await getDoc(doc(db, 'userSurveyStatus', userId));
    
    if (!userStatusDoc.exists()) {
      return false;
    }
    
    const data = userStatusDoc.data();
    
    // If no specific survey type requested, check general completion
    if (!surveyTypeId) {
      return data?.hasCompleted === true;
    }
    
    // Check completion for specific survey type
    return data?.hasCompleted === true && data?.surveyTypeId === surveyTypeId;
  } catch (error) {
    console.error('Error checking survey completion status:', error);
    return false;
  }
}

export async function getSurveyResponses(): Promise<CompletedSurvey[]> {
  try {
    const surveysRef = collection(db, 'surveys');
    const querySnapshot = await getDocs(surveysRef);
    
    const surveys: CompletedSurvey[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      surveys.push({
        ...data,
        sessionId: doc.id,
        completedAt: data.completedAt.toDate(),
        // For backward compatibility with existing data
        organizationId: data.organizationId || 'kyan-health',
        organizationName: data.organizationName || 'Kyan Health',
        surveyTypeId: data.surveyTypeId || 'employee-engagement', // Default for backward compatibility
      } as CompletedSurvey);
    });
    
    return surveys;
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    throw new Error('Failed to fetch survey responses.');
  }
}

export async function getSurveyResponsesByOrganization(organizationId?: string): Promise<CompletedSurvey[]> {
  try {
    const surveysRef = collection(db, 'surveys');
    let querySnapshot;
    
    if (organizationId) {
      // Filter by specific organization
      const q = query(surveysRef, where('organizationId', '==', organizationId));
      querySnapshot = await getDocs(q);
    } else {
      // Get all surveys if no organization specified
      querySnapshot = await getDocs(surveysRef);
    }
    
    const surveys: CompletedSurvey[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      surveys.push({
        ...data,
        sessionId: doc.id,
        completedAt: data.completedAt.toDate(),
        // For backward compatibility with existing data
        organizationId: data.organizationId || 'kyan-health',
        organizationName: data.organizationName || 'Kyan Health',
        surveyTypeId: data.surveyTypeId || 'employee-engagement', // Default for backward compatibility
      } as CompletedSurvey);
    });
    
    return surveys;
  } catch (error) {
    console.error('Error fetching survey responses by organization:', error);
    throw new Error('Failed to fetch survey responses.');
  }
}

// Get survey responses filtered by survey type
export async function getSurveyResponsesBySurveyType(
  surveyTypeId: string,
  organizationId?: string
): Promise<CompletedSurvey[]> {
  try {
    const surveysRef = collection(db, 'surveys');
    let q;
    
    if (organizationId) {
      // Filter by both survey type and organization
      q = query(
        surveysRef, 
        where('surveyTypeId', '==', surveyTypeId),
        where('organizationId', '==', organizationId)
      );
    } else {
      // Filter by survey type only
      q = query(surveysRef, where('surveyTypeId', '==', surveyTypeId));
    }
    
    const querySnapshot = await getDocs(q);
    
    const surveys: CompletedSurvey[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      surveys.push({
        ...data,
        id: doc.id,
        sessionId: doc.id,
        completedAt: data.completedAt.toDate(),
        // For backward compatibility with existing data
        organizationId: data.organizationId || 'kyan-health',
        organizationName: data.organizationName || 'Kyan Health',
        surveyTypeId: data.surveyTypeId || 'employee-engagement',
      } as CompletedSurvey);
    });
    
    return surveys;
  } catch (error) {
    console.error('Error fetching survey responses by survey type:', error);
    throw new Error('Failed to fetch survey responses.');
  }
}

// Check if user has completed a specific survey type
export async function hasUserCompletedSurveyType(
  userId: string, 
  surveyTypeId: string
): Promise<boolean> {
  try {
    const surveysRef = collection(db, 'surveys');
    const q = query(
      surveysRef,
      where('userId', '==', userId),
      where('surveyTypeId', '==', surveyTypeId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking survey type completion:', error);
    return false;
  }
}

// Get all survey responses for a user across all survey types
export async function getUserSurveyHistory(userId: string): Promise<CompletedSurvey[]> {
  try {
    const surveysRef = collection(db, 'surveys');
    const q = query(surveysRef, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    
    const surveys: CompletedSurvey[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      surveys.push({
        ...data,
        id: doc.id,
        sessionId: doc.id,
        completedAt: data.completedAt.toDate(),
        organizationId: data.organizationId || 'kyan-health',
        organizationName: data.organizationName || 'Kyan Health',
        surveyTypeId: data.surveyTypeId || 'employee-engagement',
      } as CompletedSurvey);
    });
    
    return surveys.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  } catch (error) {
    console.error('Error fetching user survey history:', error);
    throw new Error('Failed to fetch user survey history.');
  }
}