import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const BASE = 'http://localhost:8080/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('user'); }
    }
    setLoading(false);
  }, []);

  const saveSession = (tok, userData) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    setToken(tok);
    setUser(userData);
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${BASE}/auth/login`, { email, password });
    saveSession(data.token, data.data.user);
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await axios.post(`${BASE}/auth/register`, payload);
    saveSession(data.token, data.data.user);
    return data.data.user;
  };

  const forgotPassword = async (mobile) => {
    const { data } = await axios.post(`${BASE}/auth/forgot-password`, { mobile });
    return data;
  };

  const resetPassword = async (payload) => {
    const { data } = await axios.post(`${BASE}/auth/reset-password`, payload);
    return data;
  };

  const changePassword = async (payload) => {
    const { data } = await axios.put(`${BASE}/auth/change-password`, payload);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      forgotPassword, resetPassword, changePassword,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
