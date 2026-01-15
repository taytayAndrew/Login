/**
 * Common TypeScript type definitions
 */

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  timezone?: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

// Project Management types
export enum ProjectRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TaskType {
  STORY = 'STORY',
  BUG = 'BUG',
  TASK = 'TASK',
  EPIC = 'EPIC',
  SUBTASK = 'SUBTASK',
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  archived: boolean;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  methodology: 'SCRUM' | 'KANBAN' | 'TRADITIONAL';
  workspace: Workspace;
  projectLead: User;
  startDate?: string;
  endDate?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  taskKey: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  project: Project;
  assignee?: User;
  reporter: User;
  storyPoints?: number;
  estimatedHours?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  project: Project;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  startDate: string;
  endDate: string;
  capacity?: number;
  velocity?: number;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  type: 'KANBAN' | 'SCRUM';
  project: Project;
  columns: BoardColumn[];
  createdAt: string;
}

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  wipLimit?: number;
  mappedStatus: TaskStatus;
}
