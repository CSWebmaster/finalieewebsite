import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures all external URLs use HTTPS to prevent Mixed Content warnings.
 * Also handles masking if required, but currently prioritizes security compliance.
 */
export function maskUrl(url: string | undefined): string {
  if (!url) return "";
  
  // Don't modify data URLs or local paths
  if (url.startsWith("data:") || url.startsWith("/") || url.startsWith("./")) {
    return url;
  }

  // Convert http to https for all external domains
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }

  return url;
}
