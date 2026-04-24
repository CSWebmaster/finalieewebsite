import React from "react";

interface LinkedInIconProps {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Renders the official LinkedIn SVG wrapped in a styled anchor.
 * If `href` is empty / undefined → renders a disabled ghost icon (opacity 0.35, pointer-events none).
 */
export default function LinkedInIcon({ href, onClick }: LinkedInIconProps) {
  const hasUrl = Boolean(href && href.trim() !== "" && href !== "#");

  return (
    <a
      href={hasUrl ? href : "#"}
      target={hasUrl ? "_blank" : undefined}
      rel="noopener noreferrer"
      aria-label="LinkedIn profile"
      className="social-icon-link"
      style={!hasUrl ? { opacity: 0.35, pointerEvents: "none" } : undefined}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037
        -1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046
        c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z
        M5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065z
        m1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729
        v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729
        C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    </a>
  );
}
