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
    resolve: {
      alias: {
        'src': path.resolve(__dirname, './src'),
        '@': path.resolve(__dirname, './src')
      }
    },

    // TAMBAHIN INI AJA BRO! (cuma 1 baris)
    define: {
      'process.env': 'import.meta.env',
    },
    // END OF TAMBAHAN

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
      exclude: ['@react-three/fiber', '@react-three/drei']
    }
  }
});