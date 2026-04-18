import React from "react";
import { LoaderType } from "@/hooks/useSmartLoader";
import { Skeleton } from "@/components/ui/skeleton";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface SmartLoaderProps {
  type: LoaderType;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  onRetry?: () => void;
  message?: string;
}

/**
 * SmartLoader Component
 * Renders the appropriate UI feedback based on the detected latency type.
 */
export const SmartLoader: React.FC<SmartLoaderProps> = ({
  type,
  children,
  skeleton,
  onRetry,
  message = "Loading experience..."
}) => {
  if (type === "none") {
    return <>{children}</>; // Fast path: render children directly
  }

  if (type === "shimmer") {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer -translate-x-full" />
        {skeleton || <Skeleton className="w-full h-32" />}
      </div>
    );
  }

  if (type === "skeleton") {
    return (
      <div className="animate-pulse">
        {skeleton || (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
      </div>
    );
  }

  if (type === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px]">
        <Loader />
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    );
  }

  if (type === "fallback") {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[300px] border-2 border-dashed rounded-xl bg-muted/30">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="text-center">
          <h3 className="font-semibold">Taking longer than expected</h3>
          <p className="text-sm text-muted-foreground">The connection might be slow or unstable.</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
