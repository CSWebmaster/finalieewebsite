import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserData {
  id: string;
  name: string;
  email: string;
  enrollment_number: string;
  role: 'admin' | 'writer';
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
      
      if (user) {
        try {
          // Check if user exists in Firestore 'users' collection using email as document ID
          // The prompt says "Query users collection in Firestore", using email as ID is common 
          // but let's be safe and check if we should query by field. 
          // "users collection: users: - id, - name, - email, - enrollment_number, - role"
          
          const userRef = doc(db, 'users', user.email!);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data() as Omit<UserData, 'id'>;
            
            // Extract enrollment number from email if not already there
            // Example: 123456@silveroakuni.ac.in -> enrollment_number = 123456
            const emailPrefix = user.email!.split('@')[0];
            const enrollmentNumber = data.enrollment_number || emailPrefix;

            setUserData({
              id: userSnap.id,
              ...data,
              enrollment_number: enrollmentNumber
            });
            setCurrentUser(user);
          } else {
            // User authenticated in Firebase but NOT in our DB
            console.error("Unauthorized access: User not found in DB");
            setError("Unauthorized access");
            await signOut(auth);
            setCurrentUser(null);
            setUserData(null);
          }
        } catch (err: any) {
          console.error("Error fetching user data:", err);
          setError("Failed to verify user data");
          await signOut(auth);
          setCurrentUser(null);
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

  return { currentUser, userData, loading, error, logout };
};
