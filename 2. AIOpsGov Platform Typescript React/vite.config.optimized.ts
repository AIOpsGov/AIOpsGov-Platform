import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Optimized Vite configuration for production deployment
// Includes code splitting for better performance with multiple dashboards
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks - these rarely change, so they cache well
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'fluentui-vendor': [
            '@fluentui/react-components',
            '@fluentui/react-icons',
          ],
          'query-vendor': ['@tanstack/react-query', 'axios'],
          
          // Shared components - used across dashboards
          'shared-components': [
            './src/shared/components/Layout/Layout',
            './src/shared/components/MetricsCard/MetricsCard',
            './src/shared/components/AlertsDropdown/AlertsDropdown',
          ],
        },
        // Asset naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Disable sourcemaps in production for smaller files
    sourcemap: false,
    // Use esbuild for minification (faster and already included with Vite)
    minify: 'esbuild',
    // Target modern browsers for smaller bundle
    target: 'es2015',
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,
  },
});
