/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base path the axios client calls; Vite proxies it to the backend. */
  readonly VITE_API_BASE_URL?: string;
  /** Where the "/api" dev proxy forwards to (the NestJS backend origin). */
  readonly VITE_API_PROXY_TARGET?: string;
  /** Vite dev-server port. */
  readonly VITE_DEV_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
