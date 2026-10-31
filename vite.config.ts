import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';import tailwind from '@tailwindcss/vite';import {VitePWA} from 'vite-plugin-pwa';
// PWA: precache app shell, auto-update SW. Vendor chunk split keeps the entry bundle small; views are lazy (see App.tsx).
export default defineConfig({plugins:[react(),tailwind(),VitePWA({registerType:'autoUpdate',manifest:{name:'Money Manager',short_name:'Money',display:'standalone',background_color:'#09090b',theme_color:'#09090b',start_url:'/',icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]}})],
build:{rollupOptions:{output:{manualChunks:{vendor:['react','react-dom','zustand','framer-motion']}}}}});
