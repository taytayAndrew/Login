/**
 * Application Store using Zustand
 * Manages global application state
 */

import { create } from 'zustand';

interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  
  // Current Context
  currentWorkspaceId: string | null;
  currentProjectId: string | null;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentWorkspace: (workspaceId: string | null) => void;
  setCurrentProject: (projectId: string | null) => void;
}

export const useAppStore = create<AppState>(set => ({
  // Initial state
  sidebarCollapsed: false,
  theme: 'light',
  currentWorkspaceId: null,
  currentProjectId: null,

  // Actions
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setSidebarCollapsed: collapsed => set({ sidebarCollapsed: collapsed }),
  
  setTheme: theme => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  
  setCurrentWorkspace: workspaceId => set({ currentWorkspaceId: workspaceId }),
  
  setCurrentProject: projectId => set({ currentProjectId: projectId }),
}));

export default useAppStore;
