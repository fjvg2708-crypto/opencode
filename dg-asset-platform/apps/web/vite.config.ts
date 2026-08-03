import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: { port: 5173, host: true },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Grupo DG — Gestão de Ativos',
        short_name: 'DG Ativos',
        description: 'Gestão de viaturas, equipamentos, ferramentas e ativos do Grupo DG.',
        theme_color: '#0b3d91',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        // Substituir por ícones oficiais do Grupo DG (192/512 PNG) antes de produção.
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
      workbox: {
        // App-shell em cache; dados da API não são cacheados aqui — a fila
        // de escrita offline vive em IndexedDB (src/offline/db.ts).
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
});
