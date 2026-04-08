import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'writer';
  enrollment_number?: string;
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      console.warn("[useAuth] Firebase Auth not initialized.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
      
      if (user) {
        if (!db) {
          console.error("[useAuth] Firestore not available.");
          setError("Database connection error");
          setLoading(false);
          return;
        }

        try {
          // STRICT RBAC: Fetch document by UID
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData({
              uid: user.uid,
              name: data.name || "User",
              email: user.email || data.email,
              role: data.role as 'admin' | 'writer',
              enrollment_number: data.enrollment_number
            });
            setCurrentUser(user);
          } else {
            console.warn(`[useAuth] Unauthorized: No document found for UID ${user.uid} in 'users' collection.`);
            setError("Unauthorized: Your account is not registered as an Admin or Writer.");
            // We don't auto-signout here because the UI might want to show a specific error
            setCurrentUser(user);
            setUserData(null);
          }
        } catch (err: any) {
          console.error("[useAuth] Firestore error:", err.code, err.message);
          setError(`Permission Error: ${err.message}`);
          setUserData(null);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return { currentUser, userData, loading, error, logout, isAdmin: userData?.role === 'admin', isWriter: userData?.role === 'writer' };
};
