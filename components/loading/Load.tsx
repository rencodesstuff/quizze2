import { Loader2 } from "lucide-react";
import React, { ReactNode } from "react";

// Skeleton loader for text content
export const TextSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Skeleton loader for cards
export const CardSkeleton = () => (
  <div className="animate-pulse bg-white p-6 rounded-lg shadow-sm">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

// Loading overlay for full page/section loading
export const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

type SpinnerSize = 'small' | 'medium' | 'large';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
}

// Loading spinner component
export const LoadingSpinner = ({ size = "medium" }: LoadingSpinnerProps) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12"
  };

  return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />;
};

interface LoadingStateWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  type?: 'overlay' | 'skeleton' | 'spinner';
  skeletonCount?: number;
}

// Main loading state wrapper component
export const LoadingStateWrapper: React.FC<LoadingStateWrapperProps> = ({ 
  isLoading, 
  children, 
  type = "overlay",
  skeletonCount = 1 
}) => {
  if (!isLoading) return children;

  if (type === "overlay") {
    return (
      <div className="relative min-h-[200px]">
        {children}
        <LoadingOverlay />
      </div>
    );
  }

  if (type === "skeleton") {
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === "spinner") {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  return children;
};

export default LoadingStateWrapper;