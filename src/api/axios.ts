import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

// Safely access environment variable with fallback
// console.log('ENV = ', import.meta.env);
// console.log('API URL =', import.meta.env.VITE_API_URL);
// const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'https://kangaroo-rooms-backend.onrender.com/api';

const getBaseURL = () =>
  import.meta.env.VITE_API_URL || 'https://kangaroo-rooms-backend.onrender.com/api';
console.log('Using API Base URL:', getBaseURL());
console.log("import.meta.env = ", import.meta.env);
console.log("VITE_API_URL = ", import.meta.env.VITE_API_URL);
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach JWT token
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('kangaroo_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ─── Helper: Determine if 401 should trigger logout ────────────────────
// CRITICAL: Not all 401s mean session is invalid!
// 
// Definitive auth failures (should logout):
//   - /auth/me → token validation failed, session is definitely invalid
//   - /auth/verify-token → explicit token check failed
// 
// Optional/feature API failures (should NOT logout):
//   - /tenant-subscriptions/visibility → feature gating, may be 401 for guests
//   - /contacts/* → permission denied for specific resource
//   - /properties/* → resource access denied
//   - /rooms/* → public viewing may hit permission checks
// 
// Rule: Only logout on definitive auth validation endpoints, not permission denials
const isAuthValidationEndpoint = (url?: string): boolean => {
  if (!url) return false;
  
  // Definitive auth validation endpoints
  const authValidationPaths = [
    '/auth/me',
    '/auth/verify-token',
    '/auth/verify',
    '/auth/current'
  ];
  
  return authValidationPaths.some(path => url.includes(path));
};

// ─── Response interceptor — Smart 401 handling ──────────────────────────
// 401 handling strategy:
// 
// IF request is to auth validation endpoint (/auth/me, etc):
//   └─ 401 = token invalid/expired → session is definitely dead
//   └─ Dispatch forceLogout to clear auth state
//   └─ Reject promise (let components handle)
// 
// IF request is to optional/feature API:
//   └─ 401 = permission denied for that feature
//   └─ Do NOT logout (user session might be valid, just lacks permission)
//   └─ Just pass error through (component handles gracefully)
// 
// 403, 500, network errors, timeouts:
//   └─ Always pass through without destroying session
// 
// No global redirects or window.location usage!
axiosInstance.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const status = error.response?.status;
  const url = error.config?.url;

  // Only logout on 401 IF it's from an auth validation endpoint
  if (status === 401 && isAuthValidationEndpoint(url)) {
    try {
      // Lazy import to avoid circular dependency
      const {
        store
      } = await import('../store/store');
      const {
        forceLogout
      } = await import('../store/slices/auth.slice');
      
      // Session is definitively invalid → clear auth state
      store.dispatch(forceLogout());
      
      // ✅ Do NOT redirect. Let components decide when/if to navigate.
    } catch {
      // Fallback: direct localStorage clear if store import fails
      localStorage.removeItem('kangaroo_token');
      localStorage.removeItem('kangaroo_user');
    }
  }
  
  // All other 401s (permission denied on features), 403, 500, network errors, timeouts
  // → pass through without destroying session. Components/Redux handle gracefully.
  return Promise.reject(error);
});
export default axiosInstance;