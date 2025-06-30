// This utility handles expired JWT tokens globally across the application
// It intercepts fetch responses and automatically redirects to login when unauthorized

import { logout } from '../services/AuthService';

let isRedirecting = false;
let originalFetch = null;

/**
 * Checks if the URL should be excluded from auth interception (login/register endpoints)
 * @param {string|Request} url - The request URL or Request object
 * @returns {boolean} True if URL should be excluded
 */
const isAuthEndpoint = (url) => {
  const authEndpoints = [
    '/auth/login',
    '/auth/sign-up',
    '/auth/register'
  ];
  
  // Extrae la URL si es un objeto Request
  const urlString = typeof url === 'string' ? url : url.url || '';
  
  return authEndpoints.some(endpoint => urlString.includes(endpoint));
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
  
  // Store expiration message in sessionStorage (temporary, cleared on new session)
  sessionStorage.setItem('sessionExpired', 'true');
  
  // Redirect to login page with small delay to avoid race conditions
  setTimeout(() => {
    window.location.href = '/login';
  }, 100);
};

/**
 * Wraps the native fetch function to intercept and handle authentication errors
 * This creates a global interceptor for all fetch requests
 */
const fetchWithAuthInterceptor = async (...args) => {
  // Toma el primer argumento que puede ser string o Request
  const url = args[0];
  
  try {
    // Use original Fetch, not interceptor.
    const response = await originalFetch.apply(window, args);
    
    // Exclude authentication endpoints.
    if (isAuthEndpoint(url)) {
      return response; // No interceptar login/register
    }
    
    // Check if response indicates token expiration
    if (isTokenExpired(response)) {
      handleTokenExpiration();
      // Throw specific error for catch blocks
      throw new Error('Sesión expirada');
    }
    
    return response;
  } catch (error) {
    // If it's our auth error, re-throw it
    if (error.message === 'Sesión expirada') {
      throw error;
    }
    // For other errors, proceed normally
    throw error;
  }
};

/**
 * Replaces the global fetch function with our interceptor version
 * This ensures all fetch calls throughout the app are automatically monitored
 */
export const setupAuthInterceptor = () => {
  // Store original fetch for fallback if needed
  originalFetch = window.fetch;
  
  // Override global fetch with our interceptor
  window.fetch = fetchWithAuthInterceptor;
  
  console.log('[AuthInterceptor] Global fetch interceptor initialized');
  
  // Return cleanup function in case we need to restore original fetch
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