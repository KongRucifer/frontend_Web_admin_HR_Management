import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// The admin calls the API through a same-origin "/api" proxy so the httpOnly
// auth cookie is first-party (SameSite=Lax works without HTTPS in dev).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // IPv4 loopback avoids clashing with anything bound to ::1:3000.
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
});
