import * as AuthService from './AuthService';

const BACKEND_BASE_URL = 'http://localhost:8080/api/v1';

const AdminUserService = {
  // GET /admin/users
  getAllUsers: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
    const url = new URL(`${BACKEND_BASE_URL}/admin/users`);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('sortDir', sortDir);

    return fetch(url, {
      headers: { 'Authorization': AuthService.getAuthHeader() }
    }).then(res => res.json());
  },

  // GET /admin/users/search
  searchUsers: (query, page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
    const url = new URL(`${BACKEND_BASE_URL}/admin/users/search`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('sortDir', sortDir);

    return fetch(url, {
      headers: { 'Authorization': AuthService.getAuthHeader() }
    }).then(res => res.json());
  },

  // GET /admin/users/{id}
  getUserById: (id) => {
    return fetch(`${BACKEND_BASE_URL}/admin/users/${id}`, {
      headers: { 'Authorization': AuthService.getAuthHeader() }
    }).then(res => res.json());
  },

  // PUT /admin/users/{id}
  updateUser: (id, userData) => {
    return fetch(`${BACKEND_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthService.getAuthHeader()
      },
      body: JSON.stringify(userData)
    }).then(res => res.json());
  },

  // PUT /admin/users/{id}/roles
  updateUserRoles: (id, roleNames) => {
    return fetch(`${BACKEND_BASE_URL}/admin/users/${id}/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthService.getAuthHeader()
      },
      body: JSON.stringify({ roleNames })
    }).then(res => res.json());
  },

  // PUT /admin/users/toggle-status/{id}
  toggleUserStatus: (id, enabled) => {
    return fetch(`${BACKEND_BASE_URL}/admin/users/toggle-status/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthService.getAuthHeader()
      },
      body: JSON.stringify({ enabled })
    });
  },

  // DELETE /admin/users/{id}
  deleteUser: (id) => {
    return fetch(`${BACKEND_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': AuthService.getAuthHeader() }
    });
  },

  // PUT /admin/users/{id}/reset-password
  resetUserPassword: (id, newPassword) => {
    return fetch(`${BACKEND_BASE_URL}/admin/users/${id}/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthService.getAuthHeader()
      },
      body: JSON.stringify({ newPassword })
    });
  },

  // POST /admin/users
  createUser: (userData) => {
    return fetch(`${BACKEND_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthService.getAuthHeader()
      },
      body: JSON.stringify(userData)
    }).then(res => res.json());
  }
};

export default AdminUserService;