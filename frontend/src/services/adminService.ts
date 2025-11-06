// Admin Service
// API calls for admin CMS functionality

import apiClient from './apiClient'
import type { TaskTemplate, AdminProject, AdminUser, AdminTask } from '../types/admin'

// Re-export for convenience
export type { TaskTemplate, AdminProject, AdminUser, AdminTask }

// ============================================================================
// Dashboard
// ============================================================================

export interface DashboardStats {
  stats: {
    totalUsers: number
    totalOrganizations: number
    totalProjects: number
    totalTasks: number
  }
  activeProject: any
  recentUsers: any[]
}

export async function getDashboardStats() {
  const response = await apiClient.get<DashboardStats>('/api/admin/dashboard')
  return response.data
}

// ============================================================================
// User Management
// ============================================================================

export interface UsersResponse {
  users: AdminUser[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

export async function getUsers(params?: {
  page?: number
  limit?: number
  search?: string
  organizationId?: string
}) {
  const response = await apiClient.get<UsersResponse>('/api/admin/users', { params })
  return response.data
}

export async function updateUser(
  userId: string,
  data: {
    isAdmin?: boolean
    organizationId?: string | null
    tokenBalance?: number
  }
) {
  const response = await apiClient.patch(`/api/admin/users/${userId}`, data)
  return response.data
}

// ============================================================================
// Organization Management
// ============================================================================

export async function createOrganization(data: { name: string; description?: string }) {
  const response = await apiClient.post('/api/admin/organizations', data)
  return response.data
}

export async function updateOrganization(
  orgId: string,
  data: { name?: string; description?: string }
) {
  const response = await apiClient.patch(`/api/admin/organizations/${orgId}`, data)
  return response.data
}

export async function deleteOrganization(orgId: string) {
  const response = await apiClient.delete(`/api/admin/organizations/${orgId}`)
  return response.data
}

// ============================================================================
// Project Management
// ============================================================================

export async function getAdminProjects() {
  const response = await apiClient.get<AdminProject[]>('/api/admin/projects')
  return response.data
}

export async function createProject(data: {
  name: string
  description?: string
  scheduledStartTime?: string
  taskTemplates: TaskTemplate[]
}) {
  const response = await apiClient.post('/api/projects', data)
  return response.data
}

export async function updateProject(
  projectId: string,
  data: {
    name?: string
    description?: string
    scheduledStartTime?: string | null
  }
) {
  const response = await apiClient.patch(`/api/admin/projects/${projectId}`, data)
  return response.data
}

export async function deleteProject(projectId: string) {
  const response = await apiClient.delete(`/api/admin/projects/${projectId}`)
  return response.data
}

export async function activateProject(projectId: string) {
  const response = await apiClient.post(`/api/projects/${projectId}/activate`)
  return response.data
}

export async function completeProject(projectId: string) {
  const response = await apiClient.post(`/api/projects/${projectId}/complete`)
  return response.data
}

export async function scheduleProject(projectId: string, scheduledStartTime: string) {
  const response = await apiClient.post(`/api/projects/${projectId}/schedule`, {
    scheduledStartTime,
  })
  return response.data
}

// ============================================================================
// Task Management
// ============================================================================

export interface TasksResponse {
  tasks: AdminTask[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

export async function getTasks(params?: {
  page?: number
  limit?: number
  projectId?: string
  organizationId?: string
  status?: string
}) {
  const response = await apiClient.get<TasksResponse>('/api/admin/tasks', { params })
  return response.data
}

export async function deleteTask(taskId: string) {
  const response = await apiClient.delete(`/api/admin/tasks/${taskId}`)
  return response.data
}
