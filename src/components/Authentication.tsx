import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Lock, Mail, ShieldAlert, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WEBMASTER_EMAILS = [
  "ieee.wm@socet.edu.in",
  "ieeewie.wm@silveroakuni.ac.in",
  "ieeecs.wm@silveroakuni.ac.in",
  "ieeesps.wm@silveroakuni.ac.in",
  "ieeesight.wm@silveroakuni.ac.in",
];

const Authentication = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!auth || !db) {
      setError("Firebase is not configured. Contact the development team.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Authenticate via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const user = userCredential.user;
      const userEmail = user.email!.trim().toLowerCase();

      // 2. Webmaster fast-path — identified by email
      let role: string | null = null;
      let mustChangePwd = false;
      
      if (WEBMASTER_EMAILS.includes(userEmail)) {
        role = "webmaster";
      }

      // 3. For all other users, read their Firestore doc by UID
      //    (The security rules allow: isLoggedIn() && request.auth.uid == uid)
      if (!role) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            role = data.role ?? null;
            mustChangePwd = data.mustChangePassword === true;
          } else {
            // Doc keyed by UID doesn't exist — try fallback by email field
            // (only works if Firestore rules allow it, otherwise will throw)
            try {
              const q = query(collection(db, "users"), where("email", "==", userEmail));
              const qSnap = await getDocs(q);
              if (!qSnap.empty) {
                const data = qSnap.docs[0].data();
                role = data.role ?? null;
                mustChangePwd = data.mustChangePassword === true;
              }
            } catch {
              // rules denied collection query — no profile found
            }
          }
        } catch (firestoreErr: any) {
          console.warn("[Auth] Firestore read failed:", firestoreErr?.message);
        }
      }

      // 4. Must have a recognised role
      if (!role) {
        await signOut(auth);
        setError("Unauthorized access. Your profile was not found in the database.");
        return;
      }

      // 5. Accept webmaster AND core_member roles (reject everything else)
      if (role !== "webmaster" && role !== "core_member") {
        await signOut(auth);
        setError("Unauthorized access. Admin privileges required.");
        return;
      }

      // 6. First-login password change redirect
      if (mustChangePwd) {
        navigate("/ieee-admin-portal-sou-2025");
        return;
      }

      // 7. Authorised — navigate to the portal
      console.log("[Auth] Login successful. Role:", role);
      navigate("/ieee-admin-portal-sou-2025");

    } catch (error: any) {
      console.error("Authentication failed:", error);

      switch (error.code) {
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/invalid-credential":
          setError("Invalid credentials. Please check your email and password.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed login attempts. Please try again later.");
          break;
        default:
          setError("Authentication failed. " + (error.message || "Please check your connection and try again."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
      {/* Background gradients and blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00629B]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#00629B]/10 blur-[120px]" />
      </div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-[#00629B]/20 rounded-full flex items-center justify-center mb-4 border border-[#00629B]/30 shadow-[0_0_15px_rgba(0,98,155,0.3)]">
            <Lock className="w-8 h-8 text-[#00629B]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Portal</h2>
          <p className="text-slate-400 text-sm text-center">
            Sign in to access the IEEE SOU SB dashboard.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-950/50 border-red-900/50 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                placeholder="admin@ieeesousb.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00629B] focus:border-transparent transition-all duration-200"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldAlert className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00629B] focus:border-transparent transition-all duration-200"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#00629B] hover:bg-[#004f7c] text-white font-medium rounded-xl transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-[0_5px_15px_rgba(0,98,155,0.4)] active:translate-y-[0px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} IEEE Silver Oak University Student Branch
          </p>
          <p className="text-xs text-slate-600 mt-1">
            For admin access, please contact the development team
          </p>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
