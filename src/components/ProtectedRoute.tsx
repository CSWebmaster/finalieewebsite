import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'writer')[];
}

const ProtectedRoute = ({ children, allowedRoles = ['admin'] }: ProtectedRouteProps) => {
  const { currentUser, userData, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-[#00629B] animate-spin" />
          <div className="text-slate-400 font-medium tracking-wide">Authorizing Session...</div>
        </div>
      </div>
    );
  }

  // 1. Check if user is logged in
  if (!currentUser) {
    console.warn("[PROTECTED_ROUTE] No active session. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  // 2. Check for Role Authorization
  if (!userData || !allowedRoles.includes(userData.role)) {
    console.warn(`[PROTECTED_ROUTE] Unauthorized access attempt by ${currentUser.email} (Role: ${userData?.role || 'none'}). Required: ${allowedRoles.join(', ')}`);
    
    // If user is authenticated but not authorized for this specific area
    return <Navigate to="/login" state={{ error: "Unauthorized access: You don't have the required role for this page." }} replace />;
  }

  // 3. Authorized: Render children
  return <>{children}</>;
};

export default ProtectedRoute;