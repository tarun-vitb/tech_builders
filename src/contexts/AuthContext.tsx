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

type UserRole = 'student' | 'faculty' | 'admin' | 'derived-admin';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (
    role?: UserRole,
    profileExtras?: Partial<Pick<User, 'rollNo' | 'facultyId' | 'branch' | 'accreditation'>>
  ) => Promise<void>;
  signInExistingWithGoogle: (
    role: UserRole,
    identifier?: string
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
            role: role === 'admin' ? 'student' : (role || 'student'),
            photoURL: firebaseUser.photoURL || undefined,
          };

      const updated: User = {
        ...baseUser,
        // Prevent creating or elevating to admin here
        role: role === 'admin' ? baseUser.role : (role || baseUser.role),
        ...(profileExtras || {}),
        // Set department equal to branch for faculty and students
        ...(profileExtras?.branch ? { department: profileExtras.branch } : {}),
      } as User;

      await setDoc(userRef, updated, { merge: true });
      setUser(updated);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign-in flow that only allows existing users and verifies role/ID
  const signInExistingWithGoogle = async (role: UserRole, identifier?: string) => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const firebaseUser = cred.user;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const existing = await getDoc(userRef);

      // Special handling for admin role with correct admin key
      if (role === 'admin' && identifier === 'vit69') {
        if (!existing.exists()) {
          // Create admin user if doesn't exist and correct key is provided
          const newAdminUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Admin User',
            email: firebaseUser.email || '',
            role: 'admin',
            photoURL: firebaseUser.photoURL || undefined
          };
          
          await setDoc(userRef, newAdminUser);
          setUser(newAdminUser);
          return;
        } else {
          // Update existing user to admin role if correct key is provided
          const existingUser = existing.data() as User;
          const updatedUser: User = {
            ...existingUser,
            role: 'admin',
            name: firebaseUser.displayName || existingUser.name,
            email: firebaseUser.email || existingUser.email,
            photoURL: firebaseUser.photoURL || existingUser.photoURL,
          };
          
          await setDoc(userRef, updatedUser, { merge: true });
          setUser(updatedUser);
          return;
        }
      }

      if (!existing.exists()) {
        throw new Error('Account not found. Please create an account first.');
      }

      const existingUser = existing.data() as User;

      // Verify role for non-admin users
      if (existingUser.role !== role) {
        throw new Error('Role mismatch for this account.');
      }

      // Verify identifier when relevant
      if (role === 'student' && identifier && existingUser.rollNo && existingUser.rollNo !== identifier) {
        throw new Error('Roll number does not match.');
      }
      if (role === 'faculty' && identifier && existingUser.facultyId && existingUser.facultyId !== identifier) {
        throw new Error('Faculty ID does not match.');
      }

      // Merge latest Google profile basics but do not change role/ids
      const updated: User = {
        ...existingUser,
        name: firebaseUser.displayName || existingUser.name,
        email: firebaseUser.email || existingUser.email,
        photoURL: firebaseUser.photoURL || existingUser.photoURL,
      };

      await setDoc(userRef, updated, { merge: true });
      setUser(updated);
    } catch (error) {
      console.error('Existing sign in error:', error);
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
    signInExistingWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};