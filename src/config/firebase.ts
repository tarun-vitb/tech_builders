import { initializeApp } from 'firebase/app';
import { getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYU2ndmXl4Tb51SqpEBAXUKbP0_bg02Us",
  authDomain: "team-builders-9e6f1.firebaseapp.com",
  projectId: "team-builders-9e6f1",
  storageBucket: "team-builders-9e6f1.appspot.com",
  messagingSenderId: "272890360212",
  appId: "1:272890360212:web:841592d25acc1234cedf81"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;