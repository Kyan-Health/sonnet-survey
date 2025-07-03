import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

const auth = admin.auth();
const db = admin.firestore();

/**
 * Check if a domain is valid (exists in organizations collection)
 */
async function isValidOrganizationDomain(domain: string): Promise<boolean> {
  try {
    const organizationsRef = db.collection('organizations');
    const query = organizationsRef.where('domain', '==', domain).where('isActive', '==', true);
    const snapshot = await query.get();
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking organization domain:', error);
    return false;
  }
}

/**
 * Check if an email belongs to a valid organization
 */
async function isValidOrganizationEmail(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  if (!domain) return false;
  return await isValidOrganizationDomain(domain);
}


/**
 * Verify admin access from ID token
 */
async function verifyAdminAccess(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const decodedToken = await auth.verifyIdToken(idToken);
  
  if (!decodedToken.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  
  return decodedToken;
}

/**
 * List all users from valid organization domains
 */
export const listUsers = functions.region('europe-west1').https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get and verify admin access
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    await verifyAdminAccess(idToken);

    // List all users
    const listUsersResult = await auth.listUsers(1000);
    
    // Filter users to only include those from valid organization domains
    const validUsers = [];
    for (const user of listUsersResult.users) {
      if (user.email && await isValidOrganizationEmail(user.email)) {
        validUsers.push(user);
      }
    }
    
    // Format valid organization users
    const organizationUsers = validUsers
      .map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.customClaims?.admin === true,
        lastSignIn: user.metadata.lastSignInTime,
        createdAt: user.metadata.creationTime,
        disabled: user.disabled,
        emailVerified: user.emailVerified
      }));

    res.json({ users: organizationUsers });
  } catch (error) {
    console.error('Error listing users:', error);
    if (error instanceof functions.https.HttpsError) {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * Set admin claims for a user
 */
export const setAdminClaims = functions.region('europe-west1').https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get and verify admin access
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const adminUser = await verifyAdminAccess(idToken);

    // Get request data
    const { targetUid, isAdmin } = req.body;
    
    if (!targetUid || typeof isAdmin !== 'boolean') {
      res.status(400).json({ error: 'Missing or invalid parameters' });
      return;
    }

    // Prevent admins from removing their own admin status
    if (targetUid === adminUser.uid && !isAdmin) {
      res.status(400).json({ error: 'Cannot remove your own admin access' });
      return;
    }

    // Verify target user exists and belongs to a valid organization
    const targetUser = await auth.getUser(targetUid);
    if (!targetUser.email || !(await isValidOrganizationEmail(targetUser.email))) {
      res.status(400).json({ error: 'Can only manage users from valid organization domains' });
      return;
    }

    // Set custom claims
    const customClaims = isAdmin ? { admin: true } : {};
    await auth.setCustomUserClaims(targetUid, customClaims);

    res.json({ 
      success: true, 
      message: `${isAdmin ? 'Granted' : 'Revoked'} admin access for ${targetUser.email}` 
    });
  } catch (error) {
    console.error('Error setting admin claims:', error);
    if (error instanceof functions.https.HttpsError) {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});