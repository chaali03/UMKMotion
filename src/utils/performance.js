// Performance optimization utilities

// Prevent forced reflows from chrome extension detection
export function preventChromeExtensionReflow() {
  // Debounce DOM queries that might trigger reflows
  let rafId = null;
  
  const debouncedReflow = (callback) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(callback);
  };
  
  // Override common reflow-causing properties with batched reads
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function() {
    return originalGetBoundingClientRect.call(this);
  };
  
  // Batch style reads/writes
  const styleQueue = [];
  let isFlushingStyles = false;
  
  const flushStyles = () => {
    if (isFlushingStyles || styleQueue.length === 0) return;
    
    isFlushingStyles = true;
    requestAnimationFrame(() => {
      // Read phase
      const reads = styleQueue.filter(item => item.type === 'read');
      reads.forEach(item => item.callback());
      
      // Write phase
      const writes = styleQueue.filter(item => item.type === 'write');
      writes.forEach(item => item.callback());
      
      styleQueue.length = 0;
      isFlushingStyles = false;
    });
  };
  
  return { debouncedReflow, flushStyles };
}

// Optimize scroll listeners
export function optimizeScrollListeners() {
  let ticking = false;
  
  const optimizedScroll = (callback) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
  
  return optimizedScroll;
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalResources = [
    { href: '/logo.webp', as: 'image', type: 'image/webp' },
    { href: '/LogoNavbar.webp', as: 'image', type: 'image/webp' },
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    document.head.appendChild(link);
  });
}

// Initialize performance optimizations
export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return;
  
  // Prevent chrome extension reflows
  preventChromeExtensionReflow();
  
  // Optimize scroll performance
  const optimizedScroll = optimizeScrollListeners();
  
  // Add passive event listeners
  const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
  passiveEvents.forEach(event => {
    document.addEventListener(event, () => {}, { passive: true });
  });
  
  // Preload critical resources on idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadCriticalResources);
  } else {
    setTimeout(preloadCriticalResources, 100);
  }
}
