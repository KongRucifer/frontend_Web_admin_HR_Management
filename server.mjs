// Production "door" for the web admin.
//
// In dev, Vite serves the app and proxies /api to the backend. A production
// `vite build` is just static files with NO proxy, so this tiny server takes
// over BOTH jobs the dev server did:
//   1. serve the built SPA from dist/
//   2. forward /api to the backend on localhost
//
// Keeping the API same-origin (/api) is deliberate: the auth cookie stays
// first-party, so SameSite=Lax works and the browser never sees a cross-site
// request. The backend can then stay bound to localhost, unreachable from the
// internet — this process is the only public surface.
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Node does not read .env on its own the way Vite does, so load it here (Node
// 20.6+ built-in — no dependency). Optional: real env vars, e.g. from pm2,
// still win because loadEnvFile does not overwrite ones already set.
try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch {
  // No .env file — rely on whatever the process was started with.
}

// PORT     — the public door (matches the URL, e.g. 8086).
// BACKEND  — where the NestJS backend actually listens (private, localhost).
const PORT = Number(process.env.PORT) || 8086;
const BACKEND = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:3000';
const distDir = path.join(__dirname, 'dist');

const app = express();

// Forward the API to the backend, untouched. `pathFilter` (not an express mount
// path) is what keeps the `/api` prefix on the forwarded URL — mounting on
// '/api' would strip it, and the backend's global `api` prefix would then 404.
app.use(
  createProxyMiddleware({
    target: BACKEND,
    changeOrigin: true,
    pathFilter: '/api',
  }),
);

// Static build. `index: false` so the SPA-fallback below owns "/".
app.use(express.static(distDir, { index: false }));

// SPA fallback: the app uses BrowserRouter, so a hard refresh on /employees is
// a real HTTP GET the server has no file for. Every non-API, non-asset path
// returns index.html and lets the client router take it from there.
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚪 Web admin door on http://0.0.0.0:${PORT}  →  API ${BACKEND}`);
});
