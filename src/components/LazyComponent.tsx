import React, { Suspense, lazy } from 'react';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyWrapper: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 rounded h-32 w-full"></div> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Lazy load heavy components
export const LazyMapboxComponent = lazy(() => 
  import('../RumahUMKM/map/MapboxComponent').then(module => ({ default: module.default }))
);

export const LazyThreeComponent = lazy(() => 
  import('../components/ui/globe').then(module => ({ default: module.default }))
);

export const LazyAIPage = lazy(() => 
  import('../ai/AIPage').then(module => ({ default: module.default }))
);

export const LazyScrollComponent = lazy(() => 
  import('../LandingPage/components/scroll/Scroll').then(module => ({ default: module.default }))
);

export default LazyWrapper;
