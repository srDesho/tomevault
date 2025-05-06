// src/services/AuthService.js
// This service handles authentication logic (login and logout).

const BACKEND_BASE_URL = 'http://localhost:8080/api/v1'; // Base URL for your backend

// Variables to store logged-in user credentials.
// WARNING: Storing credentials directly in variables like this is for DEMONSTRATION ONLY.
// In a real application, you would use JWTs and store them securely (e.g., in HttpOnly cookies).
let currentUsername = null;
let currentPassword = null;

// Retrieves the Basic Auth authorization header if the user is logged in.
export const getAuthHeader = () => {
  if (currentUsername && currentPassword) {
    // Encodes "username:password" in Base64 for Basic Auth.
    return 'Basic ' + btoa(`${currentUsername}:${currentPassword}`);
  }
  return null; // No header if the user is not logged in.
};

// Attempts to log in with the provided username and password.
export const login = async (username, password) => {
  console.log(`Attempting to log in with user: ${username}`);
  // Creates the authorization header for the login request.
  const authHeader = 'Basic ' + btoa(`${username}:${password}`);

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/login`, {
      method: 'POST', // HTTP method for the login endpoint.
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader // Sends credentials in the header.
      },
    });

    if (response.ok) {
      // If the login is successful, stores credentials in memory.
      currentUsername = username;
      currentPassword = password;
      console.log('Inicio de sesión exitoso.');
      return true; // Indicates success.
    } else if (response.status === 401) {
      // Handles invalid credentials.
      console.warn('Login failed: Invalid credentials.');
      throw new Error('Credenciales inválidas.');
    } else {
      // Handles other server response errors.
      const errorText = await response.text();
      console.error('Error en el inicio de sesión:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error desconocido'}`);
    }
  } catch (error) {
    // Handles network or unexpected errors during login.
    console.error('Network or unexpected error during login:', error);
    throw new Error(error.message || 'No se pudo conectar al servidor de autenticación.');
  }
};

// Logs out the user.
export const logout = () => {
  console.log('Cerrando sesión.');
  // Clears stored credentials from memory.
  currentUsername = null;
  currentPassword = null;
  // In a real application, you would also invalidate the session/token on the backend if necessary.
};

// Checks if the user is currently logged in.
export const isAuthenticated = () => {
  return currentUsername !== null;
};
