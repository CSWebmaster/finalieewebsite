import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, maskUrl } from "@/lib/utils";

interface ImageLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  fallbackSrc?: string;
}

/**
 * ImageLoader Component
 * Handles image loading states with a Skeleton placeholder and 
 * provides a fallback SVG if the image fails to load.
 */
const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  className,
  containerClassName,
  fallbackSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><defs><linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%2300629B;stop-opacity:1'/><stop offset='100%' style='stop-color:%23004d7a;stop-opacity:1'/></linearGradient></defs><rect width='800' height='600' fill='url(%23grad)'/><circle cx='400' cy='300' r='150' fill='rgba(255,255,255,0.1)'/><text x='400' y='300' font-family='Arial' font-size='48' font-weight='bold' text-anchor='middle' fill='rgba(255,255,255,0.8)' dy='-10'>IEEE</text><text x='400' y='300' font-family='Arial' font-size='24' text-anchor='middle' fill='rgba(255,255,255,0.6)' dy='30'>Image Not Available</text></svg>",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(maskUrl(src));

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setError(false);
    setCurrentSrc(maskUrl(src));
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true); // Stop showing skeleton
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
};

export default ImageLoader;
