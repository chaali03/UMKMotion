// Lazy loading utilities for heavy components
import React, { lazy, Suspense } from 'react';

// Map components - only load when needed
// Note: MapComponent file does not exist anymore; point to MapboxComponent to avoid build errors
export const LazyMapComponent = lazy(() => import('@/RumahUMKM/map/MapboxComponent'));
export const LazyMapboxComponent = lazy(() => import('@/RumahUMKM/map/MapboxComponent'));

// 3D components - only load when needed  
export const LazyGlobe = lazy(() => import('@/components/ui/globe'));
export const LazyCobe = lazy(() => import('@/components/ui/interactive-card-stack'));

// Heavy animation components
export const LazyProductGallery = lazy(() => import('@/LandingPage/components/productgallery/ProductGallery'));
export const LazyTestimonialSection = lazy(() => import('@/konsultan/testimonial/TestimonialSection'));

// Utility function for loading with fallback
export const withSuspense = (Component: React.ComponentType<any>, fallback?: React.ReactNode) => {
  const WrappedComponent = (props: any) => {
    const fallbackNode = fallback || React.createElement('div', { className: 'animate-pulse bg-gray-200 rounded h-32' });
    return React.createElement(
      Suspense,
      { fallback: fallbackNode },
      React.createElement(Component as any, { ...props })
    );
  };
  return WrappedComponent;
};

// Preload function for critical components
export const preloadComponent = (importFn: () => Promise<any>) => {
  const componentImport = importFn();
  return componentImport;
};

// Dynamic import with error boundary
export const dynamicImport = async (importFn: () => Promise<any>) => {
  try {
    return await importFn();
  } catch (error) {
    console.warn('Failed to load component:', error);
    return null;
  }
};
