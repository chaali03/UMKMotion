// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  // Netlify Adapter Configuration
  output: 'server',
  adapter: netlify({
  // Configuration options go here
}),

  // Existing configurations
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

  // Vite config
  vite: {
    plugins: [tailwindcss()],
    // Store Vite cache in system temp to avoid OneDrive/AV file locks on Windows
    cacheDir: path.resolve(os.tmpdir(), 'umkmotion-vite-cache'),
    server: {
      // OneDrive can lock files; polling reduces EPERM rename races
      watch: { usePolling: true, interval: 500 },
    },
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
      include: ['react', 'react-dom'],
      exclude: ['@react-three/fiber', '@react-three/drei'],
      // Disable pre-bundling on dev to avoid rename inside node_modules/.vite on OneDrive
      disabled: process.env.NODE_ENV === 'development'
    }
  }
});