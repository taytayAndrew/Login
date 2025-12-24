import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 401 未授权，清除 token 并跳转登录
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data || error.message);
    }
    return Promise.reject(error.message);
  }
);

// 认证相关 API
export const authAPI = {
  // 发送验证码
  sendVerificationCode: (email) => api.post('/auth/send-verification-code', { email }),
  
  // 注册
  register: (data) => api.post('/auth/register', data),
  
  // 登录
  login: (data) => api.post('/auth/login', data),
  
  // 修改密码
  changePassword: (data) => api.put('/auth/change-password', data),
};

// 用户相关 API
export const userAPI = {
  // 获取当前用户
  getCurrentUser: () => api.get('/users/me'),
  
  // 获取用户列表
  listUsers: () => api.get('/users'),
  
  // 获取单个用户
  getUser: (id) => api.get(`/users/${id}`),
  
  // 创建用户
  createUser: (data) => api.post('/users', data),
  
  // 更新用户
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  
  // 删除用户
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // 分页查询
  getUsersPage: (page = 0, size = 10) => 
    api.get(`/users/page?page=${page}&size=${size}`),
  
  // 搜索用户
  searchUsers: (name, minAge, maxAge) => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (minAge) params.append('minAge', minAge);
    if (maxAge) params.append('maxAge', maxAge);
    return api.get(`/users/search?${params.toString()}`);
  },
  
  // 按年龄范围查询
  getUsersByAgeRange: (minAge, maxAge) =>
    api.get(`/users/age-range?minAge=${minAge}&maxAge=${maxAge}`),
};

// 角色相关 API
export const roleAPI = {
  // 获取所有角色
  listRoles: () => api.get('/roles'),
  
  // 分配角色
  assignRole: (userId, roleId) => 
    api.post(`/roles/assign?userId=${userId}&roleId=${roleId}`),
  
  // 移除角色
  removeRole: (userId, roleId) => 
    api.post(`/roles/remove?userId=${userId}&roleId=${roleId}`),
  
  // 获取用户的角色
  getUserRoles: (userId) => api.get(`/roles/user/${userId}`),
};

export default api;

