import { useEffect, useRef } from "react";
import { trackComponentMount } from "@/lib/performance";

/**
 * Hook to measure the mount-to-paint duration for a React component.
 * Uses performance.now() and effects to calculate time-to-render.
 */
export function useLatencyTracker(componentName: string) {
  const mountStart = useRef<number>(performance.now());
  const hasLogged = useRef<boolean>(false);

  useEffect(() => {
    if (!hasLogged.current) {
      const duration = performance.now() - mountStart.current;
      trackComponentMount(componentName, duration);
      hasLogged.current = true;
    }
  }, [componentName]);
}

/**
 * Hook for tracking custom API/Action latency
 */
export function useActionTracker() {
  const startAction = (name: string) => {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      trackComponentMount(`Action: ${name}`, duration);
      return duration;
    };
  };

  return { startAction };
}
