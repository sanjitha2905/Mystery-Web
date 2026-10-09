import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mystery_web_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mystery_web_token') || localStorage.getItem('mystery_token');
    if (token) {
      authAPI.getMe()
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('mystery_web_user', JSON.stringify(data.user));
          } else {
            localStorage.removeItem('mystery_web_token');
            localStorage.removeItem('mystery_web_user');
            localStorage.removeItem('mystery_token');
            setUser(null);
          }
        })
        .catch(() => {
          const savedUser = localStorage.getItem('mystery_web_user');
          if (!savedUser) {
            localStorage.removeItem('mystery_web_token');
            localStorage.removeItem('mystery_token');
            setUser(null);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('mystery_web_token', res.token);
      if (res.user) {
        localStorage.setItem('mystery_web_user', JSON.stringify(res.user));
        setUser(res.user);
      }
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register(name, email, password);
    return res;
  };

  const quickLogin = async (role = 'detective') => {
    // Demo quick login
    return await login('test@example.com', '123456');
  };

  const logout = () => {
    localStorage.removeItem('mystery_web_token');
    localStorage.removeItem('mystery_web_user');
    localStorage.removeItem('mystery_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
