// This utility handles expired JWT tokens globally across the application
// It intercepts fetch responses and automatically redirects to login when unauthorized

import { logout, getJwt } from '../services/AuthService';

let isRedirecting = false;
let originalFetch = null;

/**
 * Checks if the request should skip auth interception (public endpoints)
 * @param {string|Request} url - The request URL or Request object
 * @param {Object} options - Fetch options containing method, headers, etc.
 * @returns {boolean} True if request should skip auth check
 */
const shouldSkipAuthCheck = (url, options = {}) => {
  const urlString = typeof url === 'string' ? url : url.url || '';
  const method = options.method?.toUpperCase() || 'GET';
  
  // Public endpoints that never require auth
  const publicEndpoints = [
    '/auth/login',
    '/auth/sign-up',
    '/books/search-google',      // Public search
    '/books/google-api/',         // Public Google API access
  ];
  
  // Check if URL matches any public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    urlString.includes(endpoint)
  );
  
  // GET requests to /books/{id} are public (viewing details)
  const isPublicBookView = method === 'GET' && 
                          urlString.match(/\/books\/[^/]+$/) &&
                          !urlString.includes('/increment-read') &&
                          !urlString.includes('/decrement-read');
  
  // External APIs (Google Books)
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
 * @param {Response} response - Fetch API response object
 * @returns {boolean} True if token is expired/invalid
 */
const isTokenExpired = (response) => {
  return response.status === 401 || response.status === 403;
};

/**
 * Handles token expiration by logging out and redirecting to login
 * Shows a user-friendly message about session expiration
 */
const handleTokenExpiration = () => {
  if (isRedirecting) return;
  
  isRedirecting = true;
  console.warn('[AuthInterceptor] Token expired or invalid, redirecting to login');
  
  // Clear authentication data
  logout();
  
  // Store expiration message in sessionStorage (temporary)
  sessionStorage.setItem('sessionExpired', 'true');
  
  // Redirect to login page
  setTimeout(() => {
    window.location.href = '/login';
    isRedirecting = false;
  }, 100);
};

/**
 * Wraps the native fetch function to intercept and handle authentication errors
 * This creates a global interceptor for all fetch requests
 * 
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} The fetch response or throws an error
 */
const fetchWithAuthInterceptor = async (...args) => {
  const [url, options = {}] = args;
  
  // CRITICAL: Skip auth check for public endpoints OR requests without auth header
  if (shouldSkipAuthCheck(url, options) || !hasAuthHeader(options)) {
    return await originalFetch.apply(window, args);
  }
  
  try {
    const response = await originalFetch.apply(window, args);
    
    // Check if response indicates token expiration
    if (isTokenExpired(response)) {
      handleTokenExpiration();
      throw new Error('Sesión expirada');
    }
    
    return response;
  } catch (error) {
    // Re-throw the error for the calling code to handle
    throw error;
  }
};

/**
 * Replaces the global fetch function with our interceptor version
 * This ensures all fetch calls throughout the app are automatically monitored
 */
export const setupAuthInterceptor = () => {
  // Store original fetch for restoration if needed
  originalFetch = window.fetch;
  
  // Override global fetch
  window.fetch = fetchWithAuthInterceptor;
  
  console.log('[AuthInterceptor] Global fetch interceptor initialized');
  
  // Return cleanup function
  return () => {
    window.fetch = originalFetch;
  };
};

/**
 * Checks if there's a session expiration flag and returns the message
 * Used by the login page to display expiration notice
 * 
 * @returns {boolean} True if session was expired
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