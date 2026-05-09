import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    inspectAttr(),
    react(),
    // PWA: precache shell + auto-update strategy.
    // Workbox genera sw.js a build time. In dev viene servito un fake registry
    // (nessun caching aggressivo che intralcia HMR).
    VitePWA({
      registerType: 'prompt',           // mostra banner "Update available" via virtual:pwa-register
      injectRegister: false,             // registriamo a mano in main.tsx per controllo fine
      manifest: false,                   // usiamo il nostro manifest.webmanifest in public/
      workbox: {
        // Asset statici precached. Le API Supabase NON vengono cached: stale data
        // farebbe più male che bene.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,woff,woff2,ico}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/rest/, /^\/storage/, /^\/auth/],
        runtimeCaching: [
          {
            // Asset Google Fonts: cache 1 anno (stale-while-revalidate).
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,                  // tienilo OFF in dev per non intralciare HMR
      },
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
