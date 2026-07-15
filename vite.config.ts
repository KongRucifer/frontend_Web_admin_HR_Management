import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// The admin calls the API through a same-origin "/api" proxy so the httpOnly
// auth cookie is first-party (SameSite=Lax works without HTTPS in dev).
// Dev-server port and proxy target come from .env (see .env.example).
export default defineConfig(({ mode }) => {
  // Load every env var (no VITE_ filter) so the proxy target is available here.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: Number(env.VITE_DEV_PORT) || 5173,
      proxy: {
        '/api': {
          // IPv4 loopback avoids clashing with anything bound to ::1:3000.
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
