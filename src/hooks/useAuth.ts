import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { isWebmasterEmail, UserRole } from '@/lib/roles';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdBy?: string;
  permissions?: string[];
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);

      if (user) {
        // ── Webmaster fast-path: check email first ──────────────────
        if (isWebmasterEmail(user.email)) {
          setCurrentUser(user);
          setUserData({
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || user.email!,
            role: 'webmaster',
            isActive: true,
            mustChangePassword: false,
          });
          setLoading(false);
          return;
        }

        // ── Core member: verify in Firestore ───────────────────────
        if (!db) {
          setError("Database connection error");
          setLoading(false);
          return;
        }

        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();

            if (!data.isActive) {
              setError("Your account has been deactivated. Contact a Webmaster.");
              await signOut(auth);
              setCurrentUser(null);
              setUserData(null);
              setLoading(false);
              return;
            }

            setCurrentUser(user);
            setUserData({
              uid: user.uid,
              email: user.email || data.email,
              displayName: data.displayName || data.name || user.email!,
              role: (data.role as UserRole) || 'core_member',
              isActive: data.isActive ?? true,
              mustChangePassword: data.mustChangePassword ?? false,
              createdBy: data.createdBy,
              permissions: data.permissions,
            });
          } else {
            setError("Unauthorized: Your account is not registered. Contact a Webmaster.");
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

  const isWebmaster = userData?.role === 'webmaster';
  const isCoreMember = userData?.role === 'core_member';

  return {
    currentUser,
    userData,
    loading,
    error,
    logout,
    isWebmaster,
    isCoreMember,
    // Legacy aliases so existing code doesn't break
    isAdmin: isWebmaster,
    isWriter: isCoreMember,
  };
};
