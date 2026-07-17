import axios from 'axios';

/**
 * Same-origin base ("/api") proxied by Vite to the backend, so the httpOnly
 * auth cookie is first-party. withCredentials ensures cookies ride along.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  // Identifies this as the admin panel so the backend stores/reads its JWT under
  // a separate cookie (access_token_admin) — independent of the employee web's
  // session on the same host.
  headers: { 'X-App': 'admin' },
});

// The backend wraps success responses as { success, data }. Unwrap to data.
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // Normalize the error message coming from { success:false, message }.
    const message =
      error?.response?.data?.message || error?.message || 'Request failed';
    error.apiMessage = Array.isArray(message) ? message.join(', ') : message;
    return Promise.reject(error);
  },
);
