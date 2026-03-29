import React from 'react';
import { cn } from '@/lib/utils';

type ContainerWrapperProps = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
};

export default function ContainerWrapper({
  children,
  className,
  fullWidth = false,
}: ContainerWrapperProps) {
  return (
    <div 
      className={cn(
        "w-full overflow-hidden",
        !fullWidth && "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}