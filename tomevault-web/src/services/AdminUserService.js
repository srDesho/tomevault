import { BACKEND_BASE_URL, getAuthHeader } from './AuthService';

// Centralized function to handle API responses and errors consistently
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 403 || response.status === 401) {
      throw new Error('Sesión expirada');
    }
    
    if (response.status === 404) {
      throw new Error(errorData.message || 'Recurso no encontrado');
    }
    
    if (response.status === 400) {
      throw new Error(errorData.message || 'Datos inválidos');
    }
    
    throw new Error(errorData.message || 'Error en la operación');
  }
  
  if (response.status === 204) {
    return { success: true };
  }
  
  return response.json();
};

const AdminUserService = {
  // Get paginated list of all users
  getAllUsers: async (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
    const url = new URL(`${BACKEND_BASE_URL}/admin/users`);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('sortDir', sortDir);

    const response = await fetch(url, {
      headers: { 'Authorization': getAuthHeader() }
    });
    
    return handleResponse(response);
  },

  // Search users by query with pagination
  searchUsers: async (query, page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
    const url = new URL(`${BACKEND_BASE_URL}/admin/users/search`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('sortDir', sortDir);

    const response = await fetch(url, {
      headers: { 'Authorization': getAuthHeader() }
    });
    
    return handleResponse(response);
  },

  // Get specific user details by ID
  getUserById: async (id) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/${id}`, {
      headers: { 'Authorization': getAuthHeader() }
    });
    
    return handleResponse(response);
  },

  // Update user information
  updateUser: async (id, userData) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify(userData)
    });
    
    return handleResponse(response);
  },

  // Update user roles and permissions
  updateUserRoles: async (id, roleNames) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/${id}/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify({ roleNames })
    });
    
    return handleResponse(response);
  },

  // Enable or disable user account
  toggleUserStatus: async (id, enabled) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/toggle-status/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify({ enabled })
    });
    
    return handleResponse(response);
  },

  // Delete user account permanently
  deleteUser: async (id) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': getAuthHeader() }
    });
    
    return handleResponse(response);
  },

  // Reset user password (admin function)
  resetUserPassword: async (id, newPassword) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/${id}/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify({ newPassword })
    });
    
    return handleResponse(response);
  },

  // Create new user account
  createUser: async (userData) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify(userData)
    });
    
    return handleResponse(response);
  }
};

export default AdminUserService;