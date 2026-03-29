import React from "react";

interface SkeletonProps {
  /** Height of the skeleton block. Defaults to "200px". */
  height?: string;
  /** Width of the skeleton block. Defaults to "100%". */
  width?: string;
  /** Extra class names to apply. */
  className?: string;
  /** Rounded corners — pass a Tailwind border-radius token or "full" for a circle. */
  rounded?: "sm" | "md" | "lg" | "xl" | "full" | "none";
}

const radiusMap: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
};

/**
 * Skeleton — animated shimmer placeholder used while lazy-loaded
 * sections / data are still loading.
 *
 * Usage:
 *   <Skeleton height="180px" rounded="lg" />
 *   <Skeleton height="16px" width="60%" rounded="full" />  ← text line
 */
const Skeleton: React.FC<SkeletonProps> = ({
  height = "200px",
  width = "100%",
  className = "",
  rounded = "lg",
}) => {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        width,
        height,
        borderRadius: radiusMap[rounded],
        background: "linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%)",
        backgroundSize: "200% 100%",
        animation: "skeletonShimmer 1.4s ease-in-out infinite",
      }}
    />
  );
};

export default Skeleton;

// ── Dark-mode aware shimmer + keyframe (injected once globally) ──────────────
// We inject via a style tag so we don't need a separate CSS file.
const styleId = "__skeleton_shimmer_style__";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @keyframes skeletonShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .dark [aria-hidden="true"][style*="skeletonShimmer"] {
      background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%) !important;
      background-size: 200% 100% !important;
    }
  `;
  document.head.appendChild(style);
}
