
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
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
      clientPort: 8080
    }
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
