import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

type AllowedRole = 'webmaster' | 'core_member' | 'admin' | 'writer';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AllowedRole[];
}

const ProtectedRoute = ({
  children,
  allowedRoles = ['webmaster', 'core_member', 'admin', 'writer'],
}: ProtectedRouteProps) => {
  const { currentUser, userData, loading, isWebmaster } = useAuth();

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

  // 1. Must be logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Webmasters go through — identified purely by email in useAuth, no Firestore needed
  if (isWebmaster) {
    return <>{children}</>;
  }

  // 3. Core members — userData must be loaded and role must be in allowedRoles
  if (!userData || !allowedRoles.includes(userData.role as AllowedRole)) {
    return <Navigate to="/login" state={{ error: "Unauthorized access." }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
