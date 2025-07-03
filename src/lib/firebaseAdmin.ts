import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'survey-sonnet';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // Only initialize if we have proper credentials
    if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } else {
      console.warn('Firebase Admin SDK not initialized: Missing service account credentials');
      console.warn('Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables');
    }
  }
}

// Initialize the admin app
initializeFirebaseAdmin();

function getAdminAuth() {
  if (getApps().length === 0) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  return getAuth();
}

export function getAdminDb() {
  if (getApps().length === 0) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  return getFirestore();
}

export async function setAdminClaim(uid: string, isAdmin: boolean = true): Promise<void> {
  try {
    const adminAuth = getAdminAuth();
    await adminAuth.setCustomUserClaims(uid, { admin: isAdmin });
    console.log(`Admin claim set for user ${uid}: ${isAdmin}`);
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new Error('Failed to set admin claim');
  }
}

export async function verifyAndGetUser(idToken: string) {
  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid token');
  }
}