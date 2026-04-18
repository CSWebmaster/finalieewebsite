import { 
  signInWithEmailAndPassword as firebaseSignIn,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth as firebaseAuth } from "../firebase";

export interface User {
  email: string;
  role?: string;
  name?: string;
  enrollment_number?: string;
}

type AuthListener = (user: User | null) => void;

const listeners = new Set<AuthListener>();
let currentUser: User | null = null;

const notify = () => {
  listeners.forEach((listener) => listener(currentUser));
};

const normalizeUser = (user: FirebaseUser | any): User => ({
  email: String(user?.email || ""),
  role: user?.role, // Note: standard Firebase Auth doesn't have role, typically fetched from Firestore
  name: user?.displayName || user?.name,
  enrollment_number: user?.enrollment_number,
});

// Initialize SDK listener
firebaseOnAuthStateChanged(firebaseAuth, (user) => {
  currentUser = user ? normalizeUser(user) : null;
  notify();
});

export const auth = {
  get currentUser() {
    return currentUser;
  },
  signOut: () => signOut(auth),
};

export const onAuthStateChanged = (_auth: any, listener: AuthListener) => {
  listeners.add(listener);
  listener(currentUser);
  return () => {
    listeners.delete(listener);
  };
};

export const signInWithEmailAndPassword = async (
  _auth: any,
  email: string,
  password: string,
) => {
  try {
    const userCredential = await firebaseSignIn(firebaseAuth, email, password);
    currentUser = normalizeUser(userCredential.user);
    notify();
    return { user: currentUser };
  } catch (error: any) {
    // Maintain error interface for components
    const normalizedError = new Error(error?.message || "Authentication failed.") as Error & {
      code?: string;
    };
    normalizedError.code = error?.code || "auth/invalid-credential";
    throw normalizedError;
  }
};

export const signOut = async (_auth: any) => {
  try {
    await firebaseSignOut(firebaseAuth);
  } finally {
    currentUser = null;
    notify();
  }
};
