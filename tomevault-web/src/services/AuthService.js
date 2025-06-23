// Base URL for the backend API.
export const BACKEND_BASE_URL = 'http://localhost:8080/api/v1';

// Key for storing the JWT in localStorage.
export const TOKEN_KEY = 'jwtToken';

/**
 * Attempts to log in with the provided username and password.
 * @param {string} usernameOrEmail - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<boolean>} True if login is successful, false otherwise.
 * @throws {Error} If login fails due to invalid credentials or network issues.
 */
export const login = async (usernameOrEmail, password) => {
  console.log(`[AuthService] Attempting to log in with user: ${usernameOrEmail}`);
  console.log(`[AuthService] Login URL: ${BACKEND_BASE_URL}/auth/login`);

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    console.log(`[AuthService] Login response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      if (data.jwt) {
        // Store the JWT token
        localStorage.setItem(TOKEN_KEY, data.jwt);
        console.log('[AuthService] Login successful. JWT stored.');

        // Fetch user profile to get roles and other details
        const profileResponse = await fetch(`${BACKEND_BASE_URL}/user`, {
          headers: { 'Authorization': `Bearer ${data.jwt}` }
        });

        if (profileResponse.ok) {
          const userProfile = await profileResponse.json();
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
          console.log('[AuthService] User profile stored:', userProfile);
        } else {
          // Fallback: create minimal profile
          const fallbackProfile = { usernameOrEmail, roles: ['USER'] };
          localStorage.setItem('userProfile', JSON.stringify(fallbackProfile));
          console.log('[AuthService] Used fallback profile due to profile fetch failure.');
        }

        return true;
      } else {
        console.error('[AuthService] Login successful, but no JWT received.');
        throw new Error('No se recibió el token de autenticación.');
      }
    } else if (response.status === 401) {
      console.warn('[AuthService] Login failed: Invalid credentials.');
      throw new Error('Credenciales inválidas. Por favor, inténtelo de nuevo.');
    } else {
      const errorBody = await response.text();
      console.error('[AuthService] Error during login:', response.status, errorBody);
      throw new Error(`Error ${response.status}: ${errorBody || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('[AuthService] Network or unexpected error during login:', error);
    throw new Error(error.message || 'No se pudo conectar con el servidor de autenticación.');
  }
};

/**
 * Attempts to register a new user with the provided registration data.
 * @param {object} userData - The user registration data (username, password, email, etc.).
 * @returns {Promise<boolean>} True if registration is successful, false otherwise.
 * @throws {Error} If registration fails due to network issues or backend errors.
 */
export const register = async (userData) => {
  console.log('[AuthService] Attempting to register user:', userData.email);
  console.log(`[AuthService] Register URL: ${BACKEND_BASE_URL}/auth/sign-up`);

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log(`[AuthService] Register response status: ${response.status}`);

    if (response.status === 201) {
      const data = await response.json();
      console.log('[AuthService] Registration successful:', data);
      return true;
    } else {
      const errorBody = await response.text();
      console.error('[AuthService] Registration failed:', response.status, errorBody);
      let errorMessage = 'El registro falló.';
      try {
        const errorData = JSON.parse(errorBody);
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map(err => err.defaultMessage || err.message).join(', ');
        }
      } catch (parseError) {
        errorMessage = errorBody || 'Error desconocido durante el registro.';
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('[AuthService] Network or unexpected error during registration:', error);
    throw new Error(error.message || 'No se pudo conectar con el servidor de registro.');
  }
};

/**
 * Logs out the user by removing the JWT from localStorage.
 */
export const logout = () => {
  console.log('[AuthService] Logging out. Removing JWT.');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('userProfile'); // Also remove profile on logout
};

/**
 * Retrieves the JWT from localStorage.
 * @returns {string|null} The JWT token or null if not present.
 */
export const getJwt = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Checks if the user is currently logged in.
 * @returns {boolean} True if the user is authenticated, false otherwise.
 */
export const isAuthenticated = () => {
  return getJwt() !== null;
};

/**
 * Retrieves the Authorization header for API requests.
 * @returns {string|null} The "Bearer <token>" header or null if not authenticated.
 */
export const getAuthHeader = () => {
  const jwt = getJwt();
  return jwt ? `Bearer ${jwt}` : null;
};