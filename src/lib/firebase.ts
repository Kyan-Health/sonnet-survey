import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCBzF0aEbuLWX4Maq__U6mJj5m-_i7-ZUM",
  authDomain: "survey-sonnet.firebaseapp.com",
  projectId: "survey-sonnet",
  storageBucket: "survey-sonnet.firebasestorage.app",
  messagingSenderId: "955915624314",
  appId: "1:955915624314:web:0940784eb75820f09180c3",
  measurementId: "G-4BWLHD3X14"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };