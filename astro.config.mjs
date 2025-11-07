// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify({}),
  integrations: [react()],

  // Performance optimizations
  build: {
    inlineStylesheets: 'auto',
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
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate heavy libraries
            'vendor-animation': ['framer-motion', 'gsap'],
            'vendor-maps': ['@react-google-maps/api', 'mapbox-gl', 'maplibre-gl'],
            'vendor-3d': ['three', '@react-three/fiber', '@react-three/drei', 'cobe'],
            'vendor-ui': ['lucide-react', '@radix-ui/react-icons']
          }
        }
      }
    },
    optimizeDeps: {
      force: true,
      include: [
        'react',
        'react-dom',
        'framer-motion',
        'motion/react',
        'lucide-react',
        '@radix-ui/react-slot',
        'class-variance-authority',
        'vaul',
        'ogl',
        // Firebase SDK modules
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage'
      ],
      exclude: ['@react-three/fiber', '@react-three/drei']
    }
  }
});