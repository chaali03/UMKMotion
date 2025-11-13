"use client";
import React, { lazy, Suspense } from 'react';

// Lazy load heavy components
const Feature = lazy(() => import('../LandingPage/components/feature/Feature'));
const CircularGallery = lazy(() => import('./CircularGallery'));

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const LazyFeature = () => (
  <Suspense fallback={<LoadingSkeleton />}>
    <Feature />
  </Suspense>
);

export const LazyCircularGallery = () => (
  <Suspense fallback={<LoadingSkeleton />}>
    <CircularGallery />
  </Suspense>
);

export default { LazyFeature, LazyCircularGallery };
