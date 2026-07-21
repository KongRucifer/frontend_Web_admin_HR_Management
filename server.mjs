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

// A proxied connection that drops mid-flight (a browser refresh, the backend
// restarting, an idle WebSocket timing out) surfaces as ECONNRESET. http-proxy
// re-emits it as an 'error' event; with NO handler, Node treats it as fatal and
// kills the whole door. Swallow it so one dropped socket never takes it down.
function onProxyError(err, _req, resOrSocket) {
  // eslint-disable-next-line no-console
  console.error('[proxy]', err?.code || err?.message || err);
  if (resOrSocket && typeof resOrSocket.writeHead === 'function') {
    if (!resOrSocket.headersSent) {
      try {
        resOrSocket.writeHead(502, { 'Content-Type': 'text/plain' });
      } catch {
        /* headers already gone */
      }
    }
    try {
      resOrSocket.end('Bad gateway');
    } catch {
      /* response already closed */
    }
  } else if (resOrSocket && typeof resOrSocket.destroy === 'function') {
    // WebSocket upgrade: resOrSocket is the raw socket — just drop it.
    resOrSocket.destroy();
  }
}

const app = express();

// Forward the API to the backend, untouched. `pathFilter` (not an express mount
// path) is what keeps the `/api` prefix on the forwarded URL — mounting on
// '/api' would strip it, and the backend's global `api` prefix would then 404.
app.use(
  createProxyMiddleware({
    target: BACKEND,
    changeOrigin: true,
    pathFilter: '/api',
    on: { error: onProxyError },
  }),
);

// Real-time notifications (socket.io). Same-origin so the handshake carries the
// first-party admin cookie. Kept as its own middleware so its `upgrade` handler
// can be bound to the HTTP server below (ws proxying needs the upgrade event).
const wsProxy = createProxyMiddleware({
  target: BACKEND,
  changeOrigin: true,
  ws: true,
  pathFilter: '/socket.io',
  on: { error: onProxyError },
});
app.use(wsProxy);

// Static build. `index: false` so the SPA-fallback below owns "/".
app.use(express.static(distDir, { index: false }));

// SPA fallback: the app uses BrowserRouter, so a hard refresh on /employees is
// a real HTTP GET the server has no file for. Every non-API, non-asset path
// returns index.html and lets the client router take it from there.
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚪 Web admin door on http://0.0.0.0:${PORT}  →  API ${BACKEND}`);
});

// The 'upgrade' handshake bypasses the express middleware chain, so the ws
// proxy must be attached to the raw server for socket.io to connect. The
// per-socket 'error' listener is essential: a client that vanishes mid-stream
// throws ECONNRESET on the raw socket, which would otherwise be unhandled.
server.on('upgrade', (req, socket, head) => {
  socket.on('error', (e) => {
    // eslint-disable-next-line no-console
    console.error('[ws socket]', e?.code || e?.message || e);
  });
  wsProxy.upgrade(req, socket, head);
});

// Last-resort guard: a stray ECONNRESET/EPIPE from a dropped connection must
// never crash the door. Anything else is logged (and left to pm2 to restart).
process.on('uncaughtException', (err) => {
  if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE')) {
    // eslint-disable-next-line no-console
    console.error('[ignored socket error]', err.code);
    return;
  }
  // eslint-disable-next-line no-console
  console.error('[uncaughtException]', err);
});
