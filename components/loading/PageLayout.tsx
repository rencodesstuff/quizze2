import React, { ReactNode, Suspense } from 'react';
import { LoadingStateWrapper } from './Load';

interface PageLayoutProps {
  children: ReactNode;
  isLoading: boolean;
  loadingType?: 'overlay' | 'skeleton' | 'spinner';
  skeletonCount?: number;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children,
  isLoading,
  loadingType = "overlay",
  skeletonCount = 1
}) => {
  return (
    <Suspense
      fallback={
        <LoadingStateWrapper 
          isLoading={true} 
          type={loadingType}
          skeletonCount={skeletonCount}
        >
          {children}
        </LoadingStateWrapper>
      }
    >
      <LoadingStateWrapper 
        isLoading={isLoading} 
        type={loadingType}
        skeletonCount={skeletonCount}
      >
        {children}
      </LoadingStateWrapper>
    </Suspense>
  );
};

export default PageLayout;