import { BACKEND_BASE_URL, TOKEN_KEY, getAuthHeader, logout } from './AuthService';

// Fetches the current user's profile information from the backend.
export const getUserProfile = async () => {
  const headers = new Headers();
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.append('Authorization', authHeader);
  } else {
    throw new Error('Authentication token is missing. Please log in again.');
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
      throw new Error('Unauthorized or forbidden access. Please log in again.');
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to fetch user profile: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Updates the user's profile with new data.
export const updateUserProfile = async (profileData) => {
  const headers = new Headers();
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.append('Authorization', authHeader);
  } else {
    throw new Error('Authentication token is missing. Please log in again.');
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
      return data;
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to update user profile: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Changes the user's password.
export const changePassword = async (passwordData) => {
  const headers = new Headers();
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.append('Authorization', authHeader);
  } else {
    throw new Error('Authentication token is missing. Please log in again.');
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
        localStorage.setItem(TOKEN_KEY, data.jwt); // Update the JWT
      }
      return data;
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to change password: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};