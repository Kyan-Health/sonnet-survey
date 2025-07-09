import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, Timestamp, FieldValue } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SurveyLink } from '@/types/organization';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique token for anonymous survey links
function generateSurveyToken(): string {
  return uuidv4().replace(/-/g, '').substring(0, 16);
}

// Create a new survey link
export async function createSurveyLink(
  organizationId: string,
  surveyTypeId: string,
  name: string,
  createdBy: string,
  options: {
    description?: string;
    expiresAt?: Date;
    maxResponses?: number;
    allowMultipleResponses?: boolean;
    requireDemographics?: boolean;
    customDemographicQuestions?: string[];
  } = {}
): Promise<SurveyLink> {
  const token = generateSurveyToken();
  
  const surveyLink: Omit<SurveyLink, 'id'> = {
    organizationId,
    surveyTypeId,
    name,
    description: options.description,
    token,
    isActive: true,
    expiresAt: options.expiresAt,
    maxResponses: options.maxResponses,
    currentResponses: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
    allowMultipleResponses: options.allowMultipleResponses || false,
    requireDemographics: options.requireDemographics ?? true,
    customDemographicQuestions: options.customDemographicQuestions
  };

  // Prepare data for Firestore, excluding undefined values
  const firestoreData: Record<string, unknown> = {
    organizationId,
    surveyTypeId,
    name,
    token,
    isActive: true,
    currentResponses: 0,
    createdAt: Timestamp.fromDate(surveyLink.createdAt),
    updatedAt: Timestamp.fromDate(surveyLink.updatedAt),
    createdBy,
    allowMultipleResponses: options.allowMultipleResponses || false,
    requireDemographics: options.requireDemographics ?? true
  };

  // Only add optional fields if they have values
  if (options.description) {
    firestoreData.description = options.description;
  }
  if (options.expiresAt) {
    firestoreData.expiresAt = Timestamp.fromDate(options.expiresAt);
  }
  if (options.maxResponses) {
    firestoreData.maxResponses = options.maxResponses;
  }
  if (options.customDemographicQuestions) {
    firestoreData.customDemographicQuestions = options.customDemographicQuestions;
  }

  const docRef = await addDoc(collection(db, 'surveyLinks'), firestoreData);

  return {
    id: docRef.id,
    ...surveyLink
  };
}

// Get all survey links for an organization
export async function getSurveyLinks(organizationId: string): Promise<SurveyLink[]> {
  const q = query(
    collection(db, 'surveyLinks'),
    where('organizationId', '==', organizationId)
  );
  
  const querySnapshot = await getDocs(q);
  const links: SurveyLink[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    links.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      expiresAt: data.expiresAt?.toDate()
    } as SurveyLink);
  });
  
  // Sort by createdAt descending (newest first)
  links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  return links;
}

// Get a survey link by token
export async function getSurveyLinkByToken(token: string): Promise<SurveyLink | null> {
  const q = query(
    collection(db, 'surveyLinks'),
    where('token', '==', token),
    where('isActive', '==', true)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  const data = doc.data();
  
  const link: SurveyLink = {
    id: doc.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    expiresAt: data.expiresAt?.toDate()
  } as SurveyLink;
  
  // Check if link is expired
  if (link.expiresAt && link.expiresAt < new Date()) {
    return null;
  }
  
  // Check if max responses reached
  if (link.maxResponses && link.currentResponses >= link.maxResponses) {
    return null;
  }
  
  return link;
}

// Update a survey link
export async function updateSurveyLink(
  linkId: string,
  updates: Partial<Omit<SurveyLink, 'id' | 'organizationId' | 'token' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const docRef = doc(db, 'surveyLinks', linkId);
  
  // Prepare update data, excluding undefined values
  const updateData: Record<string, FieldValue | string | number | boolean | null> = {
    updatedAt: Timestamp.fromDate(new Date())
  };
  
  // Only include fields that have defined values
  Object.keys(updates).forEach(key => {
    const value = (updates as Record<string, unknown>)[key];
    if (value !== undefined) {
      if (key === 'expiresAt' && value) {
        // Type guard: ensure value is a Date object
        if (value instanceof Date) {
          updateData[key] = Timestamp.fromDate(value);
        }
      } else if (key !== 'expiresAt') {
        updateData[key] = value as string | number | boolean | null;
      }
    }
  });
  
  await updateDoc(docRef, updateData);
}

// Delete a survey link
export async function deleteSurveyLink(linkId: string): Promise<void> {
  const docRef = doc(db, 'surveyLinks', linkId);
  await deleteDoc(docRef);
}

// Toggle survey link status
export async function toggleSurveyLinkStatus(linkId: string): Promise<void> {
  const docRef = doc(db, 'surveyLinks', linkId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const currentStatus = docSnap.data().isActive;
    await updateDoc(docRef, {
      isActive: !currentStatus,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }
}

// Increment response count for a survey link
export async function incrementSurveyLinkResponse(linkId: string): Promise<void> {
  const docRef = doc(db, 'surveyLinks', linkId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const currentCount = docSnap.data().currentResponses || 0;
    await updateDoc(docRef, {
      currentResponses: currentCount + 1,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }
}

// Validate survey link and check if it can accept responses
export async function validateSurveyLink(token: string): Promise<{
  isValid: boolean;
  link?: SurveyLink;
  error?: string;
}> {
  const link = await getSurveyLinkByToken(token);
  
  if (!link) {
    return {
      isValid: false,
      error: 'Survey link not found or has expired'
    };
  }
  
  if (!link.isActive) {
    return {
      isValid: false,
      error: 'Survey link is not active'
    };
  }
  
  if (link.expiresAt && link.expiresAt < new Date()) {
    return {
      isValid: false,
      error: 'Survey link has expired'
    };
  }
  
  if (link.maxResponses && link.currentResponses >= link.maxResponses) {
    return {
      isValid: false,
      error: 'Survey link has reached maximum responses'
    };
  }
  
  return {
    isValid: true,
    link
  };
}

// Get survey link statistics
export async function getSurveyLinkStats(linkId: string): Promise<{
  totalResponses: number;
  responseRate: number;
  isActive: boolean;
  daysRemaining?: number;
}> {
  const docRef = doc(db, 'surveyLinks', linkId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Survey link not found');
  }
  
  const data = docSnap.data() as SurveyLink;
  const totalResponses = data.currentResponses || 0;
  const maxResponses = data.maxResponses || 0;
  const responseRate = maxResponses > 0 ? (totalResponses / maxResponses) * 100 : 0;
  
  let daysRemaining: number | undefined;
  if (data.expiresAt) {
    const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : data.expiresAt;
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  return {
    totalResponses,
    responseRate,
    isActive: data.isActive,
    daysRemaining
  };
}