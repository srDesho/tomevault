import { BACKEND_BASE_URL, TOKEN_KEY, getAuthHeader, logout } from './AuthService';

// Fetches the current user's profile information from the backend
export const getUserProfile = async () => {
  const headers = new Headers();
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.append('Authorization', authHeader);
  } else {
    throw new Error('Token de autenticación faltante. Por favor, inicie sesión nuevamente.');
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
      throw new Error('Acceso no autorizado. Por favor, inicie sesión nuevamente.');
    } else {
      const errorText = await response.text();
      throw new Error(`Error al cargar el perfil de usuario: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Updates the user's profile with new data
export const updateUserProfile = async (profileData) => {
  const headers = new Headers();
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.append('Authorization', authHeader);
  } else {
    throw new Error('Token de autenticación faltante. Por favor, inicie sesión nuevamente.');
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
        localStorage.setItem(TOKEN_KEY, data.jwt); // Update the JWT
      }
      return { message: 'Perfil actualizado correctamente', ...data };
    } else if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Acceso no autorizado. Por favor, inicie sesión nuevamente.');
    } else {
      const errorText = await response.text();
      
      // Map specific error messages to Spanish
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

// Changes the user's password
export const changePassword = async (passwordData) => {
  const headers = new Headers();
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.append('Authorization', authHeader);
  } else {
    throw new Error('Token de autenticación faltante. Por favor, inicie sesión nuevamente.');
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
        localStorage.setItem(TOKEN_KEY, data.jwt);
      }
      return { message: 'Contraseña cambiada correctamente', ...data };
    }
    
    // Try to parse JSON error message first
    let errorMessage = '';
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || '';
    } else {
      errorMessage = await response.text();
    }
    
    const errorLower = errorMessage.toLowerCase();
    
    // ✅ ¡MUEVE esta validación AQUÍ, dentro del bloque 400!
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
    
    if (response.status === 401) {
      // Ahora este bloque SOLO se usa si el token es inválido/expirado
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
    
    if (response.status === 500) {
      throw new Error('Error del servidor. Por favor, intente más tarde');
    }
    
    throw new Error('Error al cambiar la contraseña');
    
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};