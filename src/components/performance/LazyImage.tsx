import React, { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { logMetric } from "@/lib/performance";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  placeholderSrc?: string;
  threshold?: number;
}

/**
 * LazyImage Component
 * Implements intersection-based lazy loading with real-time latency measurement 
 * and shimmer/placeholder logic.
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  placeholderSrc,
  threshold = 200, // Show skeleton if load takes >200ms
  ...props
}) => {
  const [isIntersected, setIsIntersected] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState(false);
  
  const startTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before viewport
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isIntersected && !isLoaded) {
      startTime.current = performance.now();
      
      // Delay showing skeleton to avoid "flash" for fast connections
      timerRef.current = setTimeout(() => {
        if (!isLoaded) setShowSkeleton(true);
      }, threshold);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isIntersected, isLoaded, threshold]);

  const handleLoad = () => {
    const duration = performance.now() - startTime.current;
    setIsLoaded(true);
    setShowSkeleton(false);
    
    logMetric({
      name: `Image: ${alt || src}`,
      duration,
      type: "image",
      timestamp: Date.now()
    });
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
    setShowSkeleton(false);
  };

  return (
    <div 
      ref={containerRef} 
      className={cn("relative overflow-hidden bg-muted/20", containerClassName)}
    >
      {showSkeleton && (
        <div className="absolute inset-0 bg-muted/40 animate-pulse flex items-center justify-center">
           <Skeleton className="w-full h-full" />
        </div>
      )}
      
      {isIntersected && (
        <img
          {...props}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          className={cn(
            "transition-all duration-700 ease-in-out",
            isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm",
            className
          )}
        />
      )}
      
      {error && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground">
          Failed to load image
        </div>
      )}
    </div>
  );
};
