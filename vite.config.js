import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages: repo dihosting di /dashboard-pusat-kendali-bank/
  base: '/dashboard-pusat-kendali-bank/',
  define: {
    // Dikunci ke app_id & backend URL asli dashboard ini, supaya build statis
    // (GitHub Pages) tidak salah ambil app_id dari environment lain.
    'import.meta.env.VITE_BASE44_APP_ID': JSON.stringify('6a4102fc1d41fdeee585025e'),
    'import.meta.env.VITE_BASE44_APP_BASE_URL': JSON.stringify('https://base44.app'),
  },
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ]
});
