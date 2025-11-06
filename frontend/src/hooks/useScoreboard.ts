import { useQuery } from '@tanstack/react-query'
import { getScoreboard } from '../services/organizationService'

/**
 * Hook to fetch and manage scoreboard data
 * Polls every 30 seconds to keep scoreboard up to date
 */
export function useScoreboard(projectId?: string) {
  return useQuery({
    queryKey: ['scoreboard', projectId],
    queryFn: () => getScoreboard(projectId),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
  })
}
