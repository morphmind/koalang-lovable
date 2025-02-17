
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { componentTagger } from "lovable-tagger";
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  envDir: '.',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 8080,
    host: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443,
      path: '/hmr/'
    }
  },
  define: {
    'process.env.ROUTER_FUTURE_FLAGS': JSON.stringify({
      v7_startTransition: true,
      v7_relativeSplatPath: true
    })
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./src")
    }
  }
}));

