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
    inlineStylesheets: 'never', // Prevent CSS inlining to enable better caching
    assets: '_astro', // Consistent asset naming
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
      // Pre-compress assets for better TTFB
      viteCompression({ algorithm: 'brotliCompress' }),
      viteCompression({ algorithm: 'gzip' }),
    ],
    // Store Vite cache in system temp to avoid OneDrive/AV file locks on Windows
    cacheDir: path.resolve(os.tmpdir(), 'umkmotion-vite-cache'),
    server: {
      // OneDrive can lock files; polling reduces EPERM rename races
      watch: { usePolling: true, interval: 500 },
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        'src': path.resolve(__dirname, './src'),
        '@': path.resolve(__dirname, './src'),
        '@homepagelayout': path.resolve(__dirname, './src/layouts/HomepageLayout.astro')
      }
    },
    // Ensure jsx uses production runtime helpers (avoid jsxDEV in bundles)
    esbuild: {
      target: 'es2022',
      jsx: 'automatic',
      jsxDev: false,
      jsxImportSource: 'react'
    },

    build: {
      target: 'es2022',
      minify: 'esbuild', // Enable aggressive minification
      cssMinify: 'esbuild', // Minify CSS
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // More aggressive code splitting to reduce unused JS
            if (id.includes('node_modules')) {
              // Split large libraries into separate chunks
              if (id.includes('framer-motion')) return 'vendor-framer';
              if (id.includes('gsap')) return 'vendor-gsap';
              if (id.includes('mapbox') || id.includes('maplibre')) return 'vendor-maps';
              if (id.includes('three') || id.includes('@react-three')) return 'vendor-3d';
              if (id.includes('lucide') || id.includes('@radix-ui')) return 'vendor-ui';
              if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
              if (id.includes('firebase')) return 'vendor-firebase';
              // Group other vendor libs
              return 'vendor-misc';
            }
            // Split by feature/page
            if (id.includes('/LandingPage/')) return 'page-landing';
            if (id.includes('/Home/')) return 'page-home';
            if (id.includes('/components/')) return 'components';
          },
          // Optimize chunk sizes
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.js', '') : 'chunk';
            return `js/${facadeModuleId || 'chunk'}-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || 'asset';
            const info = name.split('.');
            const ext = info[info.length - 1];
            if (/\.(css)$/.test(name)) {
              return `css/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          }
        }
      }
    },

    optimizeDeps: {
      // In dev on OneDrive, avoid optimizer touching node_modules/.vite (helps file locks)
      noDiscovery: process.env.NODE_ENV === 'development',
      include: ['react', 'react-dom'],
      // Prevent optimizer from touching native/build-time libs that break when bundled
      exclude: [
        '@react-three/fiber',
        '@react-three/drei',
        'lightningcss',
        '@babel/core',
        '@babel/preset-typescript'
      ]
    },
    ssr: {
      // Let Node handle React CJS directly to avoid 'module is not defined'
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime']
    }
  }
});