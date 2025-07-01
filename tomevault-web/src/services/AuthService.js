// Base URL for the backend API.
export const BACKEND_BASE_URL = 'http://localhost:8080/api/v1';

// Key for storing the JWT in localStorage.
export const TOKEN_KEY = 'jwtToken';

/**
 * Checks if a JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    console.error('[AuthService] Error parsing token:', error);
    return true;
  }
};

// Login with username or email
export const login = async (usernameOrEmail, password) => {
  console.log(`[AuthService] Logging in with: ${usernameOrEmail}`);

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // CHANGE HERE: use usernameOrEmail instead of username
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    console.log(`[AuthService] Response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      if (data.jwt) {
        // Store JWT token
        localStorage.setItem(TOKEN_KEY, data.jwt);
        console.log('[AuthService] Login successful');

        // Get user profile
        const profileResponse = await fetch(`${BACKEND_BASE_URL}/user`, {
          headers: { 'Authorization': `Bearer ${data.jwt}` }
        });

        if (profileResponse.ok) {
          const userProfile = await profileResponse.json();
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
          console.log('[AuthService] User profile stored');
        } else {
          // Fallback profile
          const fallbackProfile = { username: usernameOrEmail, roles: ['USER'] };
          localStorage.setItem('userProfile', JSON.stringify(fallbackProfile));
          console.log('[AuthService] Used fallback profile');
        }

        return true;
      } else {
        throw new Error('No se recibió el token de autenticación.');
      }
    } else {
      // Handle specific error codes
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }
      
      console.error('[AuthService] Login failed:', response.status, errorData);

      // Check for specific error codes from backend
      if (errorData && errorData.errorCode) {
        switch (errorData.errorCode) {
          case 'account_disabled':
            throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
          case 'account_deleted':
            throw new Error('Tu cuenta ha sido eliminada.');
          case 'invalid_credentials':
            throw new Error('Credenciales inválidas. Por favor, inténtelo de nuevo.');
          default:
            throw new Error(errorData.message || 'Error de autenticación.');
        }
      } else if (response.status === 401) {
        // Fallback for compatibility
        throw new Error('Credenciales inválidas. Por favor, inténtelo de nuevo.');
      } else {
        throw new Error(`Error ${response.status}: ${errorData?.message || 'Error desconocido'}`);
      }
    }
  } catch (error) {
    console.error('[AuthService] Network error:', error);
    throw new Error(error.message || 'No se pudo conectar con el servidor.');
  }
};

// Register new user
export const register = async (userData) => {
  console.log('[AuthService] Registering user:', userData.email);

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log(`[AuthService] Register status: ${response.status}`);

    if (response.status === 201) {
      const data = await response.json();
      console.log('[AuthService] Registration successful');
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
    console.error('[AuthService] Network error during registration:', error);
    throw new Error(error.message || 'No se pudo conectar con el servidor.');
  }
};

// Logout user
export const logout = () => {
  console.log('[AuthService] Logging out');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('userProfile');
};

// Get JWT token
export const getJwt = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getJwt();
  return token !== null && !isTokenExpired(token);
};

// Get authorization header with automatic expiration check
export const getAuthHeader = () => {
  const token = getJwt();
  if (!token || isTokenExpired(token)) {
    // Automatically clear expired token
    logout();
    return null;
  }
  return `Bearer ${token}`;
};