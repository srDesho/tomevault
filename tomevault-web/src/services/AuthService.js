
// This service handles authentication logic using JWT (JSON Web Tokens).
export const BACKEND_BASE_URL = 'http://localhost:8080/api/v1'; // Base URL for your backend

export const TOKEN_KEY = 'jwtToken'; // Key for storing the JWT in localStorage

// Attempts to log in with the provided username and password.
export const login = async (username, password) => {
  console.log(`[AuthService] Attempting to log in with user: ${username}`); // Detailed log
  console.log(`[AuthService] Login URL: ${BACKEND_BASE_URL}/auth/login`); // Log the URL

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
      method: 'POST', // HTTP method for the login endpoint.
      headers: {
        'Content-Type': 'application/json', // Backend expects JSON body
      },
      body: JSON.stringify({ username, password }), // Send credentials as JSON body
    });

    console.log(`[AuthService] Login response status: ${response.status}`); // Log response status

    if (response.ok) {
      const data = await response.json(); // Parse the JSON response
      if (data.jwt) {
        localStorage.setItem(TOKEN_KEY, data.jwt); // Store the JWT
        console.log('[AuthService] Login successful. JWT stored.');
        return true; // Indicates success.
      } else {
        console.error('[AuthService] Login successful, but no JWT received.');
        throw new Error('No se recibió el token de autenticación.');
      }
    } else if (response.status === 401) {
      console.warn('[AuthService] Login failed: Invalid credentials.');
      throw new Error('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    } else {
      const errorBody = await response.text();
      console.error('[AuthService] Error during login:', response.status, errorBody);
      throw new Error(`Error ${response.status}: ${errorBody || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('[AuthService] Network or unexpected error during login:', error);
    throw new Error(error.message || 'No se pudo conectar al servidor de autenticación.');
  }
};

/**
 * Attempts to register a new user with the provided registration data.
 * @param {object} userData - The user registration data (username, password, email, etc.).
 * @returns {Promise<boolean>} True if registration is successful, false otherwise.
 * @throws {Error} If registration fails due to network issues or backend errors.
 */
export const register = async (userData) => {
  console.log('[AuthService] Attempting to register user:', userData.email); // Log the email being registered
  console.log(`[AuthService] Register URL: ${BACKEND_BASE_URL}/auth/sign-up`); // Log the register URL

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData), // Send user data as JSON
    });

    console.log(`[AuthService] Register response status: ${response.status}`); // Log response status

    if (response.status === 201) { // Assuming 201 Created for successful registration
      const data = await response.json();
      console.log('[AuthService] Registration successful:', data);
      // Depending on your backend, you might receive a JWT here too,
      // or you might expect the user to log in after registration.
      // For now, we'll just indicate success.
      return true;
    } else {
      const errorBody = await response.text();
      console.error('[AuthService] Registration failed:', response.status, errorBody);
      let errorMessage = 'Fallo en el registro.';
      try {
        const errorData = JSON.parse(errorBody);
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map(err => err.defaultMessage || err.message).join(', ');
        }
      } catch (parseError) {
        // If errorBody is not JSON, use it as is
        errorMessage = errorBody || 'Error desconocido durante el registro.';
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('[AuthService] Network or unexpected error during registration:', error);
    throw new Error(error.message || 'No se pudo conectar al servidor de registro.');
  }
};

// Logs out the user by removing the JWT from storage.
export const logout = () => {
  console.log('[AuthService] Logging out. Removing JWT.');
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