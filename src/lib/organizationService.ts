import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Organization, DEFAULT_ORGANIZATIONS } from '@/types/organization';

const ORGANIZATIONS_COLLECTION = 'organizations';

export async function createOrganization(
  organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  adminUid: string
): Promise<string> {
  try {
    // Check if domain already exists
    const existingOrg = await getOrganizationByDomain(organization.domain);
    if (existingOrg) {
      throw new Error('An organization with this domain already exists');
    }

    const orgData = {
      ...organization,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: adminUid,
    };

    const docRef = await addDoc(collection(db, ORGANIZATIONS_COLLECTION), orgData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw new Error('Failed to create organization');
  }
}

export async function getAllOrganizations(): Promise<Organization[]> {
  try {
    const organizationsRef = collection(db, ORGANIZATIONS_COLLECTION);
    const q = query(organizationsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const organizations: Organization[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      organizations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Organization);
    });

    // If no organizations in database, return defaults for backward compatibility
    if (organizations.length === 0) {
      return DEFAULT_ORGANIZATIONS;
    }

    return organizations;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    // Return defaults on error for backward compatibility
    return DEFAULT_ORGANIZATIONS;
  }
}

export async function getActiveOrganizations(): Promise<Organization[]> {
  try {
    const organizationsRef = collection(db, ORGANIZATIONS_COLLECTION);
    const q = query(
      organizationsRef, 
      where('isActive', '==', true),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    
    const organizations: Organization[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      organizations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Organization);
    });

    // If no organizations in database, return defaults for backward compatibility
    if (organizations.length === 0) {
      return DEFAULT_ORGANIZATIONS.filter(org => org.isActive);
    }

    return organizations;
  } catch (error) {
    console.error('Error fetching active organizations:', error);
    // Return defaults on error for backward compatibility
    return DEFAULT_ORGANIZATIONS.filter(org => org.isActive);
  }
}

export async function getOrganizationByDomain(domain: string): Promise<Organization | null> {
  try {
    const organizationsRef = collection(db, ORGANIZATIONS_COLLECTION);
    const q = query(organizationsRef, where('domain', '==', domain));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Check defaults for backward compatibility
      const defaultOrg = DEFAULT_ORGANIZATIONS.find(org => org.domain === domain);
      return defaultOrg || null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Organization;
  } catch (error) {
    console.error('Error fetching organization by domain:', error);
    // Check defaults for backward compatibility
    const defaultOrg = DEFAULT_ORGANIZATIONS.find(org => org.domain === domain);
    return defaultOrg || null;
  }
}

export async function getOrganization(organizationId: string): Promise<Organization | null> {
  return await getOrganizationById(organizationId);
}

export async function getOrganizationById(organizationId: string): Promise<Organization | null> {
  try {
    const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId);
    const orgDoc = await getDoc(orgRef);
    
    if (!orgDoc.exists()) {
      // Check defaults for backward compatibility
      const defaultOrg = DEFAULT_ORGANIZATIONS.find(org => org.id === organizationId);
      return defaultOrg || null;
    }

    const data = orgDoc.data();
    return {
      id: orgDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Organization;
  } catch (error) {
    console.error('Error fetching organization by ID:', error);
    // Check defaults for backward compatibility
    const defaultOrg = DEFAULT_ORGANIZATIONS.find(org => org.id === organizationId);
    return defaultOrg || null;
  }
}

export async function getOrganizationFromEmail(email: string): Promise<Organization | null> {
  const domain = email.split('@')[1];
  if (!domain) return null;
  
  return await getOrganizationByDomain(domain);
}

export async function updateOrganization(
  organizationId: string, 
  updates: Partial<Omit<Organization, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  try {
    const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId);
    await updateDoc(orgRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    throw new Error('Failed to update organization');
  }
}

export async function deleteOrganization(organizationId: string): Promise<void> {
  try {
    const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId);
    await deleteDoc(orgRef);
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw new Error('Failed to delete organization');
  }
}

export async function toggleOrganizationStatus(organizationId: string): Promise<void> {
  try {
    const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId);
    const orgDoc = await getDoc(orgRef);
    
    if (!orgDoc.exists()) {
      throw new Error('Organization not found');
    }

    const currentStatus = orgDoc.data().isActive;
    await updateDoc(orgRef, {
      isActive: !currentStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error toggling organization status:', error);
    throw new Error('Failed to toggle organization status');
  }
}

// Initialize default organizations in database (run once)
export async function initializeDefaultOrganizations(adminUid: string): Promise<void> {
  try {
    const existingOrgs = await getAllOrganizations();
    
    // Only initialize if no organizations exist (first setup)
    if (existingOrgs.length === 0 || existingOrgs === DEFAULT_ORGANIZATIONS) {
      for (const defaultOrg of DEFAULT_ORGANIZATIONS) {
        await setDoc(doc(db, ORGANIZATIONS_COLLECTION, defaultOrg.id), {
          ...defaultOrg,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: adminUid,
        });
      }
    }
  } catch (error) {
    console.error('Error initializing default organizations:', error);
    throw new Error('Failed to initialize default organizations');
  }
}