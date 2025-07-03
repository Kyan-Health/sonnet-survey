import { collection, addDoc, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CompletedSurvey, SurveyResponse, DynamicDemographicResponse } from '@/data/surveyData';

export async function submitSurvey(
  userId: string,
  userEmail: string,
  responses: SurveyResponse[],
  demographics: DynamicDemographicResponse,
  organizationId: string,
  organizationName: string
): Promise<string> {
  try {
    const completedSurvey: Omit<CompletedSurvey, 'sessionId'> = {
      userId,
      userEmail,
      organizationId,
      organizationName,
      responses,
      demographics,
      completedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'surveys'), completedSurvey);
    
    // Also store user completion status
    await setDoc(doc(db, 'userSurveyStatus', userId), {
      userId,
      userEmail,
      hasCompleted: true,
      completedAt: new Date(),
      surveyId: docRef.id
    });

    return docRef.id;
  } catch (error) {
    console.error('Error submitting survey:', error);
    throw new Error('Failed to submit survey. Please try again.');
  }
}

export async function hasUserCompletedSurvey(userId: string): Promise<boolean> {
  try {
    const userStatusDoc = await getDoc(doc(db, 'userSurveyStatus', userId));
    return userStatusDoc.exists() && userStatusDoc.data()?.hasCompleted === true;
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
      } as CompletedSurvey);
    });
    
    return surveys;
  } catch (error) {
    console.error('Error fetching survey responses by organization:', error);
    throw new Error('Failed to fetch survey responses.');
  }
}