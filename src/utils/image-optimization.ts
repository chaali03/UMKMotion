// Image optimization utilities

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  loading?: 'lazy' | 'eager';
}

// Generate optimized image URL
export const getOptimizedImageUrl = (
  src: string, 
  options: ImageOptimizationOptions = {}
): string => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // For local images, use Astro's image optimization
  if (src.startsWith('/')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', format);
    
    return `/_image?src=${encodeURIComponent(src)}&${params.toString()}`;
  }
  
  return src;
};

// Responsive image srcSet generator
export const generateSrcSet = (src: string, sizes: number[]): string => {
  return sizes
    .map(size => `${getOptimizedImageUrl(src, { width: size })} ${size}w`)
    .join(', ');
};

// Image component with optimization
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}> = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  loading = 'lazy',
  sizes = '100vw'
}) => {
  const optimizedSrc = getOptimizedImageUrl(src, { width, height });
  const srcSet = width ? generateSrcSet(src, [width * 0.5, width, width * 1.5, width * 2]) : undefined;
  
  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      decoding="async"
    />
  );
};

// Preload critical images
export const preloadImage = (src: string, options: ImageOptimizationOptions = {}) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(src, options);
  document.head.appendChild(link);
};

// Image format detection
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => resolve(webP.height === 2);
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Convert images to modern formats
export const convertToModernFormat = async (file: File): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const img = new Image();
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert image'));
      }, 'image/webp', 0.8);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
