/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  base: process.env.VITE_BASE_URL || '/',
  server: {
    port: 3000,
    proxy: {
      '/services': {
        target: 'https://ci-europa.kbase.us',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: process.env.BUILD_PATH || 'build',
    // Browser support: last 1 version of Chrome, Firefox, Safari, Edge
    // Query: npx browserslist "last 1 chrome version, last 1 firefox version, last 1 safari version, last 1 edge version"
    target: ['chrome143', 'firefox146', 'safari18', 'edge143'],
  },
  define: {
    // For libraries that check process.env
    'process.env': {},
  },
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    setupFiles: './src/setupTests.ts',
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
});
