// Initiative Service
// API calls for initiative management

import apiClient from './apiClient';
import type { Initiative, CreateInitiativeDto, UpdateInitiativeDto } from '../types/initiative';

export interface GetInitiativesParams {
  projectId?: string;
  status?: 'active' | 'completed' | 'archived';
  creatorId?: string;
  includeTasks?: boolean;
}

export interface InitiativesResponse {
  initiatives: Initiative[];
  count: number;
}

export interface InitiativeResponse {
  initiative: Initiative;
}

export interface CreateInitiativeResponse {
  message: string;
  initiative: Initiative;
}

export interface UpdateInitiativeResponse {
  message: string;
  initiative: Initiative;
}

export interface DeleteInitiativeResponse {
  success: boolean;
  message: string;
}

/**
 * Create a new initiative
 */
export async function createInitiative(data: CreateInitiativeDto): Promise<CreateInitiativeResponse> {
  const response = await apiClient.post<CreateInitiativeResponse>('/api/initiatives', data);
  return response.data;
}

/**
 * Get all initiatives with optional filters
 */
export async function getInitiatives(params?: GetInitiativesParams): Promise<InitiativesResponse> {
  const response = await apiClient.get<InitiativesResponse>('/api/initiatives', { params });
  return response.data;
}

/**
 * Get a single initiative by ID
 */
export async function getInitiativeById(id: string): Promise<InitiativeResponse> {
  const response = await apiClient.get<InitiativeResponse>(`/api/initiatives/${id}`);
  return response.data;
}

/**
 * Update an initiative
 */
export async function updateInitiative(
  id: string,
  data: UpdateInitiativeDto
): Promise<UpdateInitiativeResponse> {
  const response = await apiClient.patch<UpdateInitiativeResponse>(`/api/initiatives/${id}`, data);
  return response.data;
}

/**
 * Delete an initiative
 */
export async function deleteInitiative(id: string): Promise<DeleteInitiativeResponse> {
  const response = await apiClient.delete<DeleteInitiativeResponse>(`/api/initiatives/${id}`);
  return response.data;
}
