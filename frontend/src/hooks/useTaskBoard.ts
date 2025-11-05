import { useQuery } from '@tanstack/react-query'
import apiClient from '../services/apiClient'
import type { TasksResponse } from '../types/task'

export interface TaskBoardFilters {
  type?: string
  difficulty?: string
  minReward?: string
  maxReward?: string
  page?: number
}

/**
 * Custom hook for fetching task board data with automatic polling
 *
 * Features:
 * - 30-second automatic polling
 * - Manual refresh capability via refetch()
 * - Automatic refresh on window focus
 * - Filter support (type, difficulty, reward range, pagination)
 */
export function useTaskBoard(filters: TaskBoardFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      // Add pagination (default to page 1)
      params.append('page', (filters.page || 1).toString())

      // Add optional filters
      if (filters.type) params.append('type', filters.type)
      if (filters.difficulty) params.append('difficulty', filters.difficulty)
      if (filters.minReward) params.append('minReward', filters.minReward)
      if (filters.maxReward) params.append('maxReward', filters.maxReward)

      const response = await apiClient.get<TasksResponse>(`/api/tasks?${params}`)
      return response.data
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  })
}
