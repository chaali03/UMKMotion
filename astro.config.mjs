// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import viteCompression from 'vite-plugin-compression';

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
    assets: '_astro',
    // Use temp directory if dist is locked (OneDrive issue workaround)
    ...(process.env.ASTRO_TEMP_OUTPUT ? { 
      outDir: process.env.ASTRO_TEMP_OUTPUT 
    } : {}),
  },
  
  // Remove experimental config that doesn't exist

  // Prefetch optimization
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'viewport'
  },

  // Vite config
  vite: {
    plugins: [
      tailwindcss(),
      // Pre-compress assets for better TTFB - cast to any to avoid type conflicts
      ...(process.env.NODE_ENV === 'production' ? [
        /** @type {any} */ (viteCompression({ algorithm: 'brotliCompress' })),
        /** @type {any} */ (viteCompression({ algorithm: 'gzip' })),
      ] : []),
    ],
    // Store Vite cache in system temp to avoid OneDrive/AV file locks on Windows
    cacheDir: path.resolve(os.tmpdir(), 'umkmotion-vite-cache'),
    server: {
      // OneDrive can lock files; polling reduces EPERM rename races
      watch: { usePolling: true, interval: 500 },
    },
    build: {
      // Optimize bundle splitting
      // Let Rollup decide chunking to avoid circular chunk deps causing TDZ
      rollupOptions: {},
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Enable minification
      minify: true
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'three', 
        'firebase/app', 
        'firebase/auth', 
        'firebase/firestore'
      ],
      force: true
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        'src': path.resolve(__dirname, './src')
      }
    }
  }
});