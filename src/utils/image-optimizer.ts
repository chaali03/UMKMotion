// Image optimization utility for better performance
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  fit?: 'crop' | 'fill' | 'scale';
}

/**
 * Optimizes Unsplash image URLs for better performance
 */
export function optimizeUnsplashImage(
  url: string, 
  options: ImageOptimizationOptions = {}
): string {
  const {
    width = 400,
    height = 300,
    quality = 80,
    format = 'webp',
    fit = 'crop'
  } = options;

  // Check if it's an Unsplash URL
  if (!url.includes('images.unsplash.com')) {
    return url;
  }

  // Build optimized URL with Unsplash parameters
  const baseUrl = url.split('?')[0];
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    q: quality.toString(),
    fit: fit,
    fm: format,
    auto: 'format,compress'
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generates responsive image srcset for different screen sizes
 */
export function generateResponsiveSrcSet(
  url: string,
  sizes: number[] = [320, 640, 768, 1024, 1280]
): string {
  return sizes
    .map(size => `${optimizeUnsplashImage(url, { width: size })} ${size}w`)
    .join(', ');
}

/**
 * Gets optimal image dimensions based on viewport
 */
export function getOptimalImageSize(containerWidth: number): ImageOptimizationOptions {
  if (containerWidth <= 320) return { width: 320, height: 240 };
  if (containerWidth <= 640) return { width: 640, height: 480 };
  if (containerWidth <= 768) return { width: 768, height: 576 };
  if (containerWidth <= 1024) return { width: 1024, height: 768 };
  return { width: 1280, height: 960 };
}
