"use client";
import React, { lazy, Suspense } from 'react';

// Lazy load heavy components
const Feature = lazy(() => import('../LandingPage/components/feature/Feature'));
const CircularGallery = lazy(() => import('./CircularGallery'));

const LoadingSkeleton = () => (
  <div aria-hidden className="w-full">
    {/* Transparent placeholder to avoid gray flash */}
    <div
      className="w-full"
      style={{
        height: '1px',
        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.03), transparent)',
      }}
    />
  </div>
);

export const LazyFeature = () => (
  <Suspense fallback={<LoadingSkeleton />}>
    <Feature />
  </Suspense>
);

// Provide gallery items from public assets
const GALLERY_ITEMS = [
  { image: '/asset/optimized/umkm/umkm1.webp', text: 'UMKM 1' },
  { image: '/asset/optimized/umkm/umkm2.webp', text: 'UMKM 2' },
  { image: '/asset/optimized/umkm/umkm3.webp', text: 'UMKM 3' },
  { image: '/asset/optimized/umkm/umkm4.webp', text: 'UMKM 4' },
  { image: '/asset/optimized/umkm/umkm5.webp', text: 'UMKM 5' },
  { image: '/asset/optimized/umkm/umkm6.webp', text: 'UMKM 6' },
];

export const LazyCircularGallery = () => (
  <Suspense fallback={<LoadingSkeleton />}>
    <CircularGallery items={GALLERY_ITEMS} className="h-full w-full" />
  </Suspense>
);

export default { LazyFeature, LazyCircularGallery };
