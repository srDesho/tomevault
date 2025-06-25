import * as AuthService from './AuthService';

const BACKEND_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Helper function to handle API responses and error cases consistently
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle specific HTTP status codes with appropriate error messages
    if (response.status === 403) {
      throw new Error(errorData.message || 'No tienes permisos para realizar esta acción');
    }
    
    if (response.status === 404) {
      throw new Error(errorData.message || 'Recurso no encontrado');
    }
    
    if (response.status === 400) {
      throw new Error(errorData.message || 'Datos inválidos');
    }
    
    throw new Error(errorData.message || 'Error en la operación');
  }
  
  // For DELETE requests and other operations that don't return content
  if (response.status === 204) {
    return { success: true };
  }
  
  return response.json();
};

const AdminUserService = {
  // GET /admin/users
  getAllUsers: async (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
    const url = new URL(`${BACKEND_BASE_URL}/admin/users`);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('sortDir', sortDir);

    const response = await fetch(url, {
      headers: { 'Authorization': AuthService.getAuthHeader() }
    });
    
    return handleResponse(response);
  },

  // GET /admin/users/search
  searchUsers: async (query, page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
    const url = new URL(`${BACKEND_BASE_URL}/admin/users/search`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('sortDir', sortDir);

    const response = await fetch(url, {
      headers: { 'Authorization': AuthService.getAuthHeader() }
    });
    
    return handleResponse(response);
  },

  // GET /admin/users/{id}
  getUserById: async (id) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/${id}`, {
      headers: { 'Authorization': AuthService.getAuthHeader() }
    });
    
    return handleResponse(response);
  },

  // PUT /admin/users/{id}
  updateUser: async (id, userData) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthService.getAuthHeader()
      },
      body: JSON.stringify(userData)
    });
    
    return handleResponse(response);
  },

  // PUT /admin/users/{id}/roles
  updateUserRoles: async (id, roleNames) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/${id}/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthService.getAuthHeader()
      },
      body: JSON.stringify({ roleNames })
    });
    
    return handleResponse(response);
  },

  // PUT /admin/users/toggle-status/{id}
  toggleUserStatus: async (id, enabled) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/toggle-status/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthService.getAuthHeader()
      },
      body: JSON.stringify({ enabled })
    });
    
    return handleResponse(response);
  },

  // DELETE /admin/users/{id}
  deleteUser: async (id) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': AuthService.getAuthHeader() }
    });
    
    return handleResponse(response);
  },

  // PUT /admin/users/{id}/reset-password
  resetUserPassword: async (id, newPassword) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users/${id}/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthService.getAuthHeader()
      },
      body: JSON.stringify({ newPassword })
    });
    
    return handleResponse(response);
  },

  // POST /admin/users
  createUser: async (userData) => {
    const response = await fetch(`${BACKEND_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthService.getAuthHeader()
      },
      body: JSON.stringify(userData)
    });
    
    return handleResponse(response);
  }
};

export default AdminUserService;