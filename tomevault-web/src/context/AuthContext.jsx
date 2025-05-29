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
          // Si no hay perfil, asumimos que es USER (opcional: hacer fetch)
          const token = AuthService.getJwt();
          if (token) {
            // Decodificar JWT si quieres obtener datos básicos (opcional)
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setUser({ username: payload.sub, roles: ['USER'] });
            } catch {
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

  const login = async (username, password) => {
    const success = await AuthService.login(username, password);
    if (success) {
      // Intentamos obtener el perfil
      const profile = await fetch(`${AuthService.BACKEND_BASE_URL}/user/profile`, {
        headers: { 'Authorization': AuthService.getAuthHeader() }
      }).then(res => res.ok ? res.json() : null);

      if (profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setUser(profile);
      } else {
        // Fallback
        setUser({ username, roles: ['USER'] });
      }
    }
    return success;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: AuthService.isAuthenticated, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};