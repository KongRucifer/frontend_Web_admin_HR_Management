import { io, type Socket } from 'socket.io-client';

/**
 * Single socket.io connection to the backend's `/ws` namespace.
 *
 * Same-origin (through the `/socket.io` dev/prod proxy) so the browser attaches
 * the httpOnly `access_token_admin` cookie to the handshake — the gateway reads
 * it and authenticates the connection. `auth.app: 'admin'` tells the gateway to
 * prefer that per-app cookie.
 */
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/ws', {
      path: '/socket.io',
      withCredentials: true,
      autoConnect: false,
      auth: { app: 'admin' },
      // Websocket first; fall back to polling if a proxy blocks upgrades.
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
