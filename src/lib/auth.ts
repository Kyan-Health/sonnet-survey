import { signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { getOrganizationFromEmail } from "./organizationService";

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if email belongs to a valid organization
    if (!user.email) {
      await signOut(auth);
      throw new Error('Email address is required');
    }
    
    const organization = await getOrganizationFromEmail(user.email);
    if (!organization) {
      await signOut(auth);
      throw new Error('Your email domain is not associated with any organization. Please contact your administrator.');
    }
    
    if (!organization.isActive) {
      await signOut(auth);
      throw new Error('Your organization is currently inactive. Please contact your administrator.');
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};