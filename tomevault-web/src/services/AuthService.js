// This service handles authentication logic using JWT (JSON Web Tokens).

const BACKEND_BASE_URL = 'http://localhost:8080/api/v1'; // Base URL for your backend

const TOKEN_KEY = 'jwtToken'; // Key for storing the JWT in localStorage

// Attempts to log in with the provided username and password.
export const login = async (username, password) => {
  console.log(`Attempting to log in with user: ${username}`);
  
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
      method: 'POST', // HTTP method for the login endpoint.
      headers: {
        'Content-Type': 'application/json', // Backend expects JSON body
      },
      body: JSON.stringify({ username, password }), // Send credentials as JSON body
    });

    if (response.ok) {
      const data = await response.json(); // Parse the JSON response
      if (data.jwt) {
        localStorage.setItem(TOKEN_KEY, data.jwt); // Store the JWT
        console.log('Login successful. JWT stored.');
        return true; // Indicates success.
      } else {
        console.error('Login successful, but no JWT received.');
        throw new Error('No se recibió el token de autenticación.');
      }
    } else if (response.status === 401) {
      console.warn('Login failed: Invalid credentials.');
      throw new Error('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    } else {
      const errorBody = await response.text();
      console.error('Error during login:', response.status, errorBody);
      throw new Error(`Error ${response.status}: ${errorBody || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Network or unexpected error during login:', error);
    throw new Error(error.message || 'No se pudo conectar al servidor de autenticación.');
  }
};

// Logs out the user by removing the JWT from storage.
export const logout = () => {
  console.log('Logging out. Removing JWT.');
  localStorage.removeItem(TOKEN_KEY); // Remove the JWT
  // No need to invalidate on backend for stateless JWTs, but a revoke list could be implemented for stronger security.
};

// Retrieves the JWT from localStorage.
export const getJwt = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Checks if the user is currently logged in by checking for the JWT.
export const isAuthenticated = () => {
  return getJwt() !== null;
};

// Retrieves the Authorization header for API requests.
export const getAuthHeader = () => {
  const jwt = getJwt();
  return jwt ? `Bearer ${jwt}` : null; // Return "Bearer <JWT>"
};