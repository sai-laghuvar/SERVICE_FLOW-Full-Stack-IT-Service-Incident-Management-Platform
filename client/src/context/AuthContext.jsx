import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('serviceflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('serviceflow_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on initial app load
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('serviceflow_token');
      if (storedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem('serviceflow_user', JSON.stringify(freshUser));
        } catch (err) {
          console.warn('[Auth] Session validation failed:', err.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem('serviceflow_token');
          localStorage.removeItem('serviceflow_user');
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const updateProfile = async (profileData) => {
    const updatedUser = await authService.updateProfile(profileData);
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
