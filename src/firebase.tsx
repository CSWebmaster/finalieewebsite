import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Import getFirestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if config is valid
let app;
let auth;
let db;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Analytics is optional and might fail in some environments
    if (firebaseConfig.measurementId) {
      getAnalytics(app);
    }
    console.log("Firebase initialized successfully");
  } else {
    console.warn("Firebase configuration is missing. Make sure to set VITE_FIREBASE_API_KEY in your .env file.");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// ✅ Export the auth and db objects (providing fallback values if initialization failed)
export { auth, db };
