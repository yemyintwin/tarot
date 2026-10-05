import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/icon.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/maskable.svg',
        'icons/maskable-512.png',
        'icons/apple-touch-icon.png',
      ],
      manifest: {
        name: 'Arcana — A ritual for reflection',
        short_name: 'Arcana',
        description: 'A quiet space for reflection.',
        theme_color: '#080a18',
        background_color: '#080a18',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,json,webp}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': decodeURIComponent(new URL('./src/', import.meta.url).pathname).replace(
        /^\/([A-Za-z]:\/)/,
        '$1',
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const packageName = id.match(
            /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(@[^/]+\/[^/]+|[^/]+)/,
          )?.[1];
          if (!packageName) {
            return;
          }
          if (['react', 'react-dom', 'scheduler'].includes(packageName)) {
            return 'vendor-react';
          }
          if (['react-router', 'react-router-dom'].includes(packageName)) {
            return 'vendor-router';
          }
          if (packageName.startsWith('@tanstack/')) {
            return 'vendor-query';
          }
          if (packageName === 'dexie') {
            return 'vendor-storage';
          }
          if (packageName === 'zod') {
            return 'vendor-schema';
          }
          if (packageName === 'zustand') {
            return 'vendor-state';
          }
          if (['framer-motion', 'motion-dom', 'motion-utils'].includes(packageName)) {
            return 'vendor-motion';
          }
        },
      },
    },
  },
});
