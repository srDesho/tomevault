// Global fetch interceptor for handling expired JWT tokens
// Automatically redirects to login when authentication fails
import { logout, getJwt } from '../services/AuthService';

let isRedirecting = false;
let originalFetch = null;

/**
 * Checks if the request should skip auth interception (public endpoints)
 */
const shouldSkipAuthCheck = (url, options = {}) => {
  const urlString = typeof url === 'string' ? url : url.url || '';
  const method = options.method?.toUpperCase() || 'GET';
  
  const publicEndpoints = [
    '/auth/login',
    '/auth/sign-up',
    '/books/search-google',
    '/books/google-api/',
  ];
  
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    urlString.includes(endpoint)
  );
  
  const isPublicBookView = method === 'GET' && 
                          urlString.match(/\/books\/[^/]+$/) &&
                          !urlString.includes('/increment-read') &&
                          !urlString.includes('/decrement-read');
  
  const isExternalAPI = urlString.includes('googleapis.com');
  
  return isPublicEndpoint || isPublicBookView || isExternalAPI;
};

/**
 * Checks if request has Authorization header
 */
const hasAuthHeader = (options = {}) => {
  const headers = options.headers || {};
  
  if (headers instanceof Headers) {
    return headers.has('Authorization');
  }
  
  if (typeof headers === 'object') {
    return 'Authorization' in headers || 'authorization' in headers;
  }
  
  return false;
};

/**
 * Checks if the response indicates an expired or invalid token
 */
const isTokenExpired = (response) => {
  return response.status === 401 || response.status === 403;
};

/**
 * Handles token expiration by logging out and redirecting to login
 */
const handleTokenExpiration = () => {
  if (isRedirecting) return;
  
  isRedirecting = true;
  console.warn('[AuthInterceptor] Token expired or invalid, redirecting to login');
  
  // Store current page before logout
  const currentPath = window.location.pathname;
  
  // Clear authentication data
  logout();
  
  // Store expiration message and return path in sessionStorage
  sessionStorage.setItem('sessionExpired', 'true');
  sessionStorage.setItem('returnPath', currentPath);
  
  // Redirect to login page
  setTimeout(() => {
    window.location.href = '/login';
    isRedirecting = false;
  }, 100);
};

/**
 * Wraps the native fetch function to intercept and handle authentication errors
 */
const fetchWithAuthInterceptor = async (...args) => {
  const [url, options = {}] = args;
  
  // Skip auth check for public endpoints OR requests without auth header
  if (shouldSkipAuthCheck(url, options) || !hasAuthHeader(options)) {
    return await originalFetch.apply(window, args);
  }
  
  try {
    const response = await originalFetch.apply(window, args);
    
    if (isTokenExpired(response)) {
      handleTokenExpiration();
      throw new Error('Sesión expirada');
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Replaces the global fetch function with our interceptor version
 */
export const setupAuthInterceptor = () => {
  originalFetch = window.fetch;
  window.fetch = fetchWithAuthInterceptor;
  
  console.log('[AuthInterceptor] Global fetch interceptor initialized');
  
  return () => {
    window.fetch = originalFetch;
  };
};

/**
 * Checks if there's a session expiration flag
 */
export const checkSessionExpired = () => {
  const expired = sessionStorage.getItem('sessionExpired') === 'true';
  if (expired) {
    sessionStorage.removeItem('sessionExpired');
  }
  return expired;
};

export default {
  setupAuthInterceptor,
  checkSessionExpired
};