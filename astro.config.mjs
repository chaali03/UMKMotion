// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // FIX: Use static output for better asset handling
  output: 'static',
  adapter: netlify({
    edgeMiddleware: false,
  }),

  integrations: [react()],

  // FIX: Simplify build configuration
  build: {
    assets: 'assets',
    format: 'file'
  },

  vite: {
    plugins: [tailwindcss()],
    
    build: {
      // FIX: Ensure consistent asset naming
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name.split('.').pop();
            if (['css', 'js'].includes(ext)) {
              return `assets/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].[ext]`;
          }
        }
      },
      // FIX: Disable minification temporarily for debugging
      minify: false,
      cssMinify: false
    },
    
    optimizeDeps: {
      include: [
        'react', 
        'react-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
      ],
      force: false // FIX: Disable force optimization
    },
    
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  }
});