import { signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if email domain is @kyanhealth.com
    if (!user.email?.endsWith('@kyanhealth.com')) {
      await signOut(auth);
      throw new Error('Only @kyanhealth.com email addresses are allowed');
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