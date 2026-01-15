/**
 * Custom hook for authentication
 */

import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();

  const handleLogin = useCallback(
    (userData: any, authToken: string) => {
      login(userData, authToken);
      navigate('/dashboard');
    },
    [login, navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
  };
};

export default useAuth;
