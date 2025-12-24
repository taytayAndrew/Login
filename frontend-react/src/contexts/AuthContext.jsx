import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // 初始化：检查是否有 token，如果有则获取用户信息
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const response = await userAPI.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          }
        } catch (error) {
          // Token 无效，清除
          localStorage.removeItem('token');
          setToken('');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 登录
  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      if (response.success && response.data.token) {
        const newToken = response.data.token;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        
        // 获取用户信息
        const userResponse = await userAPI.getCurrentUser();
        if (userResponse.success) {
          setUser(userResponse.data);
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        }
        
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || '登录失败，请检查用户名和密码' 
      };
    }
  };

  // 注册
  const register = async (userData) => {
    try {
      const response = await authAPI.register({
        name: userData.name,
        age: userData.age,
        email: userData.email,
        password: userData.password,
        verificationCode: userData.verificationCode,
      });
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || '注册失败' 
      };
    }
  };

  // 登出
  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 修改密码
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword({
        oldPassword,
        newPassword,
      });
      if (response.success) {
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || '修改密码失败' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    changePassword,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

