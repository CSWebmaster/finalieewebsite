import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  easing: 'ease',
  speed: 500,
  minimum: 0.3
});

/**
 * TopLoader component that handles global progress bar for route transitions.
 * Uses nprogress library (already in package.json).
 */
export default function TopLoader() {
  const location = useLocation();

  useEffect(() => {
    // Start progress on every route change
    NProgress.start();
    
    // Complete progress immediately as this is a simple implementation
    // In a more complex app, you might wait for data fetching.
    const timer = setTimeout(() => {
      NProgress.done();
    }, 100);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);

  return null;
}
