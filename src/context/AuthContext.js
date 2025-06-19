import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/verify');
      
      // Check for new token in response header
      const newToken = response.headers['x-auth-token'];
      if (newToken && newToken !== token) {
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['x-auth-token'] = newToken;
      }

      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []); // Only run once on mount

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['x-auth-token'] = token;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    api.defaults.headers.common['x-auth-token'] = null;
    window.location.href = '/login';
  };

  // Show a simple loading indicator
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 