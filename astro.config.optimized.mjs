// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  
  // Performance optimizations
  build: {
    inlineStylesheets: 'auto',
  },
  
  // Image optimization
  image: {
    domains: ['localhost'],
  },
  
  // Prefetch optimization
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'viewport'
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'src': path.resolve(__dirname, './src'),
        '@': path.resolve(__dirname, './src')
      }
    },
    
    // Bundle optimization
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate heavy libraries
            'vendor-animation': ['framer-motion', 'gsap'],
            'vendor-maps': ['@react-google-maps/api', 'leaflet', 'mapbox-gl', 'maplibre-gl'],
            'vendor-3d': ['three', '@react-three/fiber', '@react-three/drei', 'cobe'],
            'vendor-ui': ['lucide-react', '@radix-ui/react-icons']
          }
        }
      },
      
      // Minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    
    // Development optimizations
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@react-three/fiber', '@react-three/drei']
    }
  }
});
