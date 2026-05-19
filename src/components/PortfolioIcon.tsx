import React from "react";

interface PortfolioIconProps {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Renders a premium Portfolio/Personal Website Globe SVG wrapped in a styled anchor.
 * Fits perfectly alongside LinkedInIcon. Only renders if a valid URL is provided.
 */
export default function PortfolioIcon({ href, onClick }: PortfolioIconProps) {
  const hasUrl = Boolean(href && href.trim() !== "" && href !== "#");

  if (!hasUrl) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Portfolio website"
      className="social-icon-link hover:text-emerald-500 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30 transition-all duration-200"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    </a>
  );
}
