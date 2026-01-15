/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  wsURL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  timeout: 30000,
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
};

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    changePassword: '/auth/change-password',
    refreshToken: '/auth/refresh-token',
  },

  // Users
  users: {
    list: '/users',
    detail: (id: number) => `/users/${id}`,
    create: '/users',
    update: (id: number) => `/users/${id}`,
    delete: (id: number) => `/users/${id}`,
    me: '/users/me',
  },

  // Workspaces
  workspaces: {
    list: '/api/v1/workspaces',
    detail: (id: string) => `/api/v1/workspaces/${id}`,
    create: '/api/v1/workspaces',
    update: (id: string) => `/api/v1/workspaces/${id}`,
    delete: (id: string) => `/api/v1/workspaces/${id}`,
    members: (id: string) => `/api/v1/workspaces/${id}/members`,
  },

  // Projects
  projects: {
    list: '/api/v1/projects',
    detail: (id: string) => `/api/v1/projects/${id}`,
    create: '/api/v1/projects',
    update: (id: string) => `/api/v1/projects/${id}`,
    delete: (id: string) => `/api/v1/projects/${id}`,
    members: (id: string) => `/api/v1/projects/${id}/members`,
  },

  // Tasks
  tasks: {
    list: '/api/v1/tasks',
    detail: (id: string) => `/api/v1/tasks/${id}`,
    create: '/api/v1/tasks',
    update: (id: string) => `/api/v1/tasks/${id}`,
    delete: (id: string) => `/api/v1/tasks/${id}`,
    history: (id: string) => `/api/v1/tasks/${id}/history`,
    comments: (id: string) => `/api/v1/tasks/${id}/comments`,
    attachments: (id: string) => `/api/v1/tasks/${id}/attachments`,
  },

  // Sprints
  sprints: {
    list: '/api/v1/sprints',
    detail: (id: string) => `/api/v1/sprints/${id}`,
    create: '/api/v1/sprints',
    update: (id: string) => `/api/v1/sprints/${id}`,
    start: (id: string) => `/api/v1/sprints/${id}/start`,
    complete: (id: string) => `/api/v1/sprints/${id}/complete`,
    burndown: (id: string) => `/api/v1/sprints/${id}/burndown`,
  },

  // Boards
  boards: {
    list: '/api/v1/boards',
    detail: (id: string) => `/api/v1/boards/${id}`,
    create: '/api/v1/boards',
    update: (id: string) => `/api/v1/boards/${id}`,
    moveTask: (id: string) => `/api/v1/boards/${id}/tasks/move`,
  },
};

export default API_CONFIG;
