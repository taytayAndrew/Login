/**
 * Axios Configuration with Interceptors
 * Handles authentication, error handling, and request/response transformation
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/config/api.config';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add JWT token to headers
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ Response:', response.config.url, response.data);
    }

    // Return data directly if it's a standard API response
    if (response.data && typeof response.data === 'object') {
      // Handle standard API response format: { success, data, message, code }
      if ('success' in response.data) {
        if (response.data.success) {
          return response.data.data;
        } else {
          // API returned success: false
          return Promise.reject({
            message: response.data.message || 'Request failed',
            code: response.data.code,
          });
        }
      }
    }

    return response.data;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;

        case 403:
          // Forbidden - insufficient permissions
          console.error('❌ Forbidden:', data);
          break;

        case 404:
          // Not found
          console.error('❌ Not Found:', error.config?.url);
          break;

        case 500:
          // Server error
          console.error('❌ Server Error:', data);
          break;

        default:
          console.error('❌ Response Error:', status, data);
      }

      // Return error message from response
      return Promise.reject({
        message: (data as any)?.message || 'Request failed',
        code: status,
        data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Network Error:', error.message);
      return Promise.reject({
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
      });
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
      return Promise.reject({
        message: error.message || 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
      });
    }
  }
);

export default axiosInstance;
