import { BACKEND_BASE_URL, TOKEN_KEY, getAuthHeader, logout } from './AuthService';

// Maps English error messages from backend to Spanish for frontend display
const errorMappings = {
  // DTO validation messages
  'Username is required': 'El nombre de usuario es requerido',
  'Username cannot be blank': 'El nombre de usuario es requerido',
  'Username must be between 3 and 20 characters': 'El nombre de usuario debe tener entre 3 y 20 caracteres',
  'Email cannot be blank': 'El correo electrónico es requerido',
  'Invalid email format': 'El formato del correo electrónico no es válido',
  'First name cannot be blank': 'El nombre es requerido',
  'Last name cannot be blank': 'El apellido es requerido',
  'Birth date cannot be null': 'La fecha de nacimiento es requerida',
  'Birth date must be in the past': 'La fecha de nacimiento debe ser en el pasado',
  
  // Business logic errors
  'Email is already in use by another user': 'El correo electrónico ya está en uso por otro usuario',
  'Username is already in use by another user': 'El nombre de usuario ya está en uso por otro usuario',
  
  // Password validation errors
  'Current password is incorrect': 'La contraseña actual es incorrecta',
  'Invalid password': 'La contraseña actual es incorrecta',
  'New passwords do not match': 'Las nuevas contraseñas no coinciden',
  'New password must be different from current password': 'La nueva contraseña debe ser diferente a la actual',
  'Password cannot be empty': 'La contraseña no puede estar vacía',
  'Password must be at least 8 characters long': 'La contraseña debe tener al menos 8 caracteres',
  'Password must contain at least one uppercase letter': 'La contraseña debe contener al menos una letra mayúscula',
  'Password must contain at least one lowercase letter': 'La contraseña debe contener al menos una letra minúscula',
  'Password must contain at least one digit': 'La contraseña debe contener al menos un número',
  'La contraseña no puede estar vacía': 'La contraseña no puede estar vacía',
  'La contraseña debe tener al menos 8 caracteres de longitud': 'La contraseña debe tener al menos 8 caracteres',
  'La contraseña debe contener al menos una letra mayúscula': 'La contraseña debe contener al menos una letra mayúscula',
  'La contraseña debe contener al menos una letra minúscula': 'La contraseña debe contener al menos una letra minúscula',
  'La contraseña debe contener al menos un dígito': 'La contraseña debe contener al menos un número'
};

// Translates English backend errors to Spanish for user display
const translateError = (errorMessage) => {
  return errorMappings[errorMessage] || errorMessage;
};

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
      const contentType = response.headers.get('content-type');
      let errorMessage = 'Error al cargar el perfil de usuario';
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      }
      
      throw new Error(translateError(errorMessage));
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
        localStorage.setItem(TOKEN_KEY, data.jwt);
      }
      return { message: 'Perfil actualizado correctamente', ...data };
    }
    
    const contentType = response.headers.get('content-type');
    let errorMessage = 'Error al actualizar el perfil de usuario';
    
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    }
    
    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Sesión Expirada');
    }
    
    throw new Error(translateError(errorMessage));
    
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
        localStorage.setItem(TOKEN_KEY, data.jwt);
      }
      return { message: 'Contraseña cambiada correctamente', ...data };
    }
    
    const contentType = response.headers.get('content-type');
    let errorMessage = 'Error al cambiar la contraseña';
    
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    }
    
    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
    
    throw new Error(translateError(errorMessage));
    
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};