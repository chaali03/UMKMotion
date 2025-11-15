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
    defaultStrategy: 'tap'
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
    // Use a stable cache directory to avoid OS temp purges causing outdated optimize dep errors
    cacheDir: path.resolve(process.cwd(), 'node_modules/.vite'), 
    server: {
      // OneDrive can lock files; polling reduces EPERM rename races
      watch: { usePolling: true, interval: 500 },
    },
    build: {
      // Optimize bundle splitting
      // Let Rollup decide chunking to avoid circular chunk deps causing TDZ
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-icons': ['lucide-react'],
            'vendor-motion': ['framer-motion'],
            'vendor-ui': ['vaul']
          }
        }
      },
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
        'firebase/firestore',
        'firebase/storage',
        // Ensure vaul is pre-bundled to avoid 504 Outdated Optimize Dep
        'vaul',
        // Ensure Motion (Framer Motion v12 package) is pre-bundled
        'motion',
        'motion/react',
        // Add problematic dependencies
        'lucide-react',
        'framer-motion',
        'react-loader-spinner',
        // Prebundle qrcode to fix 504 Outdated Optimize Dep on dev
        'qrcode',
        // Prebundle date-fns and locales for CommentSection formatting
        'date-fns',
        'date-fns/locale',
        'date-fns/locale/id',
        // Fix 504 for UI utility libs used by components
        'class-variance-authority',
        '@radix-ui/react-slot',
        // Optimize OGL used by CircularGallery to prevent 504
        'ogl',
        // MapLibre for map picker in Profile
        'maplibre-gl'
      ],
      // Force re-optimize on dev startup to invalidate any stale cache
      force: true,
      // Exclude problematic deps from optimization if needed
      exclude: [],
    },
    // Ensure SSR bundles vaul instead of treating it as external
    ssr: {
      noExternal: ['vaul', 'motion', 'ogl', 'maplibre-gl']
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