import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev proxy keeps API + cookies on the same origin (localhost:5173), so the
// httpOnly JWT cookie works without any cross-site cookie configuration.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : '/ecommerce-mern/',

  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
}));
