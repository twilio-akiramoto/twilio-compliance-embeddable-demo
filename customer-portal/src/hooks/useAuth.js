import { useState, useEffect, createContext, useContext } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.verifyToken();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { user: userData } = await authService.login(email, password);
    setUser(userData);
    return userData;
  };

  const register = async (registrationData) => {
    const { user: userData } = await authService.register(registrationData);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
