import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { User } from '../types';

type UserRole = 'student' | 'faculty' | 'admin';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (
    role?: UserRole,
    profileExtras?: Partial<Pick<User, 'rollNo' | 'facultyId' | 'branch' | 'accreditation'>>
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // First-time user - default to student role
          const newUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Unknown User',
            email: firebaseUser.email || '',
            role: 'student',
            photoURL: firebaseUser.photoURL || undefined
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (
    role?: UserRole,
    profileExtras?: Partial<Pick<User, 'rollNo' | 'facultyId' | 'branch' | 'accreditation'>>
  ) => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const firebaseUser = cred.user;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const existing = await getDoc(userRef);

      const baseUser: User = existing.exists()
        ? (existing.data() as User)
        : {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Unknown User',
            email: firebaseUser.email || '',
            role: role || 'student',
            photoURL: firebaseUser.photoURL || undefined,
          };

      const updated: User = {
        ...baseUser,
        role: role || baseUser.role,
        ...(profileExtras || {}),
      } as User;

      await setDoc(userRef, updated, { merge: true });
      setUser(updated);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};