import React from "react";
import Skeleton from "./Skeleton";

/**
 * CardSkeleton component
 * Mimics the layout of the event cards in Events.tsx 
 * providing a shimmer effect during data fetching.
 */
const CardSkeleton: React.FC = () => {
  return (
    <div className="glass flex flex-col rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 h-[450px]">
      {/* Image Placeholder - 4:3 Aspect Ratio */}
      <Skeleton height="60%" width="100%" rounded="none" />

      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Title Placeholder */}
        <Skeleton height="28px" width="80%" rounded="md" />

        {/* Date/Time Placeholder */}
        <Skeleton height="16px" width="40%" rounded="md" />

        {/* Description Placeholder */}
        <div className="space-y-2 mt-2">
          <Skeleton height="14px" width="100%" rounded="sm" />
          <Skeleton height="14px" width="90%" rounded="sm" />
        </div>

        {/* Button Placeholder */}
        <div className="mt-auto pt-2">
          <Skeleton height="36px" width="100px" rounded="md" />
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
