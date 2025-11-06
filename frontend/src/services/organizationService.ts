import apiClient from './apiClient'
import type {
  Organization,
  OrganizationScoreboard,
  Project,
  ProjectProgress,
} from '../types/organization'

/**
 * Get all organizations
 */
export async function getAllOrganizations() {
  const response = await apiClient.get<Organization[]>('/api/organizations')
  return response.data
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string) {
  const response = await apiClient.get<Organization>(`/api/organizations/${id}`)
  return response.data
}

/**
 * Get organization scoreboard
 * @param projectId Optional project ID to filter by
 */
export async function getScoreboard(projectId?: string) {
  const params = projectId ? { projectId } : {}
  const response = await apiClient.get<OrganizationScoreboard[]>(
    '/api/organizations/scoreboard/current',
    { params }
  )
  return response.data
}

/**
 * Get all projects
 */
export async function getAllProjects() {
  const response = await apiClient.get<Project[]>('/api/projects')
  return response.data
}

/**
 * Get active project
 */
export async function getActiveProject() {
  const response = await apiClient.get<Project>('/api/projects/active')
  return response.data
}

/**
 * Get project by ID
 */
export async function getProjectById(id: string) {
  const response = await apiClient.get<Project>(`/api/projects/${id}`)
  return response.data
}

/**
 * Get project progress for all organizations
 */
export async function getProjectProgress(projectId: string) {
  const response = await apiClient.get<ProjectProgress[]>(
    `/api/projects/${projectId}/progress`
  )
  return response.data
}
