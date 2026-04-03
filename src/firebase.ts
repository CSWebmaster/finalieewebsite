import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase defensively
let app;
try {
  if (!firebaseConfig.apiKey) {
    console.warn("Firebase configuration is missing or incomplete. Some features like Auth and Firestore will not work.");
  }
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

// Export Firebase services safely
export const auth = app ? getAuth(app) : null as any;
export const db = app ? getFirestore(app) : null as any;
export const analytics = (app && typeof window !== "undefined" && firebaseConfig.measurementId) ? getAnalytics(app) : null;
export const storage = null; // Placeholder if not currently used

export default { auth, db, analytics, storage };
