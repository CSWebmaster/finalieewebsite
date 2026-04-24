import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// ─── Firebase configuration ───────────────────────────────────────────────────
// All VITE_FIREBASE_* vars must be set in:
//   Local dev   →  .env             (never committed to git)
//   Cloudflare  →  Pages › Settings › Environment Variables
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ─── Diagnostic Logging ───────────────────────────────────────────────────────
console.groupCollapsed("[Firebase] 🔍 Diagnostic Audit");
console.log("Config Keys Present:", Object.keys(firebaseConfig).filter(k => !!(firebaseConfig as any)[k]));
console.log("Project ID:", firebaseConfig.projectId || "❌ MISSING");
console.log("API Key (masked):", firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 5)}...` : "❌ MISSING");
console.log("Environment Context:", import.meta.env.MODE);
console.groupEnd();


// ─── Credential validation ────────────────────────────────────────────────────
const REQUIRED_VARS: [keyof typeof firebaseConfig, string][] = [
  ["apiKey",            "VITE_FIREBASE_API_KEY"],
  ["authDomain",        "VITE_FIREBASE_AUTH_DOMAIN"],
  ["projectId",         "VITE_FIREBASE_PROJECT_ID"],
  ["appId",             "VITE_FIREBASE_APP_ID"],
];

const missing = REQUIRED_VARS.filter(([key]) => !firebaseConfig[key]).map(([, env]) => env);

if (missing.length > 0) {
  // This error is visible in the browser console AND in Cloudflare build logs
  console.error(
    "[Firebase] ❌ Missing environment variables:",
    missing.join(", "),
    "\n→ Local: add them to your .env file",
    "\n→ Cloudflare: add them in Pages › Settings › Environment Variables",
  );
}

// ─── App initialization ───────────────────────────────────────────────────────
// getApps() check prevents "duplicate-app" errors on HMR / hot-reload
const app = (() => {
  if (getApps().length > 0) return getApps()[0];
  try {
    return initializeApp(firebaseConfig);
  } catch (err) {
    console.error("[Firebase] initializeApp failed:", err);
    return null;
  }
})();

// ─── Service exports ──────────────────────────────────────────────────────────
export const db        = app ? getFirestore(app) : (null as any);
export const auth      = app ? getAuth(app)      : (null as any);
export const functions = app ? getFunctions(app) : (null as any);
export const storage   = app ? getStorage(app)   : (null as any);

// Analytics — lazy, browser-only, won't crash if blocked by adblockers
export let analytics: any = null;
if (app && typeof window !== "undefined" && firebaseConfig.measurementId) {
  import("firebase/analytics")
    .then(({ getAnalytics, isSupported }) =>
      isSupported().then((ok) => {
        if (ok) analytics = getAnalytics(app!);
      })
    )
    .catch(() => { /* silently ignore — adblocker or unsupported env */ });
}

export default { auth, db, analytics, storage, functions };
