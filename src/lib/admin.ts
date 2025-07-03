import { User } from 'firebase/auth';

const ADMIN_EMAILS = ['ignacio@kyanhealth.com'];

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  
  // For synchronous check, fallback to email check
  // Use isAdminAsync() for proper custom claims checking
  if (!user.email) return false;
  return ADMIN_EMAILS.includes(user.email);
}

export async function isAdminAsync(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  try {
    // Get fresh token with custom claims
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.admin === true;
  } catch (error) {
    console.error('Error checking admin claims:', error);
    
    // Fallback to email check
    if (!user.email) return false;
    return ADMIN_EMAILS.includes(user.email);
  }
}

export function requireAdmin(user: User | null): void {
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
}

export async function requireAdminAsync(user: User | null): Promise<void> {
  const isUserAdmin = await isAdminAsync(user);
  if (!isUserAdmin) {
    throw new Error('Admin access required');
  }
}

export async function setUserAdmin(user: User, targetUid: string, isAdmin: boolean = true): Promise<boolean> {
  try {
    // Get fresh ID token
    const idToken = await user.getIdToken();
    
    const response = await fetch('/api/admin/set-claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken, targetUid, isAdmin }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to set admin claims');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting user admin status:', error);
    return false;
  }
}