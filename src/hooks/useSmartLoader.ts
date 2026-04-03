import { useState, useEffect, useRef } from "react";

export type LoaderType = "none" | "shimmer" | "skeleton" | "spinner" | "fallback";

interface SmartLoaderResult {
  loaderType: LoaderType;
  showError: boolean;
  timeElapsed: number;
}

/**
 * Hook to intelligently determine which loader type to show based on elapsed time.
 * Prevents "flash of loading" for fast operations and provides deeper feedback for slow ones.
 */
export function useSmartLoader(isLoading: boolean, isError: boolean = false): SmartLoaderResult {
  const [loaderType, setLoaderType] = useState<LoaderType>("none");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const startTime = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isLoading) {
      startTime.current = performance.now();
      setLoaderType("none"); // Start with nothing for the first 100ms

      timerRef.current = setInterval(() => {
        const elapsed = performance.now() - (startTime.current || 0);
        setTimeElapsed(elapsed);

        if (elapsed < 100) {
          setLoaderType("none");
        } else if (elapsed < 300) {
          setLoaderType("shimmer");
        } else if (elapsed < 1000) {
          setLoaderType("skeleton");
        } else if (elapsed < 3000) {
          setLoaderType("spinner");
        } else {
          setLoaderType("fallback");
        }
      }, 50); // check every 50ms for smooth transitions
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoaderType("none");
      setTimeElapsed(0);
      startTime.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  return {
    loaderType: isError ? "fallback" : loaderType,
    showError: isError,
    timeElapsed
  };
}
