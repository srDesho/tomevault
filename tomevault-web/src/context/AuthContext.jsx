import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AuthService from '../services/AuthService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      if (AuthService.isAuthenticated()) {
        const profile = localStorage.getItem('userProfile');
        if (profile) {
          setUser(JSON.parse(profile));
        } else {
          // Fallback: decode JWT to get basic info
          const token = AuthService.getJwt();
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setUser({ username: payload.sub, roles: ['USER'] });
            } catch (err) {
              console.warn('[AuthContext] Failed to decode JWT payload:', err);
              setUser({ roles: ['USER'] });
            }
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Logs in the user and updates the context state.
   * @param {string} username - The username.
   * @param {string} password - The password.
   * @returns {Promise<boolean>} True if login is successful.
   */
  const login = async (username, password) => {
    const success = await AuthService.login(username, password);
    if (success) {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        setUser(JSON.parse(profile));
      } else {
        // Minimal fallback
        setUser({ username, roles: ['USER'] });
      }
    }
    return success;
  };

  // Updates the user profile in the context state.
  const updateUserProfile = (profileData) => {
    setUser((prevUser) => ({ ...prevUser, ...profileData }));
    // Also update localStorage to persist the changes
    const currentProfile = localStorage.getItem('userProfile');
    if (currentProfile) {
      const parsedProfile = JSON.parse(currentProfile);
      const updatedProfile = { ...parsedProfile, ...profileData };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    }
  };

  // Logs out the user and clears the context state.
  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: AuthService.isAuthenticated, login, logout, updateUserProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};