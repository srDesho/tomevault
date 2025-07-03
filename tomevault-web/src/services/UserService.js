import { BACKEND_BASE_URL, TOKEN_KEY, getAuthHeader, logout } from './AuthService';

// Get current user's profile data from backend
export const getUserProfile = async () => {
  const headers = new Headers();
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.append('Authorization', authHeader);
  } else {
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/user`, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      return await response.json();
    } else if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Sesión Expirada');
    } else {
      const errorText = await response.text();
      throw new Error(`Error al cargar el perfil de usuario: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile information like email and username
export const updateUserProfile = async (profileData) => {
  const headers = new Headers();
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.append('Authorization', authHeader);
  } else {
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }
  headers.append('Content-Type', 'application/json');

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/user/update`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem(TOKEN_KEY, data.jwt); // Update JWT token with new one
      }
      return { message: 'Perfil actualizado correctamente', ...data };
    } else if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Sesión Expirada');
    } else {
      const errorText = await response.text();
      
      // Convert backend error messages to user-friendly Spanish
      let userFriendlyMessage = 'Error al actualizar el perfil de usuario';
      
      if (response.status === 400) {
        if (errorText.toLowerCase().includes('email')) {
          userFriendlyMessage = 'El correo electrónico no es válido';
        } else if (errorText.toLowerCase().includes('username')) {
          userFriendlyMessage = 'El nombre de usuario no es válido';
        } else {
          userFriendlyMessage = 'Datos de entrada inválidos';
        }
      } else if (response.status === 409) {
        userFriendlyMessage = 'El nombre de usuario o correo ya está en uso';
      } else if (response.status === 500) {
        userFriendlyMessage = 'Error del servidor. Por favor, intente más tarde';
      }
      
      throw new Error(userFriendlyMessage);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change user password with validation and security checks
export const changePassword = async (passwordData) => {
  const headers = new Headers();
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.append('Authorization', authHeader);
  } else {
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }
  headers.append('Content-Type', 'application/json');

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/user/change-password`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(passwordData),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem(TOKEN_KEY, data.jwt); // Store updated JWT token
      }
      return { message: 'Contraseña cambiada correctamente', ...data };
    }
    
    // Parse error response to get detailed message
    let errorMessage = '';
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || '';
    } else {
      errorMessage = await response.text();
    }
    
    const errorLower = errorMessage.toLowerCase();
    
    // Handle specific password validation errors
    if (response.status === 400) {
      if (errorLower.includes('current password is incorrect')) {
        throw new Error('La contraseña actual es incorrecta');
      }
      if (errorLower.includes('do not match')) {
        throw new Error('Las nuevas contraseñas no coinciden');
      }
      if (errorLower.includes('different from current')) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }
      if (errorLower.includes('length')) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      throw new Error('Datos de entrada inválidos');
    }
    
    // Handle authentication errors
    if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
    
    // Handle server errors
    if (response.status === 500) {
      throw new Error('Error del servidor. Por favor, intente más tarde');
    }
    
    throw new Error('Error al cambiar la contraseña');
    
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};